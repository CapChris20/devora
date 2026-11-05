// Reusable WebGL full-screen background renderer.
// Flow: creates low-power WebGL context → compiles custom fragment shader → renders animated Devora canvas.
// Pauses when tab is hidden, respects prefers-reduced-motion, and reacts to data-theme changes.

"use client";

// ===== IMPORTS =====

import { useEffect, useRef } from "react";

// ===== NAMED CONSTANTS =====

const WEBGL_CONTEXT_NAME = "webgl" as const;
const EXPERIMENTAL_WEBGL_CONTEXT_NAME = "experimental-webgl" as const;
const LOW_POWER_GPU_PREFERENCE = "low-power" as const;
const WEBGL_ALPHA_ENABLED = false;
const WEBGL_ANTIALIAS_ENABLED = false;
const WEBGL_DEPTH_ENABLED = false;
const WEBGL_STENCIL_ENABLED = false;
const WEBGL_PRESERVE_DRAWING_BUFFER = false;

const SHADER_CANVAS_LOG_LABEL = "[ShaderBackgroundCanvas]";
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

const FRAME_INTERVAL_MS = 33; // ~30fps for smooth drift with minimal power draw
const MILLISECONDS_PER_SECOND = 1000;
const INITIAL_SHADER_TIME_SECONDS = 0;
const FROZEN_SHADER_TIME_SECONDS = 0;
const NO_ANIMATION_FRAME_ID = 0;
const RESET_DRAW_TIMESTAMP_MS = 0;
const DEFAULT_CANVAS_RESOLUTION_SCALE = 0.75;
const MINIMUM_CANVAS_DIMENSION_PX = 2;

const RESIZE_EVENT = "resize";
const VISIBILITY_CHANGE_EVENT = "visibilitychange";
const BASE_CANVAS_CLASS = "pointer-events-none";
const FIXED_CANVAS_POSITION_CLASS = "fixed inset-0";
const ABSOLUTE_CANVAS_POSITION_CLASS = "absolute inset-0";

const VERTEX_SHADER_SOURCE = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// ===== TYPES =====

export type ShaderBackgroundCanvasProps = {
  className?: string;
  fixed?: boolean;
  fragmentShaderSource: string;
  resolutionScale?: number;
};

type DrawSession = {
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

type AnimationState = {
  animationFrameId: number;
  isDisposed: boolean;
  lastDrawTimestampMs: number;
  startTimestampMs: number;
  shouldReduceMotion: boolean;
};

// ===== HELPER FUNCTIONS =====

function createLowPowerWebglContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  const options = {
    alpha: WEBGL_ALPHA_ENABLED,
    antialias: WEBGL_ANTIALIAS_ENABLED,
    depth: WEBGL_DEPTH_ENABLED,
    stencil: WEBGL_STENCIL_ENABLED,
    powerPreference: LOW_POWER_GPU_PREFERENCE,
    preserveDrawingBuffer: WEBGL_PRESERVE_DRAWING_BUFFER,
  };
  return (
    (canvas.getContext(WEBGL_CONTEXT_NAME, options) as WebGLRenderingContext | null) ||
    (canvas.getContext(EXPERIMENTAL_WEBGL_CONTEXT_NAME, options) as WebGLRenderingContext | null)
  );
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

  console.warn(SHADER_CANVAS_LOG_LABEL, webglContext.getShaderInfoLog(shader));
  webglContext.deleteShader(shader);
  return null;
}

function linkShaderProgram(
  webglContext: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
): WebGLProgram | null {
  const vertexShader = compileShader(webglContext, webglContext.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(webglContext, webglContext.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) {
    if (vertexShader) webglContext.deleteShader(vertexShader);
    if (fragmentShader) webglContext.deleteShader(fragmentShader);
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

  console.warn(SHADER_CANVAS_LOG_LABEL, webglContext.getProgramInfoLog(shaderProgram));
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
  if (typeof document === "undefined") return DARK_THEME_UNIFORM_VALUE;
  const themeAttribute = document.documentElement.getAttribute(DOCUMENT_THEME_ATTRIBUTE);
  return themeAttribute === LIGHT_THEME_ATTRIBUTE_VALUE
    ? LIGHT_THEME_UNIFORM_VALUE
    : DARK_THEME_UNIFORM_VALUE;
}

function resizeCanvasToViewport(
  canvas: HTMLCanvasElement,
  webglContext: WebGLRenderingContext,
  isFixedToViewport: boolean,
  resolutionScale: number,
): void {
  if (typeof window === "undefined") return;
  const parentElement = canvas.parentElement;
  const layoutWidth = isFixedToViewport
    ? window.innerWidth
    : parentElement?.clientWidth || window.innerWidth;
  const layoutHeight = isFixedToViewport
    ? window.innerHeight
    : parentElement?.clientHeight || window.innerHeight;

  const pixelWidth = Math.max(
    MINIMUM_CANVAS_DIMENSION_PX,
    Math.floor(layoutWidth * resolutionScale),
  );
  const pixelHeight = Math.max(
    MINIMUM_CANVAS_DIMENSION_PX,
    Math.floor(layoutHeight * resolutionScale),
  );

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  canvas.style.width = `${layoutWidth}px`;
  canvas.style.height = `${layoutHeight}px`;
  webglContext.viewport(0, 0, pixelWidth, pixelHeight);
}

// ===== MAIN COMPONENT =====

export default function ShaderBackgroundCanvas({
  className = "",
  fixed = false,
  fragmentShaderSource,
  resolutionScale = DEFAULT_CANVAS_RESOLUTION_SCALE,
}: ShaderBackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const webglContext = createLowPowerWebglContext(canvas);
    if (!webglContext) return;

    const shaderProgram = linkShaderProgram(
      webglContext,
      VERTEX_SHADER_SOURCE,
      fragmentShaderSource,
    );
    if (!shaderProgram) return;

    const vertexBuffer = createFullscreenQuadBuffer(webglContext);

    const shouldReduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;

    const drawSession: DrawSession = {
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

    const animation: AnimationState = {
      animationFrameId: NO_ANIMATION_FRAME_ID,
      isDisposed: false,
      lastDrawTimestampMs: RESET_DRAW_TIMESTAMP_MS,
      startTimestampMs: performance.now(),
      shouldReduceMotion,
    };

    const paintFrame = (timeSeconds: number) => {
      webglContext.useProgram(drawSession.shaderProgram);
      webglContext.bindBuffer(webglContext.ARRAY_BUFFER, drawSession.vertexBuffer);
      webglContext.enableVertexAttribArray(drawSession.positionAttributeLocation);
      webglContext.vertexAttribPointer(
        drawSession.positionAttributeLocation,
        VERTEX_FLOATS_PER_POSITION,
        webglContext.FLOAT,
        ARE_VERTEX_FLOATS_NORMALIZED,
        VERTEX_STRIDE_BYTES,
        VERTEX_OFFSET_BYTES,
      );

      webglContext.uniform2f(
        drawSession.resolutionUniformLocation,
        drawSession.canvas.width,
        drawSession.canvas.height,
      );

      const shaderTimeSeconds = drawSession.shouldReduceMotion
        ? FROZEN_SHADER_TIME_SECONDS
        : timeSeconds;
      webglContext.uniform1f(drawSession.timeUniformLocation, shaderTimeSeconds);
      webglContext.uniform1f(drawSession.themeUniformLocation, readThemeUniformValue());

      webglContext.drawArrays(
        webglContext.TRIANGLES,
        DRAW_START_VERTEX,
        FULLSCREEN_QUAD_VERTEX_COUNT,
      );
    };

    const runAnimationFrame = (now: number) => {
      if (animation.isDisposed) return;
      animation.animationFrameId = window.requestAnimationFrame(runAnimationFrame);
      if (animation.shouldReduceMotion) return;

      const elapsedMs = now - animation.lastDrawTimestampMs;
      if (elapsedMs < FRAME_INTERVAL_MS) return;

      animation.lastDrawTimestampMs = now;
      const elapsedSeconds = (now - animation.startTimestampMs) / MILLISECONDS_PER_SECOND;
      paintFrame(elapsedSeconds);
    };

    const handleResize = () => {
      resizeCanvasToViewport(canvas, webglContext, fixed, resolutionScale);
      paintFrame((performance.now() - animation.startTimestampMs) / MILLISECONDS_PER_SECOND);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animation.animationFrameId);
        animation.animationFrameId = NO_ANIMATION_FRAME_ID;
      } else if (!animation.shouldReduceMotion) {
        animation.lastDrawTimestampMs = RESET_DRAW_TIMESTAMP_MS;
        animation.animationFrameId = window.requestAnimationFrame(runAnimationFrame);
      }
    };

    const themeObserver = new MutationObserver(() => {
      paintFrame((performance.now() - animation.startTimestampMs) / MILLISECONDS_PER_SECOND);
    });

    handleResize();
    paintFrame(INITIAL_SHADER_TIME_SECONDS);

    if (!shouldReduceMotion) {
      animation.animationFrameId = window.requestAnimationFrame(runAnimationFrame);
    }

    window.addEventListener(RESIZE_EVENT, handleResize);
    document.addEventListener(VISIBILITY_CHANGE_EVENT, handleVisibilityChange);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [DOCUMENT_THEME_ATTRIBUTE],
    });

    return () => {
      animation.isDisposed = true;
      window.cancelAnimationFrame(animation.animationFrameId);
      window.removeEventListener(RESIZE_EVENT, handleResize);
      document.removeEventListener(VISIBILITY_CHANGE_EVENT, handleVisibilityChange);
      themeObserver.disconnect();

      webglContext.deleteProgram(shaderProgram);
      if (vertexBuffer) webglContext.deleteBuffer(vertexBuffer);
    };
  }, [fixed, fragmentShaderSource, resolutionScale]);

  const positionClass = fixed ? FIXED_CANVAS_POSITION_CLASS : ABSOLUTE_CANVAS_POSITION_CLASS;

  return (
    <canvas
      ref={canvasRef}
      className={`${BASE_CANVAS_CLASS} ${positionClass} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
