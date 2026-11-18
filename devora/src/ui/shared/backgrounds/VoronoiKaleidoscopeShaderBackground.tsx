// Shane's hexagonal Voronoi kaleidoscope tunnel (https://www.shadertoy.com/view/ltK3WD)
// Styled in Devora's signature Neo-Brutalist Secondary Gradient aesthetic.

"use client";

// ===== IMPORTS =====

import ShaderBackgroundCanvas from "./ShaderBackgroundCanvas";

// ===== NAMED CONSTANTS =====

const KALEIDOSCOPE_FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uTheme;

#define iResolution vec3(uResolution.x, uResolution.y, 1.0)
#define iTime uTime

// ===== DEVORA NEO-BRUTALIST SECONDARY GRADIENTS =====
// Signature Devora palette stops: Gold -> Orange -> Pink -> Magenta
const vec3 GRAD_GOLD    = vec3(1.000, 0.843, 0.435); // #ffd76f
const vec3 GRAD_ORANGE  = vec3(1.000, 0.604, 0.239); // #ff9a3d
const vec3 GRAD_PINK    = vec3(1.000, 0.361, 0.659); // #ff5ca8
const vec3 GRAD_MAGENTA = vec3(1.000, 0.169, 0.839); // #ff2bd6

// Neo-brutalist ink outline & canvas base
const vec3 INK_DARK     = vec3(0.04, 0.02, 0.07);
const vec3 INK_LIGHT    = vec3(0.05, 0.05, 0.05);
const vec3 BG_DARK      = vec3(0.035, 0.016, 0.065);
const vec3 BG_LIGHT     = vec3(0.960, 0.950, 0.945);

// Shane's hexagonal Voronoi function (https://www.shadertoy.com/view/ltK3WD)
vec4 voro(vec2 uv) {
  vec2 g = floor(uv);
  vec2 f = fract(uv);
  vec2 p, cp;
  float t = iTime * 0.05;
  float d = 1.0, k;

  // 5x5 neighborhood search from Shane's original shader
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

  // 3 isometric facet planes (Shane's normal metric)
  float f1 = -cp.x * 0.8660254 - cp.y * 0.5;
  float f2 =  cp.x * 0.8660254 - cp.y * 0.5;
  float f3 =  cp.y;

  // Identify normal facet
  int facet = 3;
  if (f1 >= f2 && f1 >= f3) {
    facet = 1; // Left facet
  } else if (f2 >= f3) {
    facet = 2; // Right facet
  } else {
    facet = 3; // Top facet
  }

  // Neo-brutalist secondary gradient assignment per facet
  vec3 faceColor;
  float celLevel;
  if (facet == 1) {
    faceColor = mix(GRAD_GOLD, GRAD_ORANGE, clamp(d * 2.2, 0.0, 1.0));
    celLevel = 1.0;
  } else if (facet == 2) {
    faceColor = mix(GRAD_ORANGE, GRAD_PINK, clamp(d * 2.2, 0.0, 1.0));
    celLevel = 0.78;
  } else {
    faceColor = mix(GRAD_PINK, GRAD_MAGENTA, clamp(d * 2.2, 0.0, 1.0));
    celLevel = 0.55;
  }

  // Shane's sqrt(d * 1.5) depth factor with cel shading
  float depth = sqrt(clamp(d * 1.5, 0.0, 1.0));
  float cel = floor(depth * 4.0 + 0.5) / 4.0;
  vec3 col = faceColor * celLevel * (0.65 + 0.35 * cel);

  // Comic screen halftone hatching on shadow facet
  float hatch = step(3.5, mod(gl_FragCoord.x + gl_FragCoord.y, 7.0));
  if (facet == 3) {
    col = mix(col * 0.8, col, hatch);
  }

  // Graphic ink outlines along facet ridges & hexagon perimeters
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

  // Kaleidoscope symmetry from Shane
  uv.x = abs(uv.x);

  float a = atan(uv.x, uv.y) * 2.0;
  float r = length(uv);

  // Kaleidoscope tunnel coordinate transformation
  uv = vec2(a, r / dot(uv, uv));

  // Forward tunnel motion
  uv.y += iTime * 0.9;

  // Shane's tunnel depth vignette & color evaluation
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

export type VoronoiKaleidoscopeShaderBackgroundProps = {
  className?: string;
  fixed?: boolean;
};

// ===== MAIN COMPONENT =====

export default function VoronoiKaleidoscopeShaderBackground({
  className,
  fixed,
}: VoronoiKaleidoscopeShaderBackgroundProps) {
  return (
    <ShaderBackgroundCanvas
      className={className}
      fixed={fixed}
      fragmentShaderSource={KALEIDOSCOPE_FRAGMENT_SHADER}
      resolutionScale={0.75}
    />
  );
}

