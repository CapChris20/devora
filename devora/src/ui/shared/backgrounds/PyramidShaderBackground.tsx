// Animated pyramid-scale background — a ShaderToy "Pyramid Pattern" port.
// Flow: React boots WebGL → each frame sends time + theme → GPU builds offset
// pyramid cells → we throw away the demo's blue/red lighting and paint Devora colors.
// Default background for inner pages, the homepage hero, and auth screens.
// Pass background="voronoi" on PageLayout to put the crystal field back.

"use client";

import { useEffect, useRef } from "react";

type PyramidShaderBackgroundProps = {
  className?: string;
  // true = stick to the whole browser window (inner pages). false = fill the parent box.
  fixed?: boolean;
};

// --- VERTEX SHADER ---
// vocab: vertex shader = places the corners of the full-screen rectangle
const VERT = `
attribute vec2 aPos;
void main() {
  // vocab: gl_Position = where this corner lands (−1..1 = full canvas)
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// --- FRAGMENT SHADER ---
// vocab: fragment shader = runs once per pixel and picks that pixel's color
// Shape math is the pyramid demo. Color ramps are copied from VoronoiShaderBackground
// so both backgrounds share one palette (dark trench → purple → magenta → orange → gold).
const FRAG = `
precision highp float;

// vocab: uniform = a value JavaScript pushes in for every pixel this frame
uniform vec2 uResolution;
uniform float uTime;
// vocab: uTheme = 0 dark palette, 1 light palette (sun/moon toggle)
uniform float uTheme;

// Offset every other row so the pyramids don't sit on a stiff square grid.
#define OFFSET_ROW

// vocab: mat2 = 2×2 grid of numbers, used here as a rotation
mat2 rot2(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(27.619, 57.583))) * 43758.5453);
}

// Written by bMap so each pixel knows which pyramid cell it landed in.
vec2 cellID;

vec2 hash22B(vec2 p) {
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(262144.0, 32768.0) * n) * 2.0 - 1.0;
}

// Smooth noise. Four corner hashes, blended so the pyramid peaks drift instead of popping.
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

// Height of the pyramid under this pixel. 0 = edge trench, 1 = peak.
float bMap(vec2 p) {
  p *= rot2(-3.14159 / 5.0);

#ifdef OFFSET_ROW
  if (mod(floor(p.y), 2.0) < 0.5) p.x += 0.5;
#endif

  vec2 ip = floor(p);
  p -= ip + 0.5;
  cellID = ip;

  // Noise slides the peak around inside the cell, so the scales slowly "flip."
  float ang = -3.14159 * 3.0 / 5.0 + (fBm(ip / 8.0 + uTime / 3.0)) * 6.2831 * 2.0;
  vec2 offs = vec2(cos(ang), sin(ang)) * 0.35;

  if (p.x < offs.x) p.x = 1.0 - (p.x + 0.5) / abs(offs.x + 0.5);
  else p.x = (p.x - offs.x) / (0.5 - offs.x);

  if (p.y < offs.y) p.y = 1.0 - (p.y + 0.5) / abs(offs.y + 0.5);
  else p.y = (p.y - offs.y) / (0.5 - offs.y);

  return 1.0 - max(p.x, p.y);
}

// Fake 3D: tilt the flat normal using nearby height samples, and mark the cracks.
// vocab: inout edge = this function fills "edge" for the caller (how close we are to a crack)
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

// Fine diagonal scratches across the scales. High frequency — keep the canvas fairly sharp.
float doHatch(vec2 p, float res) {
  p *= res / 16.0;
  float hatch = clamp(sin((p.x - p.y) * 3.14159 * 200.0) * 2.0 + 0.5, 0.0, 1.0);
  float hRnd = hash21(floor(p * 6.0) + 0.73);
  if (hRnd > 0.66) hatch = hRnd;
  return hatch;
}

// COLORS — same stops as VoronoiShaderBackground tintDark. Do not invent a new palette.
vec3 tintDark(float g) {
  vec3 a0 = vec3(0.04, 0.02, 0.09);
  vec3 a1 = vec3(0.18, 0.05, 0.32);
  vec3 a2 = vec3(0.55, 0.10, 0.40);
  vec3 a3 = vec3(1.00, 0.42, 0.22);
  vec3 a4 = vec3(1.00, 0.84, 0.44);

  if (g < 0.22) return mix(a0, a1, g / 0.22);
  if (g < 0.45) return mix(a1, a2, (g - 0.22) / 0.23);
  if (g < 0.70) return mix(a2, a3, (g - 0.45) / 0.25);
  return mix(a3, a4, (g - 0.70) / 0.30);
}

// COLORS — same stops as VoronoiShaderBackground tintLight.
vec3 tintLight(float g) {
  g = pow(clamp(g, 0.0, 1.0), 1.15);

  vec3 a0 = vec3(0.06, 0.02, 0.10);
  vec3 a1 = vec3(0.72, 0.08, 0.42);
  vec3 a2 = vec3(1.00, 0.38, 0.42);
  vec3 a3 = vec3(1.00, 0.72, 0.28);
  vec3 a4 = vec3(1.00, 0.96, 0.78);

  vec3 col;
  if (g < 0.16) col = mix(a0, a1, g / 0.16);
  else if (g < 0.38) col = mix(a1, a2, (g - 0.16) / 0.22);
  else if (g < 0.62) col = mix(a2, a3, (g - 0.38) / 0.24);
  else col = mix(a3, a4, (g - 0.62) / 0.38);

  col = (col - 0.5) * 1.35 + 0.48;
  return clamp(col, 0.0, 1.0);
}

void main() {
  // Cap the "virtual height" at 800px so cells stay a similar size on huge monitors.
  float iRes = min(uResolution.y, 800.0);
  vec2 uv = (gl_FragCoord.xy - uResolution.xy * 0.5) / iRes;

  vec3 rd = normalize(vec3(uv, 0.5));

  // gSc = how many pyramid cells across. Higher = smaller scales.
  // Manipulate here: 10.0 = demo density; raise for finer scales, lower for bigger pyramids
  float gSc = 10.0;
  // Slow upward drift. Manipulate here: uTime / 2.0 is the demo speed; / 4.0 is calmer.
  vec2 p = uv * gSc + vec2(0.0, uTime / 2.0);
  vec2 oP = p;

  float m = bMap(p);

  vec3 n = vec3(0.0, 0.0, -1.0);
  float edge = 0.0;
  // Manipulate here: bumpFactor = how sharp the 3D scales feel (demo used 0.25)
  float bumpFactor = 0.25;
  n = doBumpMap(p, n, bumpFactor, edge);

  // Light orbits a little so the gold ridges travel across the scales.
  vec3 lp = vec3(sin(uTime) * 0.3, cos(uTime * 1.3) * 0.3, -1.0) - vec3(uv, 0.0);
  float lDist = max(length(lp), 0.001);
  vec3 ld = lp / lDist;

  float diff = max(dot(n, ld), 0.0);
  diff = pow(diff, 4.0);
  float spec = pow(max(dot(reflect(-ld, n), -rd), 0.0), 16.0);
  float fre = min(pow(max(1.0 + dot(n, rd), 0.0), 4.0), 3.0);

  // Grayscale stand-in for the demo's colored lights.
  // The original painted orange spec + blue fresnel + red reflections — we keep
  // the brightness of those terms and let tintDark/tintLight choose the hue.
  float specW = spec * 2.2;
  float freW = fre * 0.35;
  float g = 0.15 * (diff + 0.251) + specW + freW;

  // Fake reflection: brighten ridges a touch (lands them in the gold band).
  float rf = smoothstep(0.0, 0.35, bMap(reflect(rd, n).xy * 2.0) * fBm(reflect(rd, n).xy * 3.0) + 0.1);
  g += g * g * rf * rf * 0.22;

  float shade = m * 0.83 + 0.17;
  g *= shade;
  g *= 1.0 - edge * 0.8;

  float hatch = doHatch(oP / gSc, iRes);
  g *= hatch * 0.5 + 0.7;

  // vocab: sqrt = the demo's last step; pulls midtones up so scales aren't a black slab
  g = sqrt(max(g, 0.0));
  g = clamp(g, 0.0, 1.0);

  float gLight = clamp(g * 1.08 - 0.04, 0.0, 1.0);
  vec3 col = mix(tintDark(g), tintLight(gLight), uTheme);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[PyramidShader]", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function linkProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("[PyramidShader]", gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

export default function PyramidShaderBackground({
  className = "",
  fixed = false,
}: PyramidShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const prog = linkProgram(gl, VERT, FRAG);
    if (!prog) return;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, "aPos");
    const uResolution = gl.getUniformLocation(prog, "uResolution");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uTheme = gl.getUniformLocation(prog, "uTheme");

    let raf = 0;
    let disposed = false;
    let lastDraw = 0;
    const start = performance.now();
    // Heavier than Voronoi (each pixel samples the height field many times).
    // Manipulate here: lower FRAME_MS = smoother drift, more GPU; 33 ≈ 30fps
    const FRAME_MS = 33;

    const readTheme = () =>
      document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;

    // Internal pixels stay closer to full size than Voronoi (0.55) because the
    // hatch lines disappear into mush if we scale them down too far.
    // Manipulate here: 0.8 = sharper scales; 0.55 = cheaper, blurrier
    const resize = () => {
      const parent = canvas.parentElement;
      const w = fixed ? window.innerWidth : parent?.clientWidth || window.innerWidth;
      const h = fixed ? window.innerHeight : parent?.clientHeight || window.innerHeight;
      const scale = 0.8;
      const pw = Math.max(2, Math.floor(w * scale));
      const ph = Math.max(2, Math.floor(h * scale));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, pw, ph);
    };

    const draw = (timeSec: number) => {
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduceMotion ? 0 : timeSec);
      gl.uniform1f(uTheme, readTheme());
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const frame = (now: number) => {
      if (disposed) return;
      raf = window.requestAnimationFrame(frame);
      if (reduceMotion) return;
      if (now - lastDraw < FRAME_MS) return;
      lastDraw = now;
      draw((now - start) / 1000);
    };

    const themeObserver = new MutationObserver(() => {
      draw((performance.now() - start) / 1000);
    });

    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      } else if (!reduceMotion && !raf) {
        lastDraw = 0;
        raf = window.requestAnimationFrame(frame);
      }
    };

    resize();
    draw(0);
    if (!reduceMotion) raf = window.requestAnimationFrame(frame);

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [fixed]);

  return (
    <canvas
      ref={canvasRef}
      className={`pyramid-shader-bg pointer-events-none ${fixed ? "fixed inset-0" : "absolute inset-0"} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
