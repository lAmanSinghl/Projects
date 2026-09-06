"use client";

import { useEffect, useRef } from "react";

export default function MovingGrid({ color = "0, 0, 0", opacity, size = 50, speed = 0.3, radius = 180, interactive = true, }) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const colorRef = useRef(color);
  const opacityRef = useRef(opacity);
  const interactiveRef = useRef(interactive);
  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);

  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let animationFrame;
    let offset = 0;

    const intensityMap = new Map();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;

      width = canvas.offsetWidth;
      height = canvas.offsetHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();

    const handleResize = () => resize();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();

      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.current.x = -1000;
      mouse.current.y = -1000;
    };

    window.addEventListener("resize", handleResize);

    if (interactiveRef.current) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
    } else {
      mouse.current.x = -1000;
      mouse.current.y = -1000;
      intensityMap.clear();
    }


    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      offset += speed;
      const [r, g, b] = colorRef.current.split(",").map(Number);

      const currentOpacity = opacityRef.current;
      // Vertical lines
      for (let x = -size; x <= width + size; x += size) {
        const lineX = x + (offset % size);
        const key = `v-${x}`;

        const dist = interactiveRef.current
          ? Math.abs(mouse.current.x - lineX)
          : Infinity;

        let intensity = intensityMap.get(key) || 0;

        if (dist < radius) {
          intensity = Math.max(intensity, 1 - dist / radius);
        }

        intensity *= 0.96;

        intensityMap.set(key, intensity);

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity + intensity * 0.24
          })`;

        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(lineX, 0);
        ctx.lineTo(lineX, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = -size; y <= height + size; y += size) {
        const lineY = y + (offset % size);
        const key = `h-${y}`;

        const dist = interactiveRef.current
          ? Math.abs(mouse.current.y - lineY)
          : Infinity;

        let intensity = intensityMap.get(key) || 0;

        if (dist < radius) {
          intensity = Math.max(intensity, 1 - dist / radius);
        }

        intensity *= 0.85;

        intensityMap.set(key, intensity);

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity + intensity * 0.24
          })`;

        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(width, lineY);
        ctx.stroke();
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [size, speed, radius]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}