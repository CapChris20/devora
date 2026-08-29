"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  fragmentShader,
  vertexShader,
} from "../shaders/devora-terrain.frag.glsl";

/** Render scale — 0.5 = half res, ~4x fewer pixels. */
const RENDER_SCALE = 0.55;
/** Cap terrain at 30fps so the coin shader gets GPU headroom. */
const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;

/** Devora-colored terrain flythrough — performance-tuned for laptops. */
export default function TerrainBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x0d0026, 1);

    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.imageRendering = "auto";
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      iMouse: { value: new THREE.Vector2(0, 0) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      glslVersion: THREE.GLSL1,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let frameId = 0;
    let isVisible = true;
    let lastFrame = 0;
    let renderW = 0;
    let renderH = 0;

    const resize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const rw = Math.max(1, Math.floor(w * RENDER_SCALE));
      const rh = Math.max(1, Math.floor(h * RENDER_SCALE));
      if (rw === renderW && rh === renderH) return;
      renderW = rw;
      renderH = rh;
      renderer.setSize(rw, rh, false);
      uniforms.iResolution.value.set(rw, rh, 1);
    };

    resize();

    const render = (now: number) => {
      frameId = requestAnimationFrame(render);
      if (!isVisible) return;
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      const t = clock.getElapsedTime();
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      uniforms.iTime.value = t;
      uniforms.iMouse.value.set(
        w * 0.5 + Math.sin(t * 0.15) * w * 0.1,
        h * 0.45,
      );

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(render);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(container);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      container.removeChild(canvas);
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 h-full w-full min-h-[100dvh]"
    />
  );
}
