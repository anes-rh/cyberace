"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight, dependency-free confetti burst. Fires once whenever `fireKey`
 * changes to a truthy value. Uses a single fixed <canvas> (GPU-composited,
 * pointer-events:none) so it never blocks the UI. Respects reduced-motion:
 * when the user prefers reduced motion, it does nothing.
 */
export default function Celebration({ fireKey }: { fireKey: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!fireKey) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Read brand colours from CSS variables so confetti matches the theme.
    const css = getComputedStyle(document.documentElement);
    const pick = (name: string, fallback: string) => (css.getPropertyValue(name).trim() || fallback);
    const colors = [
      pick("--color-primary", "#6FA8DC"),
      pick("--color-secondary", "#93B896"),
      pick("--color-lavender", "#B9A7E6"),
      pick("--color-warning", "#E8B04B"),
      "#E8A87C",
      "#5FB3C6",
    ];

    type P = { x: number; y: number; vx: number; vy: number; size: number; rot: number; vr: number; color: string; shape: number; life: number };
    const N = 150;
    // Two burst origins near the top third, spreading outward + falling.
    const origins = [
      { x: W * 0.5, y: H * 0.32 },
    ];
    const parts: P[] = [];
    for (let i = 0; i < N; i++) {
      const o = origins[i % origins.length];
      const angle = (Math.PI * 2 * i) / N + Math.random() * 0.5;
      const speed = 6 + Math.random() * 9;
      parts.push({
        x: o.x,
        y: o.y,
        vx: Math.cos(angle) * speed * (0.6 + Math.random() * 0.8),
        vy: Math.sin(angle) * speed - 4 - Math.random() * 4,
        size: 5 + Math.random() * 7,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.floor(Math.random() * 3),
        life: 1,
      });
    }

    const gravity = 0.28;
    const drag = 0.99;
    let raf = 0;
    let ticks = 0;
    const maxTicks = 160;

    const draw = () => {
      ticks++;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.vx *= drag;
        p.vy = p.vy * drag + gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (ticks > maxTicks - 60) p.life = Math.max(0, p.life - 1 / 60);

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      if (ticks < maxTicks) {
        raf = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    raf = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(raf);
  }, [fireKey]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
