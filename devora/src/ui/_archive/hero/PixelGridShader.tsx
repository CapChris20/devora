'use client';

import { useRef, useEffect } from 'react';

export default function PixelGridShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    gl.viewport(0, 0, width, height);

    let mouseX = 0.5;
    let mouseY = 0.5;
    let mouseTrail = new Map();

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / width;
      mouseY = 1.0 - (e.clientY / height);
      
      // Create trail entry
      const gridSize = 16;
      const gridX = Math.floor(mouseX * gridSize);
      const gridY = Math.floor(mouseY * gridSize);
      const key = `${gridX},${gridY}`;
      mouseTrail.set(key, { time: Date.now(), x: gridX, y: gridY });
    });

    // Load the mountain image
    const image = new Image();
    image.src = '/images/mountain-bg.png';
    image.onload = () => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const vertexShader = `
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
          vUv = position * 0.5 + 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const fragmentShader = `
        precision highp float;
        uniform sampler2D uTexture;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          // Flip UV to correct image
          vec2 uv = vec2(1.0 - vUv.x, 1.0 - vUv.y);
          
          // Grid size in pixels (bigger = larger blocks)
          float gridSize = 16.0;
          
          // Snap to grid cell
          vec2 gridCell = floor(uv * uResolution.xy / gridSize);
          vec2 gridCellCenter = (gridCell + 0.5) * gridSize / uResolution.xy;
          
          // Sample the image at the grid cell center
          vec3 bgColor = texture2D(uTexture, gridCellCenter).rgb;
          
          // Create pixel borders (dark lines between cells)
          vec2 pixelUv = fract(uv * uResolution.xy / gridSize);
          float borderSize = 0.08;
          float borderX = step(pixelUv.x, borderSize) + step(1.0 - borderSize, pixelUv.x);
          float borderY = step(pixelUv.y, borderSize) + step(1.0 - borderSize, pixelUv.y);
          float border = max(borderX, borderY);
          
          // Cursor glow effect
          vec2 distFromMouse = uMouse - uv;
          float cursorDist = length(distFromMouse);
          float cursorGlow = exp(-cursorDist * cursorDist * 15.0) * 0.8;
          
          // Combine: background + borders + cursor glow
          vec3 finalColor = mix(bgColor, bgColor * 0.5, border * 0.3);
          finalColor += vec3(1.0, 0.34, 0.66) * cursorGlow;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `;

      const program = gl.createProgram();
      if (!program) return;

      const vShader = gl.createShader(gl.VERTEX_SHADER);
      if (!vShader) return;
      gl.shaderSource(vShader, vertexShader);
      gl.compileShader(vShader);
      gl.attachShader(program, vShader);

      const fShader = gl.createShader(gl.FRAGMENT_SHADER);
      if (!fShader) return;
      gl.shaderSource(fShader, fragmentShader);
      gl.compileShader(fShader);
      if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fShader));
      }
      gl.attachShader(program, fShader);

      gl.linkProgram(program);
      gl.useProgram(program);

      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );

      const posLocation = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(posLocation);
      gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

      const resolutionLoc = gl.getUniformLocation(program, 'uResolution');
      const mouseLoc = gl.getUniformLocation(program, 'uMouse');
      const timeLoc = gl.getUniformLocation(program, 'uTime');
      const textureLoc = gl.getUniformLocation(program, 'uTexture');

      gl.uniform2f(resolutionLoc, width, height);
      gl.uniform1i(textureLoc, 0);

      let startTime = Date.now();
      const render = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        
        // Clean up old trail entries
        const now = Date.now();
        for (let [key, entry] of mouseTrail.entries()) {
          if (now - entry.time > 500) {
            mouseTrail.delete(key);
          }
        }
        
        gl.uniform1f(timeLoc, elapsed);
        gl.uniform2f(mouseLoc, mouseX, mouseY);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
      };
      render();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
