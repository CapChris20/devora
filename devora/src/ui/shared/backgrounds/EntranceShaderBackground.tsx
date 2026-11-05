// Kikkō Ajiro pattern (rhombille tiling) animated background for the FAQs Page.
// Recolored to Devora's signature Orange -> Pink -> Magenta gradient palette.

"use client";

// ===== IMPORTS =====

import ShaderBackgroundCanvas from "./ShaderBackgroundCanvas";

// ===== NAMED CONSTANTS =====

const KIKKO_FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uTheme;

#define iResolution vec3(uResolution.x, uResolution.y, 1.0)
#define iTime uTime
#define lstep(d, w) clamp(0.5 - ((d) / (w)), 0.0, 1.0)

const float N = 4.0;                             // grid scale
const float L = 0.014;                           // line half-thickness
const vec2 S = vec2(1.0, 1.7320508);            // hex helper vector: 60° direction, length 2

// Pointy-top hex grid
vec2 hexCoord(vec2 p) {
    vec2 a = p - (floor(p / S) + 0.5) * S;
    vec2 b = p - (floor((p - vec2(0.5, 1.0)) / S) + 1.0) * S;
    return dot(a, a) < dot(b, b) ? a : b;
}

// Split the local hex into 3 "axis-dominance" regions
vec3 hexRegion(vec2 q) {
    float u = q.x;
    float v = dot(q, S * 0.5);
    float w = dot(q, S * vec2(-0.5, 0.5));
    vec3 d = abs(vec3(u, v, w));
    if (d.x > d.y && d.x > d.z) return vec3(d.x - max(d.y, d.z), 0.0, v);
    if (d.y > d.z)              return vec3(d.y - max(d.x, d.z), 1.0, w);
    return vec3(d.z - max(d.x, d.y), 2.0, u);
}

void mainImage(out vec4 o, in vec2 p) {
    p = (p - 0.5 * iResolution.xy) / iResolution.y;
    p += iTime * 0.02;
    
    p *= N;
    p += 0.0007 * sin(p.yx * 40.0 + sin(p.yx * 120.0));
    p += 0.0015 * sin(p.yx * 10.0);
    
    vec2 h = hexCoord(p);
    vec3 r = hexRegion(h);

    // Devora signature brand palette:
    // C0 = Orange (#ff9a3d -> linear sRGB: 1.00, 0.329, 0.043)
    // C1 = Pink   (#ff5ca8 -> linear sRGB: 1.00, 0.104, 0.398)
    // C2 = Magenta (#ff2bd6 -> linear sRGB: 1.00, 0.020, 0.678)
    // C3 = Line color (Night #0d0b0e -> linear: 0.003, 0.002, 0.004)
    vec3 C0 = vec3(1.00, 0.329, 0.043);
    vec3 C1 = vec3(1.00, 0.104, 0.398);
    vec3 C2 = vec3(1.00, 0.020, 0.678);
    vec3 C3 = mix(vec3(0.003, 0.002, 0.004), vec3(0.95, 0.93, 0.96), uTheme);

    vec3 c = (r.y == 0.0) ? C0 : (r.y == 1.0) ? C1 : C2;

    float w = N / iResolution.y;
    float m0 = lstep(r.x - L, w);
    float m1 = lstep(abs(fract((r.z - 0.25) * 6.0) - 0.5) - L * 6.0, w * 6.0);
    c = mix(c, C3, max(m0, m1));

    o = pow(vec4(clamp(c, 0.0, 1.0), 1.0), vec4(1.0 / 2.2));
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

// ===== TYPES =====

export type EntranceShaderBackgroundProps = {
  className?: string;
  fixed?: boolean;
};

// ===== MAIN COMPONENT =====

export default function EntranceShaderBackground({
  className,
  fixed,
}: EntranceShaderBackgroundProps) {
  return (
    <ShaderBackgroundCanvas
      className={className}
      fixed={fixed}
      fragmentShaderSource={KIKKO_FRAGMENT_SHADER_SOURCE}
      resolutionScale={0.7}
    />
  );
}
