// Animated crystal-cell background for the hero and inner pages.
// Flow: boot WebGL → each frame sends time, theme, and pointer → the GPU paints Devora-colored cells.
// Cheap on purpose: half-res canvas, about 30fps, and it pauses when the tab is hidden.
// Callers import VoronoiShaderBackgroundClient, which loads this file only in the browser.

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
const DERIVATIVE_EXTENSION_NAME = "OES_standard_derivatives";
const VORONOI_SHADER_LOG_LABEL = "[VoronoiShader]";
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";
const DOCUMENT_THEME_ATTRIBUTE = "data-theme";
const LIGHT_THEME_ATTRIBUTE_VALUE = "light";
const LIGHT_THEME_UNIFORM_VALUE = 1;
const DARK_THEME_UNIFORM_VALUE = 0;
const POSITION_ATTRIBUTE_NAME = "aPos";
const RESOLUTION_UNIFORM_NAME = "uResolution";
const TIME_UNIFORM_NAME = "uTime";
const THEME_UNIFORM_NAME = "uTheme";
const MOUSE_UNIFORM_NAME = "uMouse";
const VERTEX_FLOATS_PER_POSITION = 2;
const ARE_VERTEX_FLOATS_NORMALIZED = false;
const VERTEX_STRIDE_BYTES = 0;
const VERTEX_OFFSET_BYTES = 0;
const DRAW_START_VERTEX = 0;
const FULLSCREEN_QUAD_VERTEX_COUNT = 6;
const FULLSCREEN_QUAD_CORNERS = new Float32Array([
  -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
]);
// Manipulate here: lower = smoother but heavier GPU; 33 is about 30fps
const FRAME_INTERVAL_MS = 33;
const MILLISECONDS_PER_SECOND = 1000;
const INITIAL_SHADER_TIME_SECONDS = 0;
const FROZEN_SHADER_TIME_SECONDS = 0;
const NO_ANIMATION_FRAME_ID = 0;
const RESET_DRAW_TIMESTAMP_MS = 0;
// Manipulate here: raise (for example 0.75) = sharper but heavier; lower = faster
const VORONOI_CANVAS_RESOLUTION_SCALE = 0.55;
const MINIMUM_CANVAS_DIMENSION_PX = 2;
const MINIMUM_VIEWPORT_DIMENSION_PX = 1;
const POINTER_UNIT_MIN = 0;
const POINTER_UNIT_MAX = 1;
const MOUSE_START_POSITION = 0.5;
const IDLE_MOUSE_X = -1;
const IDLE_MOUSE_Y = -1;
// Manipulate here: higher = the cells catch the pointer faster; lower = smoother lag
const MOUSE_EASE_FACTOR = 0.18;
const RESIZE_EVENT = "resize";
const POINTER_MOVE_EVENT = "pointermove";
const POINTER_DOWN_EVENT = "pointerdown";
const VISIBILITY_CHANGE_EVENT = "visibilitychange";
const PASSIVE_LISTENER_OPTIONS: AddEventListenerOptions = { passive: true };
const VORONOI_CANVAS_CLASS = "voronoi-shader-bg pointer-events-none";
const FIXED_CANVAS_POSITION_CLASS = "fixed inset-0";
const ABSOLUTE_CANVAS_POSITION_CLASS = "absolute inset-0";
const DEFAULT_CLASS_NAME = "";
const DEFAULT_IS_FIXED = false;

// Single-letter names inside the shader (p, s, e, md, uv) are GPU math locals.
// They stay short on purpose. The formulas below must stay byte-for-byte.
// --- VERTEX SHADER (tiny) ---
// vocab: shader = tiny GPU program. Vertex shader = places the corners of the full-screen shape.
// We only draw a rectangle that covers the screen; the pretty look is in the fragment shader.
const VERTEX_SHADER_SOURCE = `
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
const FRAGMENT_SHADER_SOURCE = `
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
const FRAGMENT_SHADER_FALLBACK = FRAGMENT_SHADER_SOURCE.replace(
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


// ===== TYPES =====

type VoronoiShaderBackgroundProps = {
  className?: string;
  // true = stick to the whole browser window (inner pages). false = only fill the hero box.
  fixed?: boolean;
};

type VoronoiPointerState = {
  isMouseActive: boolean;
  targetX: number;
  targetY: number;
  easedX: number;
  easedY: number;
};

type VoronoiDrawSession = {
  webglContext: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  vertexBuffer: WebGLBuffer | null;
  canvas: HTMLCanvasElement;
  shouldReduceMotion: boolean;
  pointerState: VoronoiPointerState;
  positionAttributeLocation: number;
  resolutionUniformLocation: WebGLUniformLocation | null;
  timeUniformLocation: WebGLUniformLocation | null;
  themeUniformLocation: WebGLUniformLocation | null;
  mouseUniformLocation: WebGLUniformLocation | null;
};

type VoronoiAnimationState = {
  animationFrameId: number;
  isDisposed: boolean;
  lastDrawTimestampMs: number;
  startTimestampMs: number;
  shouldReduceMotion: boolean;
};

type VoronoiListenerInput = {
  canvas: HTMLCanvasElement;
  resizeCanvas: () => void;
  onPointer: (pointerEvent: PointerEvent) => void;
  pauseWhenTabHidden: () => void;
  themeObserver: MutationObserver;
};

type VoronoiReleaseInput = {
  animation: VoronoiAnimationState;
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

  console.warn(VORONOI_SHADER_LOG_LABEL, webglContext.getShaderInfoLog(shader));
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

  console.warn(VORONOI_SHADER_LOG_LABEL, webglContext.getProgramInfoLog(shaderProgram));
  webglContext.deleteProgram(shaderProgram);
  return null;
}

function linkVoronoiProgram(webglContext: WebGLRenderingContext): WebGLProgram | null {
  const derivativeExtension = webglContext.getExtension(DERIVATIVE_EXTENSION_NAME);
  const fastProgram = derivativeExtension
    ? linkShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE)
    : null;
  if (fastProgram) return fastProgram;
  return linkShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_FALLBACK);
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

function createVoronoiPointerState(): VoronoiPointerState {
  return {
    isMouseActive: false,
    targetX: MOUSE_START_POSITION,
    targetY: MOUSE_START_POSITION,
    easedX: MOUSE_START_POSITION,
    easedY: MOUSE_START_POSITION,
  };
}

function clampUnitInterval(value: number): number {
  return Math.min(POINTER_UNIT_MAX, Math.max(POINTER_UNIT_MIN, value));
}

function updateVoronoiPointerTarget(
  pointerEvent: PointerEvent,
  pointerState: VoronoiPointerState,
  shouldReduceMotion: boolean,
): void {
  if (shouldReduceMotion) return;

  const viewportWidth = Math.max(MINIMUM_VIEWPORT_DIMENSION_PX, window.innerWidth);
  const viewportHeight = Math.max(MINIMUM_VIEWPORT_DIMENSION_PX, window.innerHeight);
  // ShaderToy Y grows upward. Browser Y grows downward, so flip it.
  pointerState.targetX = clampUnitInterval(pointerEvent.clientX / viewportWidth);
  pointerState.targetY = clampUnitInterval(POINTER_UNIT_MAX - pointerEvent.clientY / viewportHeight);
  pointerState.isMouseActive = true;
}

function pushMouseUniform(
  webglContext: WebGLRenderingContext,
  mouseUniformLocation: WebGLUniformLocation | null,
  pointerState: VoronoiPointerState,
): void {
  if (!pointerState.isMouseActive) {
    // x of -1 is the idle signal inside the shader, so it uses the demo's default shape.
    webglContext.uniform2f(mouseUniformLocation, IDLE_MOUSE_X, IDLE_MOUSE_Y);
    return;
  }

  pointerState.easedX += (pointerState.targetX - pointerState.easedX) * MOUSE_EASE_FACTOR;
  pointerState.easedY += (pointerState.targetY - pointerState.easedY) * MOUSE_EASE_FACTOR;
  webglContext.uniform2f(mouseUniformLocation, pointerState.easedX, pointerState.easedY);
}

function createVoronoiDrawSession(
  webglContext: WebGLRenderingContext,
  shaderProgram: WebGLProgram,
  vertexBuffer: WebGLBuffer | null,
  canvas: HTMLCanvasElement,
  shouldReduceMotion: boolean,
  pointerState: VoronoiPointerState,
): VoronoiDrawSession {
  return {
    webglContext,
    shaderProgram,
    vertexBuffer,
    canvas,
    shouldReduceMotion,
    pointerState,
    positionAttributeLocation: webglContext.getAttribLocation(shaderProgram, POSITION_ATTRIBUTE_NAME),
    resolutionUniformLocation: webglContext.getUniformLocation(shaderProgram, RESOLUTION_UNIFORM_NAME),
    timeUniformLocation: webglContext.getUniformLocation(shaderProgram, TIME_UNIFORM_NAME),
    themeUniformLocation: webglContext.getUniformLocation(shaderProgram, THEME_UNIFORM_NAME),
    mouseUniformLocation: webglContext.getUniformLocation(shaderProgram, MOUSE_UNIFORM_NAME),
  };
}

function paintVoronoiFrame(session: VoronoiDrawSession, timeSeconds: number): void {
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
  pushMouseUniform(webglContext, session.mouseUniformLocation, session.pointerState);
  webglContext.drawArrays(webglContext.TRIANGLES, DRAW_START_VERTEX, FULLSCREEN_QUAD_VERTEX_COUNT);
}

function resizeVoronoiCanvas(
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
    Math.floor(layoutWidth * VORONOI_CANVAS_RESOLUTION_SCALE),
  );
  const pixelHeight = Math.max(
    MINIMUM_CANVAS_DIMENSION_PX,
    Math.floor(layoutHeight * VORONOI_CANVAS_RESOLUTION_SCALE),
  );

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  canvas.style.width = `${layoutWidth}px`;
  canvas.style.height = `${layoutHeight}px`;
  webglContext.viewport(0, 0, pixelWidth, pixelHeight);
}

function createVoronoiAnimationState(shouldReduceMotion: boolean): VoronoiAnimationState {
  return {
    animationFrameId: NO_ANIMATION_FRAME_ID,
    isDisposed: false,
    lastDrawTimestampMs: RESET_DRAW_TIMESTAMP_MS,
    startTimestampMs: performance.now(),
    shouldReduceMotion,
  };
}

function createVoronoiFrameLoop(
  animation: VoronoiAnimationState,
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

function pauseVoronoiWhenTabIsHidden(
  animation: VoronoiAnimationState,
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
  animation: VoronoiAnimationState,
  paintFrame: (timeSeconds: number) => void,
): MutationObserver {
  // vocab: MutationObserver = watch the DOM. The sun/moon toggle changes data-theme on <html>.
  return new MutationObserver(() => {
    const elapsedSeconds = (performance.now() - animation.startTimestampMs) / MILLISECONDS_PER_SECOND;
    paintFrame(elapsedSeconds);
  });
}

function attachVoronoiPageListeners(input: VoronoiListenerInput): () => void {
  window.addEventListener(RESIZE_EVENT, input.resizeCanvas);
  window.addEventListener(POINTER_MOVE_EVENT, input.onPointer, PASSIVE_LISTENER_OPTIONS);
  window.addEventListener(POINTER_DOWN_EVENT, input.onPointer, PASSIVE_LISTENER_OPTIONS);
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
    window.removeEventListener(POINTER_MOVE_EVENT, input.onPointer);
    window.removeEventListener(POINTER_DOWN_EVENT, input.onPointer);
    document.removeEventListener(VISIBILITY_CHANGE_EVENT, input.pauseWhenTabHidden);
    input.themeObserver.disconnect();
    parentResizeObserver.disconnect();
  };
}

function bootVoronoiFrames(
  animation: VoronoiAnimationState,
  resizeCanvas: () => void,
  paintFrame: (timeSeconds: number) => void,
  runAnimationFrame: (now: number) => void,
): void {
  resizeCanvas();
  paintFrame(INITIAL_SHADER_TIME_SECONDS);
  if (animation.shouldReduceMotion) return;
  animation.animationFrameId = window.requestAnimationFrame(runAnimationFrame);
}

function releaseVoronoiGpuResources(input: VoronoiReleaseInput): void {
  input.animation.isDisposed = true;
  window.cancelAnimationFrame(input.animation.animationFrameId);
  input.detachListeners();
  input.webglContext.deleteProgram(input.shaderProgram);
  input.webglContext.deleteBuffer(input.vertexBuffer);
}

function openVoronoiDrawSession(
  canvas: HTMLCanvasElement,
  webglContext: WebGLRenderingContext,
  shaderProgram: WebGLProgram,
  shouldReduceMotion: boolean,
) {
  const vertexBuffer = createFullscreenQuadBuffer(webglContext);
  const pointerState = createVoronoiPointerState();
  const session = createVoronoiDrawSession(
    webglContext,
    shaderProgram,
    vertexBuffer,
    canvas,
    shouldReduceMotion,
    pointerState,
  );
  const animation = createVoronoiAnimationState(shouldReduceMotion);
  const paintFrame = (timeSeconds: number) => paintVoronoiFrame(session, timeSeconds);
  const runAnimationFrame = createVoronoiFrameLoop(animation, paintFrame);
  return { vertexBuffer, pointerState, animation, paintFrame, runAnimationFrame };
}

function startVoronoiRenderLoop(
  canvas: HTMLCanvasElement,
  webglContext: WebGLRenderingContext,
  shaderProgram: WebGLProgram,
  isFixedToViewport: boolean,
  shouldReduceMotion: boolean,
): () => void {
  const drawSession = openVoronoiDrawSession(canvas, webglContext, shaderProgram, shouldReduceMotion);
  const resizeCanvas = () => resizeVoronoiCanvas(canvas, webglContext, isFixedToViewport);
  const onPointer = (pointerEvent: PointerEvent) => {
    updateVoronoiPointerTarget(pointerEvent, drawSession.pointerState, shouldReduceMotion);
  };
  const themeObserver = createThemeRepaintObserver(drawSession.animation, drawSession.paintFrame);
  const pauseWhenTabHidden = () => {
    pauseVoronoiWhenTabIsHidden(drawSession.animation, drawSession.runAnimationFrame);
  };

  bootVoronoiFrames(
    drawSession.animation,
    resizeCanvas,
    drawSession.paintFrame,
    drawSession.runAnimationFrame,
  );
  const detachListeners = attachVoronoiPageListeners({
    canvas,
    resizeCanvas,
    onPointer,
    pauseWhenTabHidden,
    themeObserver,
  });

  return () =>
    releaseVoronoiGpuResources({
      animation: drawSession.animation,
      detachListeners,
      webglContext,
      shaderProgram,
      vertexBuffer: drawSession.vertexBuffer,
    });
}

function mountVoronoiShader(
  canvas: HTMLCanvasElement,
  isFixedToViewport: boolean,
): (() => void) | void {
  const shouldReduceMotion = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;
  const webglContext = createLowPowerWebglContext(canvas);
  if (!webglContext) return;

  const shaderProgram = linkVoronoiProgram(webglContext);
  if (!shaderProgram) return;

  return startVoronoiRenderLoop(
    canvas,
    webglContext,
    shaderProgram,
    isFixedToViewport,
    shouldReduceMotion,
  );
}

// ===== MAIN COMPONENT =====

/**
 * Crystal-cell shader. Pointer movement softens the cells. Hidden tabs stop the loop.
 * @param props.className - Extra classes on the canvas
 * @param props.fixed - Stick to the window when true, otherwise fill the parent box
 * @returns The WebGL canvas
 */
export default function VoronoiShaderBackground({
  className = DEFAULT_CLASS_NAME,
  fixed = DEFAULT_IS_FIXED,
}: VoronoiShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // vocab: useEffect = run setup after paint; the returned function runs when this leaves the page
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return mountVoronoiShader(canvas, fixed);
  }, [fixed]);

  const positionClass = fixed ? FIXED_CANVAS_POSITION_CLASS : ABSOLUTE_CANVAS_POSITION_CLASS;

  return (
    <canvas
      ref={canvasRef}
      className={`${VORONOI_CANVAS_CLASS} ${positionClass} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
