"use client";

import { useEffect, useRef } from "react";

export default function MovingGrid({
  color = "0, 0, 0",
  opacity,
  size = 50,
  speed = 0.3,
  radius = 180,
  interactive = true,
}) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });
const colorRef = useRef(
  typeof color === "string" ? color : color.get()
);

const opacityRef = useRef(
  typeof opacity === "number" ? opacity : opacity.get()
);
  const interactiveRef = useRef(interactive);

useEffect(() => {
  colorRef.current = typeof color === "string" ? color : color.get();
}, [color]);

useEffect(() => {
  opacityRef.current = typeof opacity === "number" ? opacity : opacity.get();
}, [opacity]);
  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  // Handle mouse interaction separately so the listener
  // always matches the current interactive prop.
  useEffect(() => {
    if (!interactive) {
      mouse.current.x = -1000;
      mouse.current.y = -1000;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

const handleMouseMove = (e) => {
  mouse.current.x = e.clientX;
  mouse.current.y = e.clientY;
};

    const handleMouseLeave = () => {
      mouse.current.x = -1000;
      mouse.current.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [interactive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrame;
    let offset = 0;
    let isVisible = true;

    const verticalIntensity = [];
const horizontalIntensity = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = canvas.offsetWidth;
      height = canvas.offsetHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();

    const handleResize = () => resize();

    window.addEventListener("resize", handleResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        if (isVisible && !animationFrame) {
          animationFrame = requestAnimationFrame(draw);
        }
      },
      { threshold: 0 }
    );

    observer.observe(canvas);

    const draw = () => {
      animationFrame = null;

      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      offset += speed;

const currentColor =
  typeof color === "string" ? color : color.get();

const currentOpacity =
  typeof opacity === "number" ? opacity : opacity.get();

const [r, g, b] = currentColor.split(",").map(Number);

      // Vertical lines
// Vertical lines
let verticalIndex = 0;

for (let x = -size; x <= width + size; x += size) {
  const lineX = x + (offset % size);

  const dist = interactiveRef.current
    ? Math.abs(mouse.current.x - lineX)
    : Infinity;

  let intensity = verticalIntensity[verticalIndex] || 0;

  if (dist < radius) {
    intensity = Math.max(intensity, 1 - dist / radius);
  }

  intensity *= 0.96;
  verticalIntensity[verticalIndex] = intensity;

  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${
    currentOpacity + intensity * 0.24
  })`;

  ctx.beginPath();
  ctx.moveTo(lineX, 0);
  ctx.lineTo(lineX, height);
  ctx.stroke();

  verticalIndex++;
}

      // Horizontal lines
// Horizontal lines
let horizontalIndex = 0;

for (let y = -size; y <= height + size; y += size) {
  const lineY = y + (offset % size);

  const dist = interactiveRef.current
    ? Math.abs(mouse.current.y - lineY)
    : Infinity;

  let intensity = horizontalIntensity[horizontalIndex] || 0;

  if (dist < radius) {
    intensity = Math.max(intensity, 1 - dist / radius);
  }

  intensity *= 0.85;
  horizontalIntensity[horizontalIndex] = intensity;

  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${
    currentOpacity + intensity * 0.24
  })`;

  ctx.beginPath();
  ctx.moveTo(0, lineY);
  ctx.lineTo(width, lineY);
  ctx.stroke();

  horizontalIndex++;
}

      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [size, speed, radius]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}