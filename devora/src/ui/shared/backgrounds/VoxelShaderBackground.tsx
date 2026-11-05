// Flopine's animated torus + sphere SDF raymarching background for the Account Page.
// Recolored to Devora's signature Orange -> Pink -> Magenta gradient palette.

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
#define PI 3.14159265359
#define TAU 6.28318530718
#define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))

#define hash21(x) fract(sin(dot(x, vec2(26.4, 32.87))) * 467.5)
#define dt(sp) fract(iTime * sp)

float hexa(vec2 p) {
    p = abs(p);
    return max(p.x, dot(p, normalize(vec2(1.0, 1.7320508))));
}

float torus(vec3 p, vec2 rs) {
    vec2 q = vec2(hexa(p.xy) - rs.x, p.z);
    float a = atan(p.y, p.x);
    q *= rot(a + iTime);
    q = abs(abs(q) - 0.6) - 0.3;
    return hexa(q) - rs.y;
}

float g1;

float SDF(vec3 p) {
    p.yz *= rot(-atan(1.0 / 1.41421356));
    p.xz *= rot(PI / 4.0);
    
    float t = torus(p.xzy, vec2(3.0, 0.3));
    p.y -= sin(dt(0.1) * TAU) * 0.5 + 0.5;
    float s = length(p) - 0.8;
    g1 += 0.01 / (0.01 + s * s);
    
    return min(t, s);
}

vec3 getnorm(vec3 p) {
    vec2 eps = vec2(0.001, 0.0);
    return normalize(vec3(
        SDF(p + eps.xyy) - SDF(p - eps.xyy),
        SDF(p + eps.yxy) - SDF(p - eps.yxy),
        SDF(p + eps.yyx) - SDF(p - eps.yyx)
    ));
}

float AO(float eps, vec3 p, vec3 n) {
    return clamp(SDF(p + eps * n) / eps, 0.0, 1.0);
}

float spec(vec3 n, vec3 l, vec3 rd) {
    vec3 h = normalize(l - rd);
    return pow(max(dot(n, h), 0.0), 35.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
    g1 = 0.0;
    
    float dither = hash21(uv);
    vec3 ro = vec3(uv * 3.8, -50.0);
    vec3 rd = normalize(vec3(0.0, 0.0, 1.0));
    vec3 p = ro;
    vec3 l = vec3(1.0, 2.0, -2.0);
    
    vec3 col = vec3(0.0);
    bool hit = false;
    for (int i = 0; i < 90; i++) {
        float d = SDF(p);
        if (d < 0.01) {
            hit = true;
            break;
        }
        d *= 0.75 + dither * 0.15;
        p += d * rd;
    }
    
    // Devora signature brand palette (Orange -> Pink -> Magenta):
    vec3 colOrange  = vec3(1.00, 0.604, 0.239); // #ff9a3d
    vec3 colPink    = vec3(1.00, 0.361, 0.659); // #ff5ca8
    vec3 colMagenta = vec3(1.00, 0.169, 0.839); // #ff2bd6
    vec3 colShadow  = vec3(0.12, 0.04, 0.15);

    if (hit) {
        vec3 n = getnorm(p);
        float light = max(dot(n, normalize(l)), 0.0);
        float ao = (AO(0.1, p, n) + AO(0.25, p, n) + AO(0.65, p, n)) / 3.0;
        float s = spec(n, l, rd);
        
        // Gradient ramp: Magenta in shadows -> Pink in midtones -> Orange in highlights
        vec3 surfaceGrad = mix(colMagenta, mix(colPink, colOrange, light), light);
        col = mix(colShadow, surfaceGrad, light) * ao + s * mix(colPink, colOrange, 0.6);
    } else {
        vec3 bgDark = mix(vec3(0.051, 0.043, 0.055), vec3(0.10, 0.04, 0.11), length(uv) * 0.45);
        vec3 bgLight = mix(vec3(0.96, 0.94, 0.97), vec3(0.92, 0.88, 0.94), length(uv) * 0.35);
        col = mix(bgDark, bgLight, uTheme);
    }
    
    // Warm pink-orange glow around the geometry
    vec3 glowColor = mix(colPink, colOrange, 0.4);
    col += g1 * 0.45 * glowColor;
    
    fragColor = vec4(sqrt(clamp(col, 0.0, 1.0)), 1.0);
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

export default function VoxelShaderBackground({
  className,
  fixed,
}: VoxelShaderBackgroundProps) {
  return (
    <ShaderBackgroundCanvas
      className={className}
      fixed={fixed}
      fragmentShaderSource={ACCOUNT_FRAGMENT_SHADER_SOURCE}
      resolutionScale={0.7}
    />
  );
}
