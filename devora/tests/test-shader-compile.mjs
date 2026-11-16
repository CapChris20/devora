import { chromium } from "playwright";

const testShader = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uTheme;

#define OFFSET_ROW

mat2 rot2(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(27.619, 57.583))) * 43758.5453);
}

vec2 cellID;

vec2 hash22B(vec2 p) {
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(262144.0, 32768.0) * n) * 2.0 - 1.0;
}

float n2D3G(vec2 p) {
  vec2 i = floor(p);
  p -= i;

  vec4 v;
  v.x = dot(hash22B(i), p);
  v.y = dot(hash22B(i + vec2(1.0, 0.0)), p - vec2(1.0, 0.0));
  v.z = dot(hash22B(i + vec2(0.0, 1.0)), p - vec2(0.0, 1.0));
  v.w = dot(hash22B(i + 1.0), p - 1.0);

  p = p * p * (3.0 - 2.0 * p);
  return mix(mix(v.x, v.y, p.x), mix(v.z, v.w, p.x), p.y);
}

float fBm(vec2 p) {
  return n2D3G(p) * 0.66 + n2D3G(p * 2.0) * 0.34;
}

float bMap(vec2 p) {
  p *= rot2(-3.14159 / 5.0);

#ifdef OFFSET_ROW
  if (mod(floor(p.y), 2.0) < 0.5) p.x += 0.5;
#endif

  vec2 ip = floor(p);
  p -= ip + 0.5;
  cellID = ip;

  float ang = -3.14159 * 3.0 / 5.0 + (fBm(ip / 8.0 + uTime / 3.0)) * 6.2831 * 2.0;
  vec2 offs = vec2(cos(ang), sin(ang)) * 0.35;

  if (p.x < offs.x) p.x = 1.0 - (p.x + 0.5) / abs(offs.x + 0.5);
  else p.x = (p.x - offs.x) / (0.5 - offs.x);

  if (p.y < offs.y) p.y = 1.0 - (p.y + 0.5) / abs(offs.y + 0.5);
  else p.y = (p.y - offs.y) / (0.5 - offs.y);

  return 1.0 - max(p.x, p.y);
}

vec3 doBumpMap(vec2 p, vec3 n, float bumpfactor, inout float edge) {
  vec2 e = vec2(0.025, 0.0);

  float f = bMap(p);
  float fx = bMap(p - e.xy);
  float fy = bMap(p - e.yx);
  float fx2 = bMap(p + e.xy);
  float fy2 = bMap(p + e.yx);

  vec3 grad = vec3(fx - fx2, fy - fx2, 0.0) / e.x / 2.0;

  edge = length(vec2(fx, fy) + vec2(fx2, fy2) - f * 2.0);
  edge = smoothstep(0.0, 1.0, edge / e.x);

  grad -= n * dot(n, grad);
  return normalize(n + grad * bumpfactor);
}

// Devora Brand Inks
vec3 tintDarkBrutalist(float cel) {
  vec3 inkTrench   = vec3(0.035, 0.016, 0.065); // #090411
  vec3 deepViolet  = vec3(0.200, 0.055, 0.340); // Deep violet
  vec3 hotPink     = vec3(1.000, 0.361, 0.659); // #ff5ca8
  vec3 emberOrange = vec3(1.000, 0.604, 0.239); // #ff9a3d
  vec3 peakGold    = vec3(1.000, 0.880, 0.550); // #ffeb99

  if (cel < 0.15) return mix(inkTrench, deepViolet, cel / 0.15);
  if (cel < 0.45) return mix(deepViolet, hotPink, (cel - 0.15) / 0.30);
  if (cel < 0.75) return mix(hotPink, emberOrange, (cel - 0.45) / 0.30);
  return mix(emberOrange, peakGold, (cel - 0.75) / 0.25);
}

vec3 tintLightBrutalist(float cel) {
  vec3 paperWhite  = vec3(0.965, 0.945, 0.975); // Clean light poster paper
  vec3 deepViolet  = vec3(0.350, 0.090, 0.450); 
  vec3 hotPink     = vec3(1.000, 0.320, 0.620); // #ff5ca8
  vec3 emberOrange = vec3(1.000, 0.580, 0.220); // #ff9a3d
  vec3 inkEdge     = vec3(0.060, 0.025, 0.100);

  if (cel < 0.15) return mix(inkEdge, deepViolet, cel / 0.15);
  if (cel < 0.45) return mix(deepViolet, hotPink, (cel - 0.15) / 0.30);
  if (cel < 0.75) return mix(hotPink, emberOrange, (cel - 0.45) / 0.30);
  return mix(emberOrange, paperWhite, (cel - 0.75) / 0.25);
}

void main() {
  float iRes = min(uResolution.y, 800.0);
  vec2 uv = (gl_FragCoord.xy - uResolution.xy * 0.5) / iRes;
  vec3 rd = normalize(vec3(uv, 0.5));

  // Slightly larger, bolder scales for strong graphic presence (7.5 vs 10.0)
  float gSc = 7.5;
  vec2 p = uv * gSc + vec2(0.0, uTime / 2.8);

  float m = bMap(p);

  vec3 n = vec3(0.0, 0.0, -1.0);
  float edge = 0.0;
  float bumpFactor = 0.35;
  n = doBumpMap(p, n, bumpFactor, edge);

  // Key directional light (high contrast upper-left light source)
  vec3 ld = normalize(vec3(0.65, 0.75, -1.0));
  float diff = max(dot(n, ld), 0.0);

  // Stepped cel-shading light curve
  float rawLight = diff * 0.75 + m * 0.35;

  // Neo-brutalist discrete cel quantization (4 sharp tone bands)
  float cel;
  if (rawLight > 0.68) {
    cel = 0.90; // Highlight facet (Gold)
  } else if (rawLight > 0.42) {
    cel = 0.60; // Direct lit facet (Ember / Orange)
  } else if (rawLight > 0.20) {
    cel = 0.32; // Midtone facet (Hot Pink)
  } else {
    cel = 0.08; // Deep shadow facet (Violet / Trench)
  }

  // Hard 3D offset drop shadow (stepped sample to bottom-right)
  float shadowSample = bMap(p + vec2(0.08, -0.08));
  if (shadowSample > m + 0.16) {
    cel = min(cel, 0.05); // Cast hard dark drop shadow
  }

  // 45-degree crisp graphic comic screen hatching in the shadow zones
  float hatchCoord = gl_FragCoord.x + gl_FragCoord.y;
  float hatch = step(3.5, mod(hatchCoord, 7.0)); // 3.5px line, 3.5px gap
  if (cel < 0.18) {
    cel = mix(0.02, cel, hatch);
  } else if (cel < 0.38) {
    cel = mix(0.18, cel, hatch);
  }

  // Neo-brutalist solid ink lines at cell trenches and ridge creases
  float inkLine = step(0.24, edge) + (1.0 - smoothstep(0.03, 0.09, m));
  inkLine = clamp(inkLine, 0.0, 1.0);

  // Apply colors
  vec3 surfaceColor = mix(tintDarkBrutalist(cel), tintLightBrutalist(cel), uTheme);
  vec3 inkColor = mix(vec3(0.031, 0.016, 0.059), vec3(0.070, 0.030, 0.110), uTheme);

  vec3 finalColor = mix(surfaceColor, inkColor, inkLine);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

async function run() {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage();
  const result = await page.evaluate((fs) => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return { error: "No WebGL" };

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, "attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }");
    gl.compileShader(vs);

    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fs);
    gl.compileShader(fShader);

    const ok = gl.getShaderParameter(fShader, gl.COMPILE_STATUS);
    const log = gl.getShaderInfoLog(fShader);
    return { ok, log };
  }, testShader);

  console.log("Compile result:", result);
  await browser.close();
}
run();
