// Background: an isometric floor drawn in ASCII on a canvas. Tile edges are / and \,
// tile faces shade with a slow wave so the floor seems to breathe. The one ambient loop.
// Scroll moves the floor a little slower than the page (depth). Reduced motion: one still frame.

import { useEffect, useRef } from "react";

const RAMP = "  .·:";
const FRAME_MS = 70;

export const AsciiIsoBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cw = 9;
    let ch = 15;
    let cols = 0;
    let rows = 0;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cw = w < 640 ? 8 : 9;
      ch = w < 640 ? 13 : 15;
      ctx.font = `${ch - 3}px "Space Mono", ui-monospace, monospace`;
      ctx.textBaseline = "top";
      cols = Math.ceil(w / cw) + 1;
      rows = Math.ceil(h / ch) + 1;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scroll = window.scrollY * 0.18;
      const tile = 7; // characters per tile edge
      for (let r = 0; r < rows; r++) {
        const y = r * ch;
        const py = (y + scroll) / ch;
        for (let c = 0; c < cols; c++) {
          const px = c * (cw / ch) * 1.1;
          // Isometric lattice: two diagonal axes.
          const a = (px + py * 2) / tile;
          const b = (px - py * 2) / tile;
          const fa = a - Math.floor(a);
          const fb = b - Math.floor(b);
          const ta = Math.floor(a);
          const tb = Math.floor(b);
          const edgeA = fa < 0.09;
          const edgeB = fb < 0.09;
          // Per-tile height wave: tiles rise and fall like blocks.
          const wave = Math.sin(ta * 0.55 + t * 0.6) * Math.cos(tb * 0.45 - t * 0.4);
          const level = (wave + 1) / 2;
          let char = "";
          let color = "";
          if (edgeA && edgeB) {
            char = "+";
            color = `rgba(201, 162, 255, ${0.16 + level * 0.12})`;
          } else if (edgeA) {
            char = "\\";
            color = `rgba(201, 162, 255, ${0.1 + level * 0.1})`;
          } else if (edgeB) {
            char = "/";
            color = `rgba(201, 162, 255, ${0.1 + level * 0.1})`;
          } else {
            const idx = Math.floor(level * level * (RAMP.length - 1) + 0.0001);
            char = RAMP[idx] ?? " ";
            if (char === " ") continue;
            const peak = level > 0.96;
            color = peak ? `rgba(255, 120, 190, ${0.2 + (level - 0.96) * 3})` : `rgba(168, 85, 247, ${0.06 + level * 0.12})`;
          }
          ctx.fillStyle = color;
          ctx.fillText(char, c * cw, y);
        }
      }
    };

    let raf = 0;
    let last = 0;
    const start = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || now - last < FRAME_MS) return;
      last = now;
      draw((now - start) / 1000);
    };

    const onResize = () => {
      resize();
      draw((performance.now() - start) / 1000);
    };
    const onScroll = () => {
      if (reduce) draw(0);
    };

    resize();
    draw(0);
    if (!reduce) raf = requestAnimationFrame(loop);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.fonts?.ready.then(onResize).catch(() => undefined);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="nb-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="nb-bg-canvas" />
      <div className="nb-bg-vignette" />
    </div>
  );
};
