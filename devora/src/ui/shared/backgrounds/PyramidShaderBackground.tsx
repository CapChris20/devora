// Animated pyramid-scale background — a ShaderToy "Pyramid Pattern" port.
// Flow: boot WebGL → each frame sends time and theme → the GPU paints Devora-colored scales.
// Default background for inner pages, the homepage hero, and auth screens.
// Pass background="voronoi" on PageLayout to put the crystal field back.

"use client";

// ===== IMPORTS =====

import { useEffect, useRef } from "react";

// ===== NAMED CONSTANTS =====

const WEBGL_CONTEXT_NAME = "webgl" as const;
const LOW_POWER_GPU_PREFERENCE = "low-power" as const;
const WEBGL_ALPHA_ENABLED = false;
const WEBGL_ANTIALIAS_ENABLED = false;
const WEBGL_DEPTH_ENABLED = false;
const WEBGL_STENCIL_ENABLED = false;
const WEBGL_PRESERVE_DRAWING_BUFFER = false;
const PYRAMID_SHADER_LOG_LABEL = "[PyramidShader]";
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";
const DOCUMENT_THEME_ATTRIBUTE = "data-theme";
const LIGHT_THEME_ATTRIBUTE_VALUE = "light";
const LIGHT_THEME_UNIFORM_VALUE = 1;
const DARK_THEME_UNIFORM_VALUE = 0;
const POSITION_ATTRIBUTE_NAME = "aPos";
const RESOLUTION_UNIFORM_NAME = "uResolution";
const TIME_UNIFORM_NAME = "uTime";
const THEME_UNIFORM_NAME = "uTheme";
const VERTEX_FLOATS_PER_POSITION = 2;
const ARE_VERTEX_FLOATS_NORMALIZED = false;
const VERTEX_STRIDE_BYTES = 0;
const VERTEX_OFFSET_BYTES = 0;
const DRAW_START_VERTEX = 0;
const FULLSCREEN_QUAD_VERTEX_COUNT = 6;
const FULLSCREEN_QUAD_CORNERS = new Float32Array([
  -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
]);
// Manipulate here: lower = smoother drift and more GPU; 33 is about 30fps
const FRAME_INTERVAL_MS = 33;
const MILLISECONDS_PER_SECOND = 1000;
const INITIAL_SHADER_TIME_SECONDS = 0;
const FROZEN_SHADER_TIME_SECONDS = 0;
const NO_ANIMATION_FRAME_ID = 0;
const RESET_DRAW_TIMESTAMP_MS = 0;
// Internal pixels stay close to full size so the hatch lines do not turn to mush.
// Manipulate here: 0.8 = sharper scales; lower = cheaper and blurrier
const PYRAMID_CANVAS_RESOLUTION_SCALE = 0.8;
const MINIMUM_CANVAS_DIMENSION_PX = 2;
const RESIZE_EVENT = "resize";
const VISIBILITY_CHANGE_EVENT = "visibilitychange";
const PYRAMID_CANVAS_CLASS = "pyramid-shader-bg pointer-events-none";
const FIXED_CANVAS_POSITION_CLASS = "fixed inset-0";
const ABSOLUTE_CANVAS_POSITION_CLASS = "absolute inset-0";
const DEFAULT_CLASS_NAME = "";
const DEFAULT_IS_FIXED = false;

// Single-letter names inside the shader (p, n, g, uv, rd) are GPU math locals.
// They stay short on purpose. The formulas below must stay byte-for-byte.
// --- VERTEX SHADER ---
// vocab: vertex shader = places the corners of the full-screen rectangle
const VERTEX_SHADER_SOURCE = `
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
const FRAGMENT_SHADER_SOURCE = `
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


// ===== TYPES =====

type PyramidShaderBackgroundProps = {
  className?: string;
  // true = stick to the whole browser window (inner pages). false = fill the parent box.
  fixed?: boolean;
};

type PyramidDrawSession = {
  webglContext: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  vertexBuffer: WebGLBuffer | null;
  canvas: HTMLCanvasElement;
  shouldReduceMotion: boolean;
  positionAttributeLocation: number;
  resolutionUniformLocation: WebGLUniformLocation | null;
  timeUniformLocation: WebGLUniformLocation | null;
  themeUniformLocation: WebGLUniformLocation | null;
};

type PyramidAnimationState = {
  animationFrameId: number;
  isDisposed: boolean;
  lastDrawTimestampMs: number;
  startTimestampMs: number;
  shouldReduceMotion: boolean;
};

type PyramidListenerInput = {
  canvas: HTMLCanvasElement;
  resizeCanvas: () => void;
  pauseWhenTabHidden: () => void;
  themeObserver: MutationObserver;
};

type PyramidReleaseInput = {
  animation: PyramidAnimationState;
  detachListeners: () => void;
  webglContext: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  vertexBuffer: WebGLBuffer | null;
};

// ===== HELPER FUNCTIONS =====

function createLowPowerWebglContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  // vocab: WebGL = the browser GPU drawing API. These flags stay off: the quad is opaque.
  return canvas.getContext(WEBGL_CONTEXT_NAME, {
    alpha: WEBGL_ALPHA_ENABLED,
    antialias: WEBGL_ANTIALIAS_ENABLED,
    depth: WEBGL_DEPTH_ENABLED,
    stencil: WEBGL_STENCIL_ENABLED,
    powerPreference: LOW_POWER_GPU_PREFERENCE,
    preserveDrawingBuffer: WEBGL_PRESERVE_DRAWING_BUFFER,
  });
}

function compileShader(
  webglContext: WebGLRenderingContext,
  shaderType: number,
  shaderSource: string,
): WebGLShader | null {
  const shader = webglContext.createShader(shaderType);
  if (!shader) return null;

  webglContext.shaderSource(shader, shaderSource);
  webglContext.compileShader(shader);

  const didCompile = webglContext.getShaderParameter(shader, webglContext.COMPILE_STATUS);
  if (didCompile) return shader;

  console.warn(PYRAMID_SHADER_LOG_LABEL, webglContext.getShaderInfoLog(shader));
  webglContext.deleteShader(shader);
  return null;
}

function deleteShaderIfPresent(webglContext: WebGLRenderingContext, shader: WebGLShader | null): void {
  if (!shader) return;
  webglContext.deleteShader(shader);
}

function linkShaderProgram(
  webglContext: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
): WebGLProgram | null {
  const vertexShader = compileShader(webglContext, webglContext.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(
    webglContext,
    webglContext.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  if (!vertexShader || !fragmentShader) {
    deleteShaderIfPresent(webglContext, vertexShader);
    deleteShaderIfPresent(webglContext, fragmentShader);
    return null;
  }

  const shaderProgram = webglContext.createProgram();
  if (!shaderProgram) return null;

  webglContext.attachShader(shaderProgram, vertexShader);
  webglContext.attachShader(shaderProgram, fragmentShader);
  webglContext.linkProgram(shaderProgram);
  webglContext.deleteShader(vertexShader);
  webglContext.deleteShader(fragmentShader);

  const didLink = webglContext.getProgramParameter(shaderProgram, webglContext.LINK_STATUS);
  if (didLink) return shaderProgram;

  console.warn(PYRAMID_SHADER_LOG_LABEL, webglContext.getProgramInfoLog(shaderProgram));
  webglContext.deleteProgram(shaderProgram);
  return null;
}

function createFullscreenQuadBuffer(webglContext: WebGLRenderingContext): WebGLBuffer | null {
  const vertexBuffer = webglContext.createBuffer();
  webglContext.bindBuffer(webglContext.ARRAY_BUFFER, vertexBuffer);
  webglContext.bufferData(webglContext.ARRAY_BUFFER, FULLSCREEN_QUAD_CORNERS, webglContext.STATIC_DRAW);
  return vertexBuffer;
}

function readThemeUniformValue(): number {
  const themeAttribute = document.documentElement.getAttribute(DOCUMENT_THEME_ATTRIBUTE);
  const isLightTheme = themeAttribute === LIGHT_THEME_ATTRIBUTE_VALUE;
  if (isLightTheme) return LIGHT_THEME_UNIFORM_VALUE;
  return DARK_THEME_UNIFORM_VALUE;
}

function createPyramidDrawSession(
  webglContext: WebGLRenderingContext,
  shaderProgram: WebGLProgram,
  vertexBuffer: WebGLBuffer | null,
  canvas: HTMLCanvasElement,
  shouldReduceMotion: boolean,
): PyramidDrawSession {
  return {
    webglContext,
    shaderProgram,
    vertexBuffer,
    canvas,
    shouldReduceMotion,
    positionAttributeLocation: webglContext.getAttribLocation(shaderProgram, POSITION_ATTRIBUTE_NAME),
    resolutionUniformLocation: webglContext.getUniformLocation(shaderProgram, RESOLUTION_UNIFORM_NAME),
    timeUniformLocation: webglContext.getUniformLocation(shaderProgram, TIME_UNIFORM_NAME),
    themeUniformLocation: webglContext.getUniformLocation(shaderProgram, THEME_UNIFORM_NAME),
  };
}

function paintPyramidFrame(session: PyramidDrawSession, timeSeconds: number): void {
  const { webglContext } = session;
  webglContext.useProgram(session.shaderProgram);
  webglContext.bindBuffer(webglContext.ARRAY_BUFFER, session.vertexBuffer);
  webglContext.enableVertexAttribArray(session.positionAttributeLocation);
  webglContext.vertexAttribPointer(
    session.positionAttributeLocation,
    VERTEX_FLOATS_PER_POSITION,
    webglContext.FLOAT,
    ARE_VERTEX_FLOATS_NORMALIZED,
    VERTEX_STRIDE_BYTES,
    VERTEX_OFFSET_BYTES,
  );
  // vocab: uniform = a value JavaScript pushes in for every pixel this frame
  webglContext.uniform2f(session.resolutionUniformLocation, session.canvas.width, session.canvas.height);
  const shaderTimeSeconds = session.shouldReduceMotion ? FROZEN_SHADER_TIME_SECONDS : timeSeconds;
  webglContext.uniform1f(session.timeUniformLocation, shaderTimeSeconds);
  webglContext.uniform1f(session.themeUniformLocation, readThemeUniformValue());
  webglContext.drawArrays(webglContext.TRIANGLES, DRAW_START_VERTEX, FULLSCREEN_QUAD_VERTEX_COUNT);
}

function resizePyramidCanvas(
  canvas: HTMLCanvasElement,
  webglContext: WebGLRenderingContext,
  isFixedToViewport: boolean,
): void {
  const parentElement = canvas.parentElement;
  const layoutWidth = isFixedToViewport
    ? window.innerWidth
    : parentElement?.clientWidth || window.innerWidth;
  const layoutHeight = isFixedToViewport
    ? window.innerHeight
    : parentElement?.clientHeight || window.innerHeight;
  const pixelWidth = Math.max(
    MINIMUM_CANVAS_DIMENSION_PX,
    Math.floor(layoutWidth * PYRAMID_CANVAS_RESOLUTION_SCALE),
  );
  const pixelHeight = Math.max(
    MINIMUM_CANVAS_DIMENSION_PX,
    Math.floor(layoutHeight * PYRAMID_CANVAS_RESOLUTION_SCALE),
  );

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  canvas.style.width = `${layoutWidth}px`;
  canvas.style.height = `${layoutHeight}px`;
  webglContext.viewport(0, 0, pixelWidth, pixelHeight);
}

function createPyramidAnimationState(shouldReduceMotion: boolean): PyramidAnimationState {
  return {
    animationFrameId: NO_ANIMATION_FRAME_ID,
    isDisposed: false,
    lastDrawTimestampMs: RESET_DRAW_TIMESTAMP_MS,
    startTimestampMs: performance.now(),
    shouldReduceMotion,
  };
}

function createPyramidFrameLoop(
  animation: PyramidAnimationState,
  paintFrame: (timeSeconds: number) => void,
): (now: number) => void {
  // This function is the heartbeat. The browser keeps calling it; we decide whether to repaint.
  const runAnimationFrame = (now: number) => {
    // vocab: now = timestamp in milliseconds from requestAnimationFrame
    // vocab: isDisposed = tear down already happened — don't touch WebGL
    if (animation.isDisposed) return;

    // vocab: requestAnimationFrame = call this again right before the next screen refresh
    animation.animationFrameId = window.requestAnimationFrame(runAnimationFrame);
    if (animation.shouldReduceMotion) return;

    // Manipulate here: lower FRAME_INTERVAL_MS = smoother but heavier; raise = calmer on laptops
    const millisecondsSinceLastPaint = now - animation.lastDrawTimestampMs;
    if (millisecondsSinceLastPaint < FRAME_INTERVAL_MS) return;

    animation.lastDrawTimestampMs = now;
    const elapsedSeconds = (now - animation.startTimestampMs) / MILLISECONDS_PER_SECOND;
    paintFrame(elapsedSeconds);
  };

  return runAnimationFrame;
}

function pausePyramidWhenTabIsHidden(
  animation: PyramidAnimationState,
  runAnimationFrame: (now: number) => void,
): void {
  const isTabHidden = document.hidden;
  if (isTabHidden) {
    window.cancelAnimationFrame(animation.animationFrameId);
    animation.animationFrameId = NO_ANIMATION_FRAME_ID;
    return;
  }

  const isLoopStopped = animation.animationFrameId === NO_ANIMATION_FRAME_ID;
  const shouldRestartLoop = !animation.shouldReduceMotion && isLoopStopped;
  if (!shouldRestartLoop) return;

  animation.lastDrawTimestampMs = RESET_DRAW_TIMESTAMP_MS;
  animation.animationFrameId = window.requestAnimationFrame(runAnimationFrame);
}

function createThemeRepaintObserver(
  animation: PyramidAnimationState,
  paintFrame: (timeSeconds: number) => void,
): MutationObserver {
  // vocab: MutationObserver = watch the DOM. The sun/moon toggle changes data-theme on <html>.
  return new MutationObserver(() => {
    const elapsedSeconds = (performance.now() - animation.startTimestampMs) / MILLISECONDS_PER_SECOND;
    paintFrame(elapsedSeconds);
  });
}

function attachPyramidPageListeners(input: PyramidListenerInput): () => void {
  window.addEventListener(RESIZE_EVENT, input.resizeCanvas);
  document.addEventListener(VISIBILITY_CHANGE_EVENT, input.pauseWhenTabHidden);
  input.themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [DOCUMENT_THEME_ATTRIBUTE],
  });

  // vocab: ResizeObserver = fires when the parent box changes size, not only the window
  const parentResizeObserver = new ResizeObserver(input.resizeCanvas);
  if (input.canvas.parentElement) parentResizeObserver.observe(input.canvas.parentElement);

  return () => {
    window.removeEventListener(RESIZE_EVENT, input.resizeCanvas);
    document.removeEventListener(VISIBILITY_CHANGE_EVENT, input.pauseWhenTabHidden);
    input.themeObserver.disconnect();
    parentResizeObserver.disconnect();
  };
}

function bootPyramidFrames(
  animation: PyramidAnimationState,
  resizeCanvas: () => void,
  paintFrame: (timeSeconds: number) => void,
  runAnimationFrame: (now: number) => void,
): void {
  resizeCanvas();
  paintFrame(INITIAL_SHADER_TIME_SECONDS);
  if (animation.shouldReduceMotion) return;
  animation.animationFrameId = window.requestAnimationFrame(runAnimationFrame);
}

function releasePyramidGpuResources(input: PyramidReleaseInput): void {
  input.animation.isDisposed = true;
  window.cancelAnimationFrame(input.animation.animationFrameId);
  input.detachListeners();
  input.webglContext.deleteProgram(input.shaderProgram);
  input.webglContext.deleteBuffer(input.vertexBuffer);
}

function openPyramidDrawSession(
  canvas: HTMLCanvasElement,
  webglContext: WebGLRenderingContext,
  shaderProgram: WebGLProgram,
  shouldReduceMotion: boolean,
) {
  const vertexBuffer = createFullscreenQuadBuffer(webglContext);
  const session = createPyramidDrawSession(
    webglContext,
    shaderProgram,
    vertexBuffer,
    canvas,
    shouldReduceMotion,
  );
  const animation = createPyramidAnimationState(shouldReduceMotion);
  const paintFrame = (timeSeconds: number) => paintPyramidFrame(session, timeSeconds);
  const runAnimationFrame = createPyramidFrameLoop(animation, paintFrame);
  return { vertexBuffer, animation, paintFrame, runAnimationFrame };
}

function startPyramidRenderLoop(
  canvas: HTMLCanvasElement,
  webglContext: WebGLRenderingContext,
  shaderProgram: WebGLProgram,
  isFixedToViewport: boolean,
  shouldReduceMotion: boolean,
): () => void {
  const drawSession = openPyramidDrawSession(canvas, webglContext, shaderProgram, shouldReduceMotion);
  const resizeCanvas = () => resizePyramidCanvas(canvas, webglContext, isFixedToViewport);
  const themeObserver = createThemeRepaintObserver(drawSession.animation, drawSession.paintFrame);
  const pauseWhenTabHidden = () => {
    pausePyramidWhenTabIsHidden(drawSession.animation, drawSession.runAnimationFrame);
  };

  bootPyramidFrames(
    drawSession.animation,
    resizeCanvas,
    drawSession.paintFrame,
    drawSession.runAnimationFrame,
  );
  const detachListeners = attachPyramidPageListeners({
    canvas,
    resizeCanvas,
    pauseWhenTabHidden,
    themeObserver,
  });

  return () =>
    releasePyramidGpuResources({
      animation: drawSession.animation,
      detachListeners,
      webglContext,
      shaderProgram,
      vertexBuffer: drawSession.vertexBuffer,
    });
}

function mountPyramidShader(
  canvas: HTMLCanvasElement,
  isFixedToViewport: boolean,
): (() => void) | void {
  const shouldReduceMotion = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;
  const webglContext = createLowPowerWebglContext(canvas);
  if (!webglContext) return;

  const shaderProgram = linkShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
  if (!shaderProgram) return;

  return startPyramidRenderLoop(
    canvas,
    webglContext,
    shaderProgram,
    isFixedToViewport,
    shouldReduceMotion,
  );
}

// ===== MAIN COMPONENT =====

/**
 * Full-screen pyramid scale field. Pauses when the tab is hidden or motion is reduced.
 * @param props.className - Extra classes on the canvas
 * @param props.fixed - Stick to the window when true, otherwise fill the parent box
 * @returns The WebGL canvas
 */
export default function PyramidShaderBackground({
  className = DEFAULT_CLASS_NAME,
  fixed = DEFAULT_IS_FIXED,
}: PyramidShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // vocab: useEffect = run setup after paint; the returned function runs when this leaves the page
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return mountPyramidShader(canvas, fixed);
  }, [fixed]);

  const positionClass = fixed ? FIXED_CANVAS_POSITION_CLASS : ABSOLUTE_CANVAS_POSITION_CLASS;

  return (
    <canvas
      ref={canvasRef}
      className={`${PYRAMID_CANVAS_CLASS} ${positionClass} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
