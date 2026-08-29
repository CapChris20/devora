/**
 * Otavio Good terrain shader — recolored for Devora synthwave palette.
 *
 * Color mapping (original → Devora):
 *   Sun       warm yellow     → #FFE61A / #FF3399
 *   Sky       pink/purple     → #0D0026 / #66004D
 *   Terrain   orange/white    → #4D1A8C / #FF33CC
 *   Shadows   dark green      → #05031F
 *   Water     orange/red      → #66004D / #FF3399
 *   Glow ball green           → #ff5ca8 (DEVORA pink)
 *   Fog       salmon          → #66004D / #a855f7
 */

export const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;

  #define MOVING_SUN
  // MOTION_BLUR disabled — too heavy for integrated GPUs; causes black canvas

  float Hash2d(vec2 uv) {
    float f = uv.x + uv.y * 47.0;
    return fract(cos(f * 3.333) * 100003.9);
  }

  float PI = 3.14159265;

  vec3 saturate(vec3 a) { return clamp(a, 0.0, 1.0); }
  float saturate(float a) { return clamp(a, 0.0, 1.0); }

  vec3 RotateY(vec3 v, float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return vec3(c * v.x - s * v.z, v.y, s * v.x + c * v.z);
  }

  // Devora sun — yellow core (#FFE61A)
  vec3 sunCol = vec3(1.0, 0.9, 0.1);

  vec3 GetSunColorReflection(vec3 rayDir, vec3 sunDir) {
    vec3 localRay = normalize(rayDir);
    float dist = 1.0 - (dot(localRay, sunDir) * 0.5 + 0.5);
    float sunIntensity = 0.015 / dist;
    sunIntensity = pow(sunIntensity, 0.3) * 100.0;
    sunIntensity += exp(-dist * 12.0) * 300.0;
    sunIntensity = min(sunIntensity, 40000.0);
    return sunCol * sunIntensity * 0.0425;
  }

  vec3 GetSunColorSmall(vec3 rayDir, vec3 sunDir) {
    vec3 localRay = normalize(rayDir);
    float dist = 1.0 - (dot(localRay, sunDir) * 0.5 + 0.5);
    float sunIntensity = 0.05 / dist;
    sunIntensity += exp(-dist * 12.0) * 300.0;
    sunIntensity = min(sunIntensity, 40000.0);
  return sunCol * sunIntensity * 0.025;
  }

  vec4 CatmullRom(vec4 p0, vec4 p1, vec4 p2, vec4 p3, float t) {
    float t2 = t * t;
    float t3 = t * t * t;
    return 0.5 * ((2.0 * p1) +
      (-p0 + p2) * t +
      (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 +
      (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3);
  }

  const float nudge = 0.739513;
  const float normalizer = 0.8039;

  float SpiralNoiseC(vec3 p) {
    float n = 0.0;
    float iter = 1.0;
    for (int i = 0; i < 4; i++) {
      n += -abs(sin(p.y * iter) + cos(p.x * iter)) / iter;
      p.xy += vec2(p.y, -p.x) * nudge;
      p.xy *= normalizer;
      p.xz += vec2(p.z, -p.x) * nudge;
      p.xz *= normalizer;
      iter *= 1.733733;
    }
    return n;
  }

  float SpiralNoiseD(vec3 p) {
    float n = 0.0;
    float iter = 1.0;
    for (int i = 0; i < 3; i++) {
      n += abs(sin(p.y * iter) + cos(p.x * iter)) / iter;
      p.xy += vec2(p.y, -p.x) * nudge;
      p.xy *= normalizer;
      p.xz += vec2(p.z, -p.x) * nudge;
      p.xz *= normalizer;
      iter *= 1.733733;
    }
    return n;
  }

  float SpiralNoise3D(vec3 p) {
    float n = 0.0;
    float iter = 1.0;
    for (int i = 0; i < 3; i++) {
      n += (sin(p.y * iter) + cos(p.x * iter)) / iter;
      p.xz += vec2(p.z, -p.x) * nudge;
      p.xz *= normalizer;
      iter *= 1.33733;
    }
    return n;
  }

  vec4 c00 = vec4(3.5, 2.0, 13.1, 0.0);
  vec4 c01 = vec4(12.5, 2.2, 17.0, 0.0);
  vec4 c02 = vec4(21.5, 4.0, 8.1, 0.0);
  vec4 c03 = vec4(21.0, 5.0, 1.1, -0.5);
  vec4 c04 = vec4(17.8, 5.4, -0.2, 0.0);
  vec4 c05 = vec4(14.7, 2.5, 1.4, 0.0);
  vec4 c06 = vec4(7.9, 2.3, -2.1, 0.0);
  vec4 c07 = vec4(0.5, -0.7, -3.5, 1.0);
  vec4 c08 = vec4(-3.0, -1.0, -3.5, 1.3);
  vec4 c09 = vec4(-3.5, -1.0, 4.0, 1.3);
  vec4 c10 = vec4(3.0, -0.7, 3.3, 0.8);
  vec4 c11 = vec4(3.5, -1.0, -4.75, 0.0);
  vec4 c12 = vec4(-6.0, -0.2, 1.0, 3.14);
  vec4 c13 = vec4(-6.0, -1.0, 5.5, 0.0);

  float camPathOffset = 0.0;
  vec3 camPos = vec3(0.0);
  vec3 camFacing;
  vec3 camLookat = vec3(0.0, 0.0, 0.0);
  float waterLevel = 1.5;

  vec4 CamPos(float t) {
    t = mod(t, 14.0);
    float bigTime = floor(t);
    float smallTime = fract(t);
    if (bigTime == 0.0) return CatmullRom(c00, c01, c02, c03, smallTime);
    if (bigTime == 1.0) return CatmullRom(c01, c02, c03, c04, smallTime);
    if (bigTime == 2.0) return CatmullRom(c02, c03, c04, c05, smallTime);
    if (bigTime == 3.0) return CatmullRom(c03, c04, c05, c06, smallTime);
    if (bigTime == 4.0) return CatmullRom(c04, c05, c06, c07, smallTime);
    if (bigTime == 5.0) return CatmullRom(c05, c06, c07, c08, smallTime);
    if (bigTime == 6.0) return CatmullRom(c06, c07, c08, c09, smallTime);
    if (bigTime == 7.0) return CatmullRom(c07, c08, c09, c10, smallTime);
    if (bigTime == 8.0) return CatmullRom(c08, c09, c10, c11, smallTime);
    if (bigTime == 9.0) return CatmullRom(c09, c10, c11, c12, smallTime);
    if (bigTime == 10.0) return CatmullRom(c10, c11, c12, c13, smallTime);
    if (bigTime == 11.0) return CatmullRom(c11, c12, c13, c00, smallTime);
    if (bigTime == 12.0) return CatmullRom(c12, c13, c00, c01, smallTime);
    if (bigTime == 13.0) return CatmullRom(c13, c00, c01, c02, smallTime);
    return vec4(0.0);
  }

  float DistanceToObject(vec3 p) {
    float finalDist = p.y + 4.5;
    finalDist -= SpiralNoiseC(p.xyz);
    finalDist -= SpiralNoise3D(p);
    finalDist = min(finalDist, length(p) - 1.99);
    finalDist = min(finalDist, p.y + waterLevel);
    return finalDist;
  }

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy * 2.0 - 1.0;
    vec3 camUp = vec3(0.0, 1.0, 0.0);

    float mx = iMouse.x / iResolution.x * PI * 2.0;
    float my = -iMouse.y / iResolution.y * 10.0;
    camPos += vec3(cos(my) * cos(mx), sin(my), cos(my) * sin(mx)) * 5.2;

    float timeLine = iTime * 0.2 + camPathOffset;
    camFacing = camLookat + camPos;

    if (iTime != -1.0) {
      vec4 catmullA = CamPos(timeLine);
      vec4 catmullB = CamPos(timeLine + 0.3);
      #ifdef MOTION_BLUR
      vec4 catmullC = CamPos(timeLine + 0.004);
      vec4 catmullBlur = mix(catmullA, catmullC, Hash2d(uv));
      camPos = catmullBlur.xyz;
      camFacing = normalize(catmullB.xyz - catmullA.xyz);
      camFacing = RotateY(camFacing, -catmullBlur.w);
      #else
      camPos = catmullA.xyz;
      camFacing = normalize(catmullB.xyz - catmullA.xyz);
      camFacing = RotateY(camFacing, -catmullA.w);
      #endif
      camFacing = RotateY(camFacing, -mx);
      camLookat = camPos + camFacing;
    }

    vec3 camVec = normalize(camLookat - camPos);
    vec3 sideNorm = normalize(cross(camUp, camVec));
    vec3 upNorm = cross(camVec, sideNorm);
    vec3 worldFacing = camPos + camVec;
    vec3 worldPix = worldFacing + uv.x * sideNorm * (iResolution.x / iResolution.y) + uv.y * upNorm;
    vec3 relVec = normalize(worldPix - camPos);

    float dist = 0.05;
    float t = 0.0;
    float maxDepth = 110.0;
    vec3 pos = vec3(0.0);

    for (int i = 0; i < 48; i++) {
      if (t > maxDepth || abs(dist) < 0.012) break;
      pos = camPos + relVec * t;
      dist = DistanceToObject(pos);
      t += dist * 0.35;
    }

    #ifdef MOVING_SUN
    vec3 sunDir = normalize(vec3(sin(iTime * 0.047 - 1.5), cos(iTime * 0.047 - 1.5), -0.5));
    #else
    vec3 sunDir = normalize(vec3(0.93, 1.0, -1.5));
    #endif

    float skyMultiplier = saturate(sunDir.y + 0.7);
    vec3 finalColor = vec3(0.0);

    if (abs(dist) < 0.75) {
      vec3 smallVec = vec3(0.005, 0.0, 0.0);
      vec3 normal = vec3(
        dist - DistanceToObject(pos - smallVec.xyy),
        dist - DistanceToObject(pos - smallVec.yxy),
        dist - DistanceToObject(pos - smallVec.yyx)
      );
      normal = normalize(normal);

      float ambientS = 1.0;
      ambientS *= saturate(DistanceToObject(pos + normal * 0.4) * 2.5);
      float ambient = ambientS * saturate(DistanceToObject(pos + normal * 1.6) * 1.25 * 0.5);
      ambient = saturate(ambient);

      float sunShadow = 1.0;
      float iter = 0.2;
      for (int i = 0; i < 4; i++) {
        float tempDist = DistanceToObject(pos + sunDir * iter);
        sunShadow *= saturate(tempDist * 10.0);
        iter *= 1.8;
      }
      float sunSet = saturate(sunDir.y * 4.0);
      sunShadow = saturate(sunShadow) * sunSet;

      vec3 ref = reflect(relVec, normal);

      // Devora pink glow orb (#ff5ca8)
      vec3 ballGlow = vec3(1.0, 0.36, 0.66) * abs(SpiralNoise3D(vec3(iTime * 1.3)));

      // Terrain — purple mountains + pink stripes
      vec3 COL_MTN_LIGHT = vec3(0.3, 0.1, 0.55);   // #4D1A8C
      vec3 COL_MTN_STRIPE = vec3(1.0, 0.2, 0.8);   // #FF33CC
      vec3 COL_MTN_SHADOW = vec3(0.02, 0.01, 0.12); // #05031F
      vec3 COL_GRID = vec3(0.4, 0.0, 0.3);         // #66004D
      vec3 COL_SUN_BOT = vec3(1.0, 0.2, 0.6);      // #FF3399

      vec3 texColor = mix(
        COL_MTN_LIGHT,
        COL_MTN_STRIPE,
        pow(abs(SpiralNoise3D(pos * 1.0) - 1.0), 0.6)
      );
      texColor = mix(COL_MTN_SHADOW, texColor, saturate(normal.y));
      texColor = mix(texColor, COL_GRID, saturate(-0.4 - pos.y));
      texColor = mix(texColor, vec3(0.06, 0.0, 0.18), pow(saturate(pos.y * 0.125 + 0.5), 2.0));

      float rockLayers = abs(cos(pos.y * 1.5 + SpiralNoiseD(pos * vec3(1.0, 2.0, 1.0) * 4.0) * 0.2));
      texColor += vec3(0.66, 0.13, 0.97) * (1.0 - pow(rockLayers, 0.3)); // #a855f7 layers

      texColor = mix(texColor, COL_SUN_BOT + SpiralNoise3D(pos) * 0.025, saturate((-pos.y - 1.45) * 17.0));
      if (length(pos) <= 2.01) texColor = vec3(1.0);
      texColor = max(texColor, 0.05);

      // Lighting — Devora pink/purple hemisphere
      vec3 lightColor = vec3(1.0, 0.55, 0.75) * saturate(dot(sunDir, normal)) * sunShadow * 1.5;
      lightColor += vec3(0.63, 0.33, 0.97) * (dot(sunDir, normal) * 0.5 + 0.5) * ambient * 0.25 * skyMultiplier;

      float lp = length(pos) - 1.0;
      lightColor += ambientS * (ballGlow * 1.2 * saturate(dot(normal, -pos) * 0.5 + 0.5) / (lp * lp * lp * lp));

      finalColor = texColor * lightColor;

      vec3 refColor = GetSunColorReflection(ref, sunDir) * 0.68;
      finalColor += refColor * sunShadow * saturate(normal.y * normal.y) * saturate(-(pos.y + 1.35) * 16.0);
      finalColor += pow(saturate(1.0 - length(pos) * 0.4925), 0.65) * ballGlow * 6.1;

      // Fog — synthwave purple
      vec3 fogColor = COL_GRID * skyMultiplier + min(vec3(0.25), GetSunColorSmall(relVec, sunDir)) * 2.0 * sunSet;
      finalColor = mix(fogColor, finalColor, exp(-t * 0.03));
    } else {
      // Sky — deep purple gradient (#0D0026 → #66004D)
      vec3 skyTop = vec3(0.05, 0.0, 0.15);
      vec3 skyBot = vec3(0.4, 0.0, 0.3);
      finalColor = mix(skyTop, skyBot, saturate(relVec.y)) * skyMultiplier;
      finalColor += GetSunColorSmall(relVec, sunDir);
    }

    finalColor *= saturate(1.0 - length(uv / 2.5));
    finalColor *= 1.3;
    fragColor = vec4(sqrt(clamp(finalColor, 0.0, 1.0)), 1.0);
  }

  void main() {
    vec4 color = vec4(0.0);
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
  }
`;
