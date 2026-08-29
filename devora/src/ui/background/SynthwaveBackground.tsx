"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { fragmentShader, vertexShader } from "../shaders/synthwave.frag.glsl";

function SynthwavePlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      uBass: { value: 0.35 },
    }),
    [],
  );

  useFrame((state) => {
    if (!materialRef.current) return;

    const dpr = state.viewport.dpr;
    const { width, height } = state.size;
    const t = state.clock.elapsedTime;

    materialRef.current.uniforms.iTime.value = t;
    materialRef.current.uniforms.iResolution.value.set(
      width * dpr,
      height * dpr,
      1,
    );

    const spike = Math.max(0, Math.sin(t * 7.3) * Math.sin(t * 13.1));
    const burst = Math.pow(hashLike(t), 8.0) * 0.9;
    materialRef.current.uniforms.uBass.value =
      0.32 + spike * 0.25 + burst;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        glslVersion={THREE.GLSL1}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function hashLike(t: number) {
  return Math.abs(Math.sin(t * 12.9898) * 43758.5453) % 1;
}

function getDpr() {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio, 1);
}

/**
 * Synthwave scene — purple sky, sun, mountains, and perspective grid.
 */
export default function SynthwaveBackground() {
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    setDpr(getDpr());
    const onResize = () => setDpr(getDpr());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      className="absolute inset-0 h-full w-full min-h-[100dvh]"
      style={{ imageRendering: "pixelated" }}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
        dpr={dpr}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        className="!h-full !w-full"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          imageRendering: "pixelated",
        }}
      >
        <SynthwavePlane />
      </Canvas>
    </div>
  );
}
