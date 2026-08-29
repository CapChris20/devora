"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { fragmentShader, vertexShader } from "../shaders/water-background.frag.glsl";

function WaterPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      iMouse: { value: new THREE.Vector3(0, 0, 0) },
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

function getDpr() {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio, 1.25);
}

export default function WaterBackground() {
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    setDpr(getDpr());
    const onResize = () => setDpr(getDpr());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="absolute inset-0 h-full w-full min-h-[100dvh]">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
        dpr={dpr}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#1a0a2e", 1);
        }}
        className="!h-full !w-full"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <WaterPlane />
      </Canvas>
    </div>
  );
}
