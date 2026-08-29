export const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 iResolution;
  uniform float iTime;
  uniform float uBass;

  const float horizon = 0.45;
  const vec3 COL_SUN_TOP = vec3(1.0, 0.9, 0.1);
  const vec3 COL_SUN_BOT = vec3(1.0, 0.2, 0.6);
  const vec3 COL_GRID = vec3(0.4, 0.0, 0.3);
  const vec3 COL_MTN_SHADOW = vec3(0.02, 0.01, 0.12);
  const vec3 COL_MTN_LIGHT = vec3(0.3, 0.1, 0.55);
  const vec3 COL_MTN_STRIPE = vec3(1.0, 0.2, 0.8);
  const vec3 COL_LIGHTNING = vec3(0.85, 0.95, 1.0);

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float getMtnNoise(float x, float seed) {
    float x_s = x + seed * 10.0;
    return sin(x_s * 32.0) * 0.012 + sin(x_s * 17.0) * 0.02 + cos(x_s * 11.0) * 0.025;
  }

  float sdMountain(vec2 p, float w, float h, float seed) {
    float jaggedH = h + getMtnNoise(p.x, seed);
    vec2 q = abs(p);
    return max(q.x * jaggedH + p.y * w, -p.y * w) - w * jaggedH * 0.5;
  }

  float getSun(vec2 uv, float aa) {
    float d = length(uv);
    float circle = smoothstep(0.22, 0.22 - aa, d);
    float bloom = smoothstep(0.6, 0.0, d);
    float stripes = clamp(sin(uv.y * 60.0 - iTime * 1.5) + (uv.y * 5.0 + 1.2), 0.0, 1.0);
    return (circle * stripes) + (bloom * 0.35);
  }

  float getGrid(vec2 uv, float aa) {
    float py = horizon - uv.y;
    if (py < 0.001) return 0.0;
    vec2 p = vec2((uv.x - 0.5) * (iResolution.x / iResolution.y) / py, 1.0 / py);
    p.y += iTime * 2.5;
    vec2 gridUV = abs(fract(p * 1.0) - 0.5);
    float thickness = 0.04;
    vec2 lines = smoothstep(thickness, thickness - (aa / py), gridUV);
    return clamp(lines.x + lines.y, 0.0, 1.0) * smoothstep(0.0, 0.1, py);
  }

  float getLightning(vec2 uv, float triggerIntensity, float seed, float aspect) {
    if (triggerIntensity <= 0.01) return 0.0;
    float randomPosX = hash12(vec2(seed, 1.0)) * aspect;
    vec2 centerUV = uv - vec2(randomPosX, 0.0);
    float noise = sin(centerUV.y * 12.0 + seed * 10.0) * 0.04 + sin(centerUV.y * 43.0) * 0.02;
    float dist = abs(centerUV.x - noise);
    return (0.0035 / max(dist, 0.0006) + 0.001 / max(dist, 0.015))
      * smoothstep(horizon + 0.02, horizon + 0.3, uv.y)
      * triggerIntensity;
  }

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float aspect = iResolution.x / iResolution.y;
    float pixel_aa = 1.5 / iResolution.y;
    vec3 finalCol = vec3(0.0);

    float fftBass = uBass;
    float lightningTrigger = pow(max(0.0, fftBass - 0.7), 2.5) * 15.0;
    float lightningSeed = floor(iTime * 20.0);

    finalCol = mix(vec3(0.05, 0.0, 0.15), vec3(0.4, 0.0, 0.3), uv.y);
    vec2 sunPos = vec2(0.25, 0.65);
    vec2 sunUV = vec2((uv.x - sunPos.x) * aspect, uv.y - sunPos.y);
    float sunVal = getSun(sunUV, pixel_aa);
    finalCol = mix(finalCol, mix(COL_SUN_BOT, COL_SUN_TOP, (uv.y - sunPos.y + 0.2) * 2.0), sunVal);

    if (uv.y > horizon) {
      vec2 lUV = vec2(uv.x * aspect, uv.y);
      finalCol += COL_LIGHTNING * getLightning(lUV, lightningTrigger, lightningSeed, aspect);
      finalCol += COL_LIGHTNING * lightningTrigger * 0.1 * smoothstep(horizon, 1.0, uv.y);
    }

    vec3 closestMtnCol = vec3(0.0);
    float bestDepth = 10.0;
    float maxCoverage = 0.0;
    float targetCount = clamp(aspect / 0.4, 5.0, 40.0);

    for (int i = 0; i < 40; i++) {
      float fi = float(i);
      if (fi >= targetCount) break;
      float mtnSeed = hash11(fi * 13.51 + 2.1);
      float xPos = (fi / (targetCount - 1.0)) * aspect;
      vec2 p = vec2(uv.x * aspect - xPos, uv.y - horizon);
      float d = sdMountain(p, 0.7 + mtnSeed * 0.3, 0.35 + hash11(fi + 0.7) * 0.3, mtnSeed);
      float edge = smoothstep(pixel_aa, -pixel_aa, d);
      maxCoverage = max(maxCoverage, edge);

      if (edge > 0.0 && mtnSeed < bestDepth) {
        bestDepth = mtnSeed;
        float side = step(0.0, p.x);
        vec3 currentCol = mix(COL_MTN_SHADOW, COL_MTN_LIGHT, side);
        currentCol += COL_LIGHTNING * lightningTrigger * side * 0.25;
        float waveSample = sin(p.y * 8.0 + mtnSeed * 10.0 + iTime) * 0.5;
        if (side > 0.5 && step(0.7, sin((p.x * 1.5 + p.y) * 120.0 + waveSample * 20.0)) > 0.5) {
          currentCol = mix(currentCol, COL_MTN_STRIPE, 0.3);
        }
        closestMtnCol = currentCol * smoothstep(-0.1, 0.4, p.y);
      }
    }
    finalCol = mix(finalCol, closestMtnCol, maxCoverage);

    if (uv.y < horizon) {
      float gridVal = getGrid(uv, pixel_aa);
      vec3 groundBase = mix(vec3(0.1, 0.0, 0.2), vec3(0.0, 0.0, 0.05), (horizon - uv.y) * 2.0);
      finalCol = mix(groundBase, COL_GRID, gridVal);
      finalCol += COL_LIGHTNING * lightningTrigger * 0.08 * (1.0 - smoothstep(0.0, 0.3, horizon - uv.y));
    }

    fragColor = vec4(pow(finalCol, vec3(0.95)), 1.0);
  }

  void main() {
    // Snap to pixel grid for retro chunky look
    const float PIXEL_SIZE = 7.0;
    vec2 pixCoord =
      floor(gl_FragCoord.xy / PIXEL_SIZE) * PIXEL_SIZE + PIXEL_SIZE * 0.5;

    vec4 color = vec4(0.0);
    mainImage(color, pixCoord);
    gl_FragColor = color;
  }
`;
