export const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 iResolution;
  uniform float iTime;
  uniform vec3 iMouse;

  const int NUM_STEPS = 32;
  const float PI = 3.141592;
  const float EPSILON = 1e-3;

  const int ITER_GEOMETRY = 3;
  const int ITER_FRAGMENT = 5;
  const float SEA_HEIGHT = 0.6;
  const float SEA_CHOPPY = 4.0;
  const float SEA_SPEED = 0.8;
  const float SEA_FREQ = 0.16;

  #define SEA_TIME (1.0 + iTime * SEA_SPEED)
  #define EPSILON_NRM (0.1 / iResolution.x)

  const mat2 octave_m = mat2(1.6, 1.2, -1.2, 1.6);

  float diffuse(vec3 n, vec3 l, float p) {
    return pow(dot(n, l) * 0.4 + 0.6, p);
  }

  // Devora title gradient: #ff9a2e → #ff5ca8 → #ff006e → #a855f7 → #6b21a8
  vec3 devoraWaterGradient(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c0 = vec3(1.0, 0.604, 0.180);
    vec3 c1 = vec3(1.0, 0.361, 0.659);
    vec3 c2 = vec3(1.0, 0.0, 0.431);
    vec3 c3 = vec3(0.659, 0.333, 0.969);
    vec3 c4 = vec3(0.420, 0.129, 0.659);

    vec3 col;
    if (t < 0.38) col = mix(c0, c1, t / 0.38);
    else if (t < 0.58) col = mix(c1, c2, (t - 0.38) / 0.20);
    else if (t < 0.82) col = mix(c2, c3, (t - 0.58) / 0.24);
    else col = mix(c3, c4, (t - 0.82) / 0.18);

    return col * 0.52 + vec3(0.03, 0.008, 0.055);
  }

  float devoraWaterGradientT(vec3 p, vec3 n, vec3 l, vec3 dist) {
    float distT = clamp(length(dist) * 0.011, 0.0, 1.0);
    float waveT = clamp(1.0 - (p.y - SEA_HEIGHT + 0.12) * 1.6, 0.0, 1.0);
    float ripple = sin(p.x * 0.45 + p.z * 0.25 + SEA_TIME * 0.35) * 0.05;
    float gradT = mix(waveT, distT, 0.58) + ripple;
    gradT += (1.0 - diffuse(n, l, 36.0)) * 0.12;
    return clamp(gradT, 0.0, 1.0);
  }

  mat3 fromEuler(vec3 ang) {
    vec2 a1 = vec2(sin(ang.x), cos(ang.x));
    vec2 a2 = vec2(sin(ang.y), cos(ang.y));
    vec2 a3 = vec2(sin(ang.z), cos(ang.z));
    mat3 m;
    m[0] = vec3(a1.y * a3.y + a1.x * a2.x * a3.x, a1.y * a2.x * a3.x + a3.y * a1.x, -a2.y * a3.x);
    m[1] = vec3(-a2.y * a1.x, a1.y * a2.y, a2.x);
    m[2] = vec3(a3.y * a1.x * a2.x + a1.y * a3.x, a1.x * a3.x - a1.y * a3.y * a2.x, a2.y * a3.y);
    return m;
  }

  float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return -1.0 + 2.0 * mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float specular(vec3 n, vec3 l, vec3 e, float s) {
    float nrm = (s + 8.0) / (PI * 8.0);
    return pow(max(dot(reflect(e, n), l), 0.0), s) * nrm;
  }

  vec3 getSkyColor(vec3 e) {
    e.y = (max(e.y, 0.0) * 0.8 + 0.2) * 0.8;
    return vec3(pow(1.0 - e.y, 2.0), 1.0 - e.y, 0.6 + (1.0 - e.y) * 0.4) * 1.1;
  }

  float sea_octave(vec2 uv, float choppy) {
    uv += noise(uv);
    vec2 wv = 1.0 - abs(sin(uv));
    vec2 swv = abs(cos(uv));
    wv = mix(wv, swv, wv);
    return pow(1.0 - pow(wv.x * wv.y, 0.65), choppy);
  }

  float map(vec3 p) {
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz;
    uv.x *= 0.75;

    float d, h = 0.0;
    for (int i = 0; i < ITER_GEOMETRY; i++) {
      d = sea_octave((uv + SEA_TIME) * freq, choppy);
      d += sea_octave((uv - SEA_TIME) * freq, choppy);
      h += d * amp;
      uv *= octave_m;
      freq *= 1.9;
      amp *= 0.22;
      choppy = mix(choppy, 1.0, 0.2);
    }
    return p.y - h;
  }

  float map_detailed(vec3 p) {
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz;
    uv.x *= 0.75;

    float d, h = 0.0;
    for (int i = 0; i < ITER_FRAGMENT; i++) {
      d = sea_octave((uv + SEA_TIME) * freq, choppy);
      d += sea_octave((uv - SEA_TIME) * freq, choppy);
      h += d * amp;
      uv *= octave_m;
      freq *= 1.9;
      amp *= 0.22;
      choppy = mix(choppy, 1.0, 0.2);
    }
    return p.y - h;
  }

  vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist) {
    float fresnel = clamp(1.0 - dot(n, -eye), 0.0, 1.0);
    fresnel = min(fresnel * fresnel * fresnel, 0.2);

    vec3 reflected = getSkyColor(reflect(eye, n));
    float gradT = devoraWaterGradientT(p, n, l, dist);
    gradT = clamp(gradT * 0.82 + 0.12, 0.0, 1.0);

    vec3 refracted = devoraWaterGradient(gradT);
    refracted *= 0.62 + diffuse(n, l, 64.0) * 0.14;

    vec3 color = mix(refracted, reflected, fresnel);

    float atten = max(1.0 - dot(dist, dist) * 0.001, 0.0);
    color += devoraWaterGradient(min(gradT + 0.1, 1.0)) * (p.y - SEA_HEIGHT) * 0.16 * atten;
    color += devoraWaterGradient(0.2) * specular(n, l, eye, 600.0 * inversesqrt(dot(dist, dist))) * 0.22;

    return color;
  }

  vec3 getNormal(vec3 p, float eps) {
    vec3 n;
    n.y = map_detailed(p);
    n.x = map_detailed(vec3(p.x + eps, p.y, p.z)) - n.y;
    n.z = map_detailed(vec3(p.x, p.y, p.z + eps)) - n.y;
    n.y = eps;
    return normalize(n);
  }

  vec4 heightMapTracing(vec3 ori, vec3 dir) {
    vec3 p = ori;
    float tm = 0.0;
    float tx = 1000.0;
    float hx = map(ori + dir * tx);
    if (hx > 0.0) {
      p = ori + dir * tx;
      return vec4(p, tx);
    }
    float hm = map(ori);
    for (int i = 0; i < NUM_STEPS; i++) {
      float tmid = mix(tm, tx, hm / (hm - hx));
      p = ori + dir * tmid;
      float hmid = map(p);
      if (hmid < 0.0) {
        tx = tmid;
        hx = hmid;
      } else {
        tm = tmid;
        hm = hmid;
      }
      if (abs(hmid) < EPSILON) break;
    }
    return vec4(p, mix(tm, tx, hm / (hm - hx)));
  }

  vec3 getPixel(vec2 coord, float time) {
    vec2 uv = coord / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    vec3 ang = vec3(sin(time * 3.0) * 0.1, sin(time) * 0.2 + 0.3, time);
    vec3 ori = vec3(0.0, 3.5, time * 5.0);
    vec3 dir = normalize(vec3(uv.xy, -2.0));
    dir.z += length(uv) * 0.14;
    dir = normalize(dir) * fromEuler(ang);

    vec3 p = heightMapTracing(ori, dir).xyz;
    vec3 dist = p - ori;
    vec3 n = getNormal(p, dot(dist, dist) * EPSILON_NRM);
    vec3 light = normalize(vec3(0.0, 1.0, 0.8));

    return mix(
      getSkyColor(dir),
      getSeaColor(p, n, light, dir, dist),
      pow(smoothstep(0.0, -0.02, dir.y), 0.2)
    );
  }

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float time = iTime * 0.3 + iMouse.x * 0.01;
    vec3 color = getPixel(fragCoord, time);

    vec2 q = fragCoord.xy / iResolution.xy;
    vec2 v = -1.0 + 2.0 * q;
    v.x *= iResolution.x / iResolution.y;
    float vign = smoothstep(4.0, 0.6, length(v));

    color = pow(vign * color, vec3(0.65));
    fragColor = vec4(color, 1.0);
  }

  void main() {
    vec4 color = vec4(0.0);
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
  }
`;
