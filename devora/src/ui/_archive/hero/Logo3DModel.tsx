"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function Logo3DModel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    camera.position.z = 2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load("/logo/LogoModel-optimized.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.set(1, 1, 1);
      scene.add(model);

      // Jump animation every 5 seconds
      let animationId: number;
      let jumpStartTime = 0;
      let isJumping = false;
      const jumpDuration = 0.8; // 0.8 seconds for each jump
      
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        
        const currentTime = Date.now() / 1000;
        
        // Start jump every 5 seconds
        if (currentTime % 5 < 0.1 && !isJumping) {
          isJumping = true;
          jumpStartTime = currentTime;
        }
        
        // Handle jump animation
        if (isJumping) {
          const jumpElapsed = currentTime - jumpStartTime;
          if (jumpElapsed < jumpDuration) {
            // Jump up and down using sine wave
            const jumpHeight = Math.sin((jumpElapsed / jumpDuration) * Math.PI) * 0.5;
            model.position.y = jumpHeight;
          } else {
            model.position.y = 0;
            isJumping = false;
          }
        }
        
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(animationId);
      };
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight, false);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
