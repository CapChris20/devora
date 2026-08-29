'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Particle {
  t: number;
  speed: number;
  mx: number;
  my: number;
  mz: number;
  cx: number;
  cy: number;
  cz: number;
  randomRadiusOffset: number;
}

function AntigravityInner({
  count = 300,
  color = '#ff5ca8',
  magnetRadius = 15,
  ringRadius = 8,
  lerpSpeed = 0.15,
  waveSpeed = 3,
  waveAmplitude = 2,
  fieldStrength = 1.5,
}: {
  count?: number;
  color?: string;
  magnetRadius?: number;
  ringRadius?: number;
  lerpSpeed?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  fieldStrength?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport, mouse } = useThree();
  const particlesRef = useRef<Particle[]>([]);
  const globalRotationRef = useRef(0);
  const targetPosRef = useRef(new THREE.Vector3());

  const particles = useMemo(() => {
    const temp: Particle[] = [];
    const width = viewport.width || 100;
    const height = viewport.height || 100;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * width * 1.5;
      const y = (Math.random() - 0.5) * height * 1.5;
      const z = (Math.random() - 0.5) * 30;
      temp.push({
        t: Math.random() * 100,
        speed: 0.01 + Math.random() / 200,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        randomRadiusOffset: (Math.random() - 0.5) * 2,
      });
    }
    return temp;
  }, [count, viewport.width, viewport.height]);

  particlesRef.current = particles;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime();
    globalRotationRef.current += 0.0005;

    const mouseX = (mouse.x * viewport.width) / 2;
    const mouseY = (mouse.y * viewport.height) / 2;

    particles.forEach((particle, i) => {
      let targetPos = targetPosRef.current;

      const dx = mouseX - particle.mx;
      const dy = mouseY - particle.my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotationRef.current;
        const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude);
        const deviation = particle.randomRadiusOffset * (5 / (fieldStrength + 0.1));
        const currentRingRadius = ringRadius + wave + deviation;

        targetPos.x = mouseX + currentRingRadius * Math.cos(angle);
        targetPos.y = mouseY + currentRingRadius * Math.sin(angle);
        targetPos.z = particle.mz;
      } else {
        targetPos.x = particle.mx;
        targetPos.y = particle.my;
        targetPos.z = particle.mz;
      }

      particle.cx += (targetPos.x - particle.cx) * lerpSpeed;
      particle.cy += (targetPos.y - particle.cy) * lerpSpeed;
      particle.cz += (targetPos.z - particle.cz) * lerpSpeed;

      const matrix = new THREE.Matrix4();
      matrix.setPosition(particle.cx, particle.cy, particle.cz);
      meshRef.current!.setMatrixAt(i, matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial color={color} wireframe={false} />
      </instancedMesh>
    </>
  );
}

export function AntigravityBg({
  count = 300,
  color = '#ff5ca8',
  magnetRadius = 15,
  ringRadius = 8,
}: {
  count?: number;
  color?: string;
  magnetRadius?: number;
  ringRadius?: number;
}) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{
          position: [0, 0, 50],
          fov: 35,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <AntigravityInner
          count={count}
          color={color}
          magnetRadius={magnetRadius}
          ringRadius={ringRadius}
        />
      </Canvas>
    </div>
  );
}

export default AntigravityBg;
