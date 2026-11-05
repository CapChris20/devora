// Halftone Dots animated background for the Discovery Grid page.
// Recolored to Devora's signature Orange -> Pink -> Magenta gradient palette.

"use client";

// ===== IMPORTS =====

import ShaderBackgroundCanvas from "./ShaderBackgroundCanvas";

// ===== NAMED CONSTANTS =====

const HALFTONE_FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uTheme;

#define iResolution vec3(uResolution.x, uResolution.y, 1.0)
#define iTime uTime
#define iMouse vec4(0.0)

const float SPEED     = 0.6;
const float DENSITY   = 64.0;
const float ANGLE_DEG = 25.0;
const float CONTRAST  = 1.2;

// Devora Brand Colors:
const vec3 INK_PINK    = vec3(1.000, 0.361, 0.659); // #ff5ca8
const vec3 INK_ORANGE  = vec3(1.000, 0.604, 0.239); // #ff9a3d
const vec3 INK_MAGENTA = vec3(1.000, 0.169, 0.839); // #ff2bd6

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float field(vec2 p, float t) {
  vec2 c = vec2(sin(t * 0.5) * 0.3, cos(t * 0.4) * 0.2);
  float r = length(p - c);
  float sphere = sqrt(max(0.0, 1.0 - (r / 0.55) * (r / 0.55)));
  vec3 n = vec3((p - c) / 0.55, sphere);
  float l = clamp(dot(n, normalize(vec3(-0.5, 0.6, 0.6))), 0.0, 1.0) * step(r, 0.55);
  float w = 0.5 + 0.5 * sin(p.x * 3.0 + sin(p.y * 2.5 + t) * 1.5 - t * 0.8);
  return clamp(max(l, w * 0.55 * smoothstep(0.3, 1.2, r)), 0.0, 1.0);
}

float dots(vec2 uv, float ang, float t, float bias) {
  vec2 g = rot(ang) * uv * DENSITY;
  vec2 cell = floor(g) + 0.5;
  vec2 f = g - cell;
  vec2 cuv = rot(-ang) * (cell / DENSITY);
  float lum = clamp((field(cuv, t) + bias) * CONTRAST, 0.0, 1.0);
  float r = sqrt(lum) * 0.72;
  float aa = DENSITY * 1.5 / iResolution.y;
  return 1.0 - smoothstep(r - aa, r + aa, length(f));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  float t = iTime * SPEED;

  // y spans -1..1, aspect-correct
  vec2 uv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

  vec2 look = iMouse.z > 0.0 ? (iMouse.xy / iResolution.xy - 0.5) : vec2(0.0);
  uv += look * 0.3;

  float a  = radians(ANGLE_DEG);
  float d1 = dots(uv, a, t, 0.0);
  float d2 = dots(uv, a + 1.309, t * 0.9 + 3.0, -0.1);

  vec3 col;
  if (uTheme < 0.5) {
    // Dark mode: Devora Night background (#0d0b0e) with glowing Pink, Orange, and Magenta halftone screens
    vec3 night = vec3(0.051, 0.043, 0.055);
    col = night + INK_MAGENTA * (d1 * 0.4) + INK_PINK * (d1 * 1.0) + INK_ORANGE * (d2 * 0.95);
  } else {
    // Light mode: clean pearl paper background with rich Devora brand inks
    vec3 paper = vec3(0.97, 0.95, 0.98);
    col = paper;
    col = mix(col, INK_PINK, d1 * 0.82);
    col = mix(col, INK_ORANGE, d2 * 0.72);
  }

  col = clamp(col, 0.0, 1.0);
  col *= 1.0 - 0.12 * dot(uv, uv); // light vignette

  fragColor = vec4(col, 1.0);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

// ===== TYPES =====

export type HexblocksShaderBackgroundProps = {
  className?: string;
  fixed?: boolean;
};

// ===== MAIN COMPONENT =====

export default function HexblocksShaderBackground({
  className,
  fixed,
}: HexblocksShaderBackgroundProps) {
  return (
    <ShaderBackgroundCanvas
      className={className}
      fixed={fixed}
      fragmentShaderSource={HALFTONE_FRAGMENT_SHADER_SOURCE}
      resolutionScale={0.75}
    />
  );
}
