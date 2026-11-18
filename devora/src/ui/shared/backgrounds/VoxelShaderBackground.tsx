// Hexagonal Voronoi kaleidoscope tunnel animated background for the Account Page.
// Adapted from Shane's Shadertoy Voronoi (https://www.shadertoy.com/view/ltK3WD).
// Styled in Devora's signature Neo-Brutalist Secondary Gradient aesthetic:
// - Secondary gradient palette (Gold #ffd76f -> Orange #ff9a3d -> Pink #ff5ca8 -> Magenta #ff2bd6)
// - Sharp 2-3px graphic ink outlines along facet ridges and cell borders
// - Stepped cel shading and comic screen hatching on shadow facets
// - High-contrast theme adaptation for dark and light modes

"use client";

// ===== IMPORTS =====

import ShaderBackgroundCanvas from "./ShaderBackgroundCanvas";

// ===== NAMED CONSTANTS =====

const ACCOUNT_FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uTheme;

#define iResolution vec3(uResolution.x, uResolution.y, 1.0)
#define iTime uTime

// ===== DEVORA NEO-BRUTALIST SECONDARY GRADIENT PALETTE =====
// Signature Devora gradient stops: Gold -> Orange -> Pink -> Magenta
const vec3 GRAD_GOLD    = vec3(1.000, 0.843, 0.435); // #ffd76f
const vec3 GRAD_ORANGE  = vec3(1.000, 0.604, 0.239); // #ff9a3d
const vec3 GRAD_PINK    = vec3(1.000, 0.361, 0.659); // #ff5ca8
const vec3 GRAD_MAGENTA = vec3(1.000, 0.169, 0.839); // #ff2bd6

// Neo-brutalist ink lines & canvas tones
const vec3 INK_DARK     = vec3(0.035, 0.016, 0.065); // #090411 ink outline
const vec3 INK_LIGHT    = vec3(0.039, 0.039, 0.039); // #0a0a0a ink outline
const vec3 BG_DARK      = vec3(0.031, 0.016, 0.059); // #08040f
const vec3 BG_LIGHT     = vec3(0.950, 0.945, 0.940); // #f2f2f0

// Shane's Voronoi kernel (https://www.shadertoy.com/view/ltK3WD)
vec4 voro(vec2 uv) {
  vec2 g = floor(uv);
  vec2 f = fract(uv);
  vec2 p, cp;
  float t = iTime * 0.05;
  float d = 1.0, k;

  // 5x5 cell neighborhood search
  for (int x = -2; x <= 2; x++) {
    for (int y = -2; y <= 2; y++) {
      p = vec2(float(x), float(y));
      p += 0.5 + 0.35 * sin(t * 10.0 + 9.0 * fract(sin((g + p) * mat2(2.0, 5.0, 5.0, 2.0)))) - f;
      k = max(abs(p.x) * 0.8660254 - p.y * 0.5, p.y);
      if (k < d) {
        d = k;
        cp = p;
      }
    }
  }

  // 3 isometric facet planes
  float f1 = -cp.x * 0.8660254 - cp.y * 0.5;
  float f2 =  cp.x * 0.8660254 - cp.y * 0.5;
  float f3 =  cp.y;

  // Determine facet index based on Shane's normal metric
  int face = 3;
  if (f1 >= f2 && f1 >= f3) {
    face = 1;
  } else if (f2 >= f3) {
    face = 2;
  } else {
    face = 3;
  }

  // Neo-brutalist secondary gradient color per isometric facet:
  // Face 1 (Highlight facet): Gold -> Orange
  // Face 2 (Midtone facet):   Orange -> Pink
  // Face 3 (Shadow facet):    Pink -> Magenta
  vec3 faceColor;
  float celBand;
  if (face == 1) {
    faceColor = mix(GRAD_GOLD, GRAD_ORANGE, clamp(d * 2.0, 0.0, 1.0));
    celBand = 0.98;
  } else if (face == 2) {
    faceColor = mix(GRAD_ORANGE, GRAD_PINK, clamp(d * 2.0, 0.0, 1.0));
    celBand = 0.78;
  } else {
    faceColor = mix(GRAD_PINK, GRAD_MAGENTA, clamp(d * 2.0, 0.0, 1.0));
    celBand = 0.55;
  }

  // Shane's sqrt(d * 1.5) depth lighting with discrete cel steps
  float depthFactor = sqrt(clamp(d * 1.5, 0.0, 1.0));
  float cel = floor(depthFactor * 4.0 + 0.5) / 4.0;
  vec3 col = faceColor * celBand * (0.6 + 0.4 * cel);

  // Comic screen tone on shadow facet (Face 3)
  float hatch = step(3.5, mod(gl_FragCoord.x + gl_FragCoord.y, 7.0));
  if (face == 3) {
    col = mix(col * 0.78, col, hatch);
  }

  // Crisp graphic ink outlines along facet ridges & hexagon borders
  float maxF = max(f1, max(f2, f3));
  float secondF = max(min(f1, f2), min(max(f1, f2), f3));
  float ridge = maxF - secondF;

  float crease = 1.0 - smoothstep(0.012, 0.038, ridge);
  float border = smoothstep(0.38, 0.44, d);
  float inkLine = clamp(max(crease, border), 0.0, 1.0);

  vec3 inkCol = mix(INK_DARK, INK_LIGHT, uTheme);
  col = mix(col, inkCol, inkLine);

  return vec4(col, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 g = fragCoord;
  vec2 si = iResolution.xy;
  vec2 uv = (g + g - si) / si.y;

  // Kaleidoscope symmetry from Shane's shader
  uv.x = abs(uv.x);

  float a = atan(uv.x, uv.y) * 2.0;
  float r = length(uv);

  // Tunnel coordinate transform
  uv = vec2(a, r / dot(uv, uv));

  // Dynamic forward tunnel motion
  uv.y += iTime * 0.85;

  // Shane's depth vignette
  vec4 v = voro(uv);
  float vignette = 1.0 - 1.0 / (1.0 + r * r * 8.0);

  vec3 bgColor = mix(BG_DARK, BG_LIGHT, uTheme);
  vec3 finalCol = mix(bgColor, v.rgb, clamp(vignette, 0.0, 1.0));

  fragColor = vec4(finalCol, 1.0);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

// ===== TYPES =====

export type VoxelShaderBackgroundProps = {
  className?: string;
  fixed?: boolean;
};

// ===== MAIN COMPONENT =====

/**
 * Account page animated background: Shane's hexagonal Voronoi tunnel in neo-brutalist secondary gradients.
 * Uses low-power WebGL quad with discrete cel-shading, comic hatching, and ink borders.
 */
export default function VoxelShaderBackground({
  className,
  fixed,
}: VoxelShaderBackgroundProps) {
  return (
    <ShaderBackgroundCanvas
      className={className}
      fixed={fixed}
      fragmentShaderSource={ACCOUNT_FRAGMENT_SHADER_SOURCE}
      resolutionScale={0.75}
    />
  );
}

// Export alias for clarity
export { VoxelShaderBackground as VoronoiTunnelShaderBackground };
