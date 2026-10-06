// Animated crystal-cell background for the hero + inner pages.
// Port of a ShaderToy demo. Flow: React boots WebGL → each frame sends time/theme/mouse →
// GPU paints black-and-white cells → tintDark/tintLight turn them into Devora colors.
// Cheap on purpose: half-res canvas, ~30fps, pauses when the tab is hidden.

"use client";

import { useEffect, useRef } from "react";

type VoronoiShaderBackgroundProps = {
  className?: string;
  // true = stick to the whole browser window (inner pages). false = only fill the hero box.
  fixed?: boolean;
};

// --- VERTEX SHADER (tiny) ---
// vocab: shader = tiny GPU program. Vertex shader = places the corners of the full-screen shape.
// We only draw a rectangle that covers the screen; the pretty look is in the fragment shader.
const VERT = `
// vocab: attribute = per-vertex input from JS (here: corner positions of the quad)
// vocab: vec2 = two floats (x, y)
attribute vec2 aPos;
void main() {
  // vocab: gl_Position = where this corner lands on screen (−1..1 on both axes = full canvas)
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// --- FRAGMENT SHADER (the look) ---
// vocab: fragment shader = runs once for EVERY pixel and decides that pixel’s color
const FRAG = `
// vocab: extension = optional GPU feature. Derivatives help fake 3D lighting cheaply.
#extension GL_OES_standard_derivatives : enable
// vocab: precision mediump = “medium accuracy floats” — faster on phones/laptops
precision mediump float;

// --- UNIFORMS: values React pushes in from JavaScript every frame ---
// vocab: uniform = shared input for all pixels this frame (same number everywhere)
// vocab: vec2 uResolution = canvas width + height in pixels (x = width, y = height)
uniform vec2 uResolution;
// vocab: float = one decimal number. uTime = seconds since start → makes cells slowly drift
uniform float uTime;
// vocab: uTheme = 0 means dark-mode palette, 1 means light-mode palette
uniform float uTheme;
// vocab: uMouse = pointer as 0..1 across the screen. x < 0 means “no pointer yet, use defaults”
uniform vec2 uMouse;

// vocab: #define = named constant (like const, but for the shader compiler)
#define ANIMATE 1
#define ANIMATE_D 0.32
#define EPSILON 0.00001

// Pseudo-random offset for each cell seed. Also where living MOTION happens.
// vocab: vec2 hash2(...) = function that returns two floats
vec2 hash2(vec2 p) {
  // Scramble the grid cell id into a “random looking” point inside that cell
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 19.19);
  vec2 o = fract(vec2((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y));
#if ANIMATE
  // THIS is the living motion: nudge each seed with sin(time) so cells breathe
  // vocab: sin = wave from −1..1 over time — classic cheap animation trick
  o = 0.5 + ANIMATE_D * sin(uTime * 0.42 + o * 6.2831853);
#endif
  return o;
}

// Soft minimum — blends two distances so borders look gooey instead of razor cracks
// vocab: float = returns one number (a distance)
float smin(float a, float b, float r) {
  float f = max(0.0, 1.0 - abs(b - a) / max(1e-5, r));
  return min(a, b) - r * 0.25 * f * f;
}

// Soft absolute value — rounds sharp folds (mouse Y controls how strong this is)
float sabs(float x, float r) {
  float f = max(0.0, 1.0 - abs(x + x) / max(1e-5, r));
  return abs(x) + r * 0.25 * (f * f - 1.0);
}

// Search nearby grid cells for the closest Voronoi “seed” point to this pixel
// vocab: in = input only. out = this function fills these variables for the caller
float closest(in vec2 n, in vec2 f, out vec2 mr, out vec2 mg) {
  vec2 h = step(0.5, f) - 2.0;
  vec2 n2 = n + h;
  vec2 f2 = f - h;
  float md = 8.0;

  // Check a 4×4 neighborhood of neighboring cells
  for (int j = 0; j <= 3; j++)
  for (int i = 0; i <= 3; i++) {
    vec2 g = vec2(float(i), float(j));
    vec2 o = hash2(n2 + g);
    vec2 r = g + o - f2;
    // vocab: dot(r,r) = length² of the vector (cheaper than sqrt for comparing distances)
    float d = dot(r, r);
    // Keep the closest seed so far
    if (d < md) {
      md = d;
      mr = r;
      mg = g;
    }
  }
  mg += h;
  return md;
}

// CORE SHAPE — distance from this pixel to the rounded cell edge
// s (mouse X) = how rounded / blobbed borders are
// e (mouse Y) = how soft the edge fold is
vec3 voronoi_rounder(in vec2 x, in float s, in float e) {
  // vocab: floor = whole-number grid cell. fract = leftover 0..1 inside that cell
  vec2 n = floor(x);
  vec2 f = fract(x);
  vec2 mr, mg;
  closest(n, f, mr, mg);

  float md = 8.0;
  // Walk neighbors again to measure distance to the shared edge between cells
  for (int j = -2; j <= 2; j++)
  for (int i = -2; i <= 2; i++) {
    vec2 g = mg + vec2(float(i), float(j));
    vec2 o = hash2(n + g);
    vec2 r = g + o - f;
    if (dot(mr - r, mr - r) > EPSILON) {
      float d = dot(0.5 * (mr + r), normalize(r - mr));
      md = smin(d, md, s * d);
    }
  }

  md *= 0.5 + s;
  md = sabs(md, e);
  // Return distance in .x (and leftover seed info in .yz — used by the lighting math)
  return vec3(md, mr);
}

// GRAYSCALE LOOK — still black-and-white. Builds ridges + fake 3D light.
// Colors are applied later in tintDark / tintLight.
vec3 plotGray(vec2 p, float ss) {
  float s;
  float e;
  // No pointer yet → same defaults as the original ShaderToy when idle
  if (uMouse.x < 0.0) {
    s = 0.5;
    e = 0.005;
  } else {
    // Mouse X/Y → smoothness (copied from ShaderToy formulas)
    // vocab: clamp(x,0,1) = force x into the 0..1 range
    s = clamp(uMouse.x, 0.0, 1.0) * 0.95 + 0.05;
    e = max(0.01, uMouse.y) * 0.5;
  }
  vec3 c = voronoi_rounder(p, s, e);

  // Fake 3D: treat the distance field like a bumpy surface and light it
  // vocab: dFdx / dFdy = how fast the value changes left/right and up/down → surface tilt
  // vocab: normalize = shrink a vector to length 1 (direction only)
  const float pd = 40.0;
  vec3 norm = normalize(vec3(dFdx(c.x), dFdy(c.x), ss * 1.5));
  float fw1 = fwidth(c.x);
  float fw2 = fw1 * (pd / 3.141592653589793 * 2.7);

  float f0 = sin(0.7 / pd);
  float f = sin(c.x * pd - 0.7);
  float od = abs(f);
  vec3 ldir = normalize(vec3(-0.2, -0.3, 0.6));
  float dd = dot(norm, ldir);
  float rd = pow(max(0.0, reflect(-ldir, norm).z), 16.0);
  float ld = dd * dd * 0.7 + 0.35;
  float c0 = c.x * 0.7 - step(0.0, f) * 0.05 + 0.6;
  float c1 = c.x * 0.7 + 0.33;
  // vocab: mix(a,b,t) = blend from a→b. t=0 → a, t=1 → b
  vec3 col = mix(vec3(c0 * ld + rd * 0.23), vec3(c1 * ld), smoothstep(fw2, 0.0, od) * 0.7);
  col = mix(col, vec3(0.1, 0.15, 0.1), smoothstep(f0 + fw1, f0, c.x) * 0.5);
  col = sqrt(col) * 1.5 - 0.53;
  return col;
}

// COLORS — DARK MODE. Edit these vec3(r,g,b) numbers (0..1 each) to change the palette.
// Flow: darkest trench → purple → magenta → orange → gold highlight
vec3 tintDark(float g) {
  vec3 a0 = vec3(0.04, 0.02, 0.09);
  vec3 a1 = vec3(0.18, 0.05, 0.32);
  vec3 a2 = vec3(0.55, 0.10, 0.40);
  vec3 a3 = vec3(1.00, 0.42, 0.22);
  vec3 a4 = vec3(1.00, 0.84, 0.44);

  // Pick which color band this gray value falls into, then blend within the band
  if (g < 0.22) return mix(a0, a1, g / 0.22);
  if (g < 0.45) return mix(a1, a2, (g - 0.22) / 0.23);
  if (g < 0.70) return mix(a2, a3, (g - 0.45) / 0.25);
  return mix(a3, a4, (g - 0.70) / 0.30);
}

// COLORS — LIGHT MODE. Same idea, different stops (ink → fuchsia → coral → lemon).
vec3 tintLight(float g) {
  // vocab: pow(g, 1.15) = curve the gray so grooves stay darker longer (crisper cells)
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

  // Extra contrast so light mode doesn’t wash out
  col = (col - 0.5) * 1.35 + 0.48;
  // vocab: clamp(col,0,1) = keep RGB channels inside legal 0..1 range
  return clamp(col, 0.0, 1.0);
}

// ENTRY POINT for each pixel: grayscale → color by theme
void main() {
  // How many cell-units fit on screen (slightly denser on tall canvases)
  float sc = step(512.0, uResolution.y) * 2.0 + 3.0;
  float ss = sc / uResolution.y;
  // vocab: gl_FragCoord = this pixel’s position on the canvas
  // Center uvs so (0,0) is middle of the screen
  vec2 uv = (gl_FragCoord.xy - uResolution.xy * 0.5) * ss;

  vec3 gray = plotGray(uv, ss);
  // vocab: .r = red channel of the gray color (we only need one channel as “height”)
  float g = clamp(gray.r, 0.0, 1.0);
  // Light mode: tiny brightness nudge so ridges pop
  float gLight = clamp(g * 1.08 - 0.04, 0.0, 1.0);
  // vocab: mix(dark, light, uTheme) — uTheme 0 = all dark, 1 = all light
  vec3 col = mix(tintDark(g), tintLight(gLight), uTheme);

  // vocab: gl_FragColor = final RGBA for this pixel (a=1 means fully opaque)
  gl_FragColor = vec4(col, 1.0);
}
`;

// Older GPUs missing derivative helpers get this slower twin (same look, more math).
// vocab: .replace = string find/swap in JavaScript — we surgically edit the GLSL text
const FRAG_FALLBACK = FRAG.replace(
  "#extension GL_OES_standard_derivatives : enable\n",
  ""
).replace(
  `vec3 norm = normalize(vec3(dFdx(c.x), dFdy(c.x), ss * 1.5));
  float fw1 = fwidth(c.x);`,
  `const vec2 eps = vec2(0.0015, 0.0);
  float fdx = (voronoi_rounder(p + eps.xy, s, e).x - c.x) / eps.x;
  float fdy = (voronoi_rounder(p + eps.yx, s, e).x - c.x) / eps.x;
  vec3 norm = normalize(vec3(fdx, fdy, 1.5));
  float fw1 = (abs(fdx) + abs(fdy)) * ss;`
);

// Turn GLSL source text into a compiled GPU shader object (or null on failure)
function compile(gl: WebGLRenderingContext, type: number, source: string) {
  // vocab: createShader = empty shader shell on the GPU
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  // Compile failed → log the GPU error and give up this shader
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[VoronoiShader]", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Attach vertex + fragment shaders into one runnable “program”
function linkProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);
  // Either half failed → delete what we made and stop
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  // vocab: program = linked pair of shaders the GPU can run together
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  // Link failed → clean up
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("[VoronoiShader]", gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

export default function VoronoiShaderBackground({
  className = "",
  fixed = false,
}: VoronoiShaderBackgroundProps) {
  // vocab: useRef = box that holds the real <canvas> DOM node after React mounts it
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // vocab: useEffect = run setup after first paint; return cleanup when this component leaves
  // Boot WebGL once, then animate until unmount
  useEffect(() => {
    const canvas = canvasRef.current;
    // Canvas not ready yet — bail (shouldn’t happen after mount)
    if (!canvas) return;

    // OS “reduce motion” accessibility setting → freeze animation (still show one frame)
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // vocab: getContext("webgl") = ask the browser for a GPU drawing API on this canvas
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    // Browser has no WebGL — leave a blank canvas
    if (!gl) return;

    // Prefer the fast shader; if derivatives aren’t supported, use the slower fallback
    const ext = gl.getExtension("OES_standard_derivatives");
    let prog = ext ? linkProgram(gl, VERT, FRAG) : null;
    if (!prog) prog = linkProgram(gl, VERT, FRAG_FALLBACK);
    if (!prog) return;

    // Upload a full-screen rectangle as two triangles (6 corners)
    // vocab: buffer = GPU memory holding those corner positions
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    // vocab: getUniformLocation / getAttribLocation = “handles” so JS can push values into the shader by name
    const aPos = gl.getAttribLocation(prog, "aPos");
    const uResolution = gl.getUniformLocation(prog, "uResolution");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uTheme = gl.getUniformLocation(prog, "uTheme");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    // vocab: raf = id returned by requestAnimationFrame — we store it so cleanup can cancel the loop
    let raf = 0;
    // vocab: disposed = true after cleanup — stops frame() from touching WebGL after unmount
    let disposed = false;
    // vocab: lastDraw = timestamp (ms) of the last real paint — used for the FPS cap
    let lastDraw = 0;
    // vocab: performance.now() = high-res clock in ms; start is “t = 0” for the shader
    const start = performance.now();
    // Cap near 30 frames/sec so laptops don’t melt (1000ms / 30 ≈ 33)
    // Manipulate here: lower FRAME_MS = smoother but heavier GPU; raise = calmer / less lag
    const FRAME_MS = 33;

    // Pointer drives cell smoothness (ShaderToy X/Y). Idle until first move/tap.
    // target = where the pointer is now; mouseX/Y = eased values we actually send to the GPU
    let mouseActive = false;
    let mouseTargetX = 0.5;
    let mouseTargetY = 0.5;
    let mouseX = 0.5;
    let mouseY = 0.5;

    // Read dark/light from <html data-theme="..."> (our sun/moon toggle sets this)
    // Returns 0 or 1 because the shader’s uTheme expects a float, not a string
    const readTheme = () =>
      document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;

    // Turn a pointer event into 0..1 coordinates for the shader.
    // Canvas has pointer-events-none so buttons still work — we listen on window instead.
    const onPointer = (ev: PointerEvent) => {
      // Don’t morph cells when the user asked for less motion
      if (reduceMotion) return;
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      // vocab: clientX/Y = pointer position inside the browser window (pixels from top-left)
      // Divide by size → 0 at left/top edge, 1 at right/bottom (then we flip Y)
      mouseTargetX = Math.min(1, Math.max(0, ev.clientX / w));
      // ShaderToy Y grows upward; browser Y grows downward — flip so “up” matches the demo
      mouseTargetY = Math.min(1, Math.max(0, 1 - ev.clientY / h));
      mouseActive = true;
    };

    // Match canvas to parent (hero) or whole window (fixed pages).
    // Internal pixels are ~55% size; CSS stretches them — big FPS win, slight softness.
    // Manipulate here: raise `scale` (e.g. 0.75) = sharper but heavier; lower = faster
    const resize = () => {
      const parent = canvas.parentElement;
      // vocab: ?. = safe access — if parent is missing, fall through to window size
      // vocab: || = if left side is empty/falsy, use the right side
      const w = fixed ? window.innerWidth : parent?.clientWidth || window.innerWidth;
      const h = fixed ? window.innerHeight : parent?.clientHeight || window.innerHeight;
      const scale = 0.55;
      const pw = Math.max(2, Math.floor(w * scale));
      const ph = Math.max(2, Math.floor(h * scale));
      // Only reset the GPU pixel buffer when the size actually changed (avoids flicker/work)
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      // CSS size = full layout size (may be larger than canvas.width/height)
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      // vocab: viewport = tell WebGL which pixel rectangle inside the canvas to draw into
      gl.viewport(0, 0, pw, ph);
    };

    // ONE PAINT: push the latest uniforms into the GPU, then draw the full-screen quad.
    // vocab: timeSec = seconds since start — becomes uTime inside the fragment shader
    const draw = (timeSec: number) => {
      // Make this linked program the active one
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      // Wire the buffer’s x,y pairs into the vertex shader’s `aPos` attribute
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      // Feed resolution / time / theme into the fragment shader uniforms
      // vocab: uniform2f / uniform1f = “set this uniform to 2 floats / 1 float”
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      // Freeze time at 0 when reduce-motion is on (cells stop drifting)
      gl.uniform1f(uTime, reduceMotion ? 0 : timeSec);
      gl.uniform1f(uTheme, readTheme());

      // Ease mouse toward the pointer so cell morph doesn’t snap
      // Manipulate here: 0.18 = how fast it catches up (higher = snappier, lower = smoother lag)
      if (mouseActive) {
        mouseX += (mouseTargetX - mouseX) * 0.18;
        mouseY += (mouseTargetY - mouseY) * 0.18;
        gl.uniform2f(uMouse, mouseX, mouseY);
      } else {
        // −1 on x is the “idle” signal inside plotGray → use ShaderToy default s/e
        gl.uniform2f(uMouse, -1, -1);
      }

      // vocab: drawArrays = run the shaders for these 6 vertices (2 triangles = full screen)
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // This function is the heartbeat of the background animation.
    // The browser keeps calling it; we decide whether to actually repaint.
    const frame = (now: number) => {
      // vocab: now = timestamp in milliseconds from requestAnimationFrame

      // Stop forever after cleanup ran (user left the page / component unmounted)
      // vocab: disposed = our flag meaning “tear down already happened — don’t touch WebGL”
      if (disposed) return;

      // Queue the NEXT call to `frame` before we paint.
      // vocab: raf = id of that scheduled call — keep it so we can cancel later
      // vocab: requestAnimationFrame(frame) = “call frame again right before the next screen refresh”
      // Why call itself? That’s the loop — each run schedules the next run.
      raf = window.requestAnimationFrame(frame);

      // Accessibility: OS “reduce motion” on → keep the loop scheduled but don’t animate
      if (reduceMotion) return;

      // FPS cap: if it’s been less than FRAME_MS (≈33ms ≈ 30fps) since last paint, skip this tick
      // Manipulate here: lower FRAME_MS = smoother but heavier; raise = calmer on laptops
      if (now - lastDraw < FRAME_MS) return;

      lastDraw = now;

      // Convert ms since start → seconds, then hand to draw (shader uses uTime in seconds)
      // vocab: (now - start) / 1000 = elapsed seconds; draw pushes that into the GPU as uTime
      draw((now - start) / 1000);
    };

    // When the sun/moon toggle flips <html data-theme>, repaint once immediately
    // (don’t wait for the next animation tick — colors should snap with the UI)
    // vocab: MutationObserver = browser API that watches the DOM for attribute changes
    const themeObserver = new MutationObserver(() => {
      draw((performance.now() - start) / 1000);
    });

    // Pause GPU work when the tab is in the background (saves battery / heat)
    const onVisibility = () => {
      // Tab hidden → cancel the animation loop
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      } else if (!reduceMotion && !raf) {
        // Tab visible again and we aren’t already looping → restart the heartbeat
        lastDraw = 0;
        raf = window.requestAnimationFrame(frame);
      }
    };

    // Boot sequence: size the canvas → paint frame 0 → start the loop (unless reduce-motion)
    resize();
    draw(0);
    if (!reduceMotion) raf = window.requestAnimationFrame(frame);

    // Hook browser events. { passive: true } = “we won’t call preventDefault” → smoother scrolling
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // vocab: ResizeObserver = fires when the *parent box* changes size (not only the window)
    // Needed for the hero: layout can change without a window resize event
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // CLEANUP — runs when React unmounts this component (navigate away / remount)
    // vocab: return () => {...} inside useEffect = the cleanup function
    // Must remove listeners + free GPU memory or you leak and can crash WebGL on remount
    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [fixed]);

  // Canvas ignores mouse so buttons still work; we track the pointer on window instead
  return (
    <canvas
      ref={canvasRef}
      className={`voronoi-shader-bg pointer-events-none ${fixed ? "fixed inset-0" : "absolute inset-0"} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
