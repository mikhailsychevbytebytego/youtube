"use client";

import { useEffect, useState } from "react";

export function triggerCatConfetti() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("trigger-cat-confetti"));
  }
}

interface CatParticle {
  id: number;
  emoji: string;
  x: number; // percentage horizontally (0 to 100)
  y: number; // px from bottom
  vx: number; // px per frame
  vy: number; // px per frame
  rot: number;
  vRot: number;
  scale: number;
  opacity: number;
}

const CAT_EMOJIS = ["🐱", "😸", "😻", "😹", "😺", "😽", "🙀", "😼", "🐾", "🐈"];

export function CatConfetti() {
  const [particles, setParticles] = useState<CatParticle[]>([]);

  useEffect(() => {
    function handleTrigger() {
      const newParticles: CatParticle[] = [];
      const particleCount = 36;

      for (let i = 0; i < particleCount; i++) {
        const isLeft = i % 2 === 0;
        const emoji = CAT_EMOJIS[Math.floor(Math.random() * CAT_EMOJIS.length)];
        
        // Starting position near bottom corners
        const x = isLeft ? Math.random() * 20 : 80 + Math.random() * 20;
        const y = -20; // just below bottom edge

        // Launch velocities (even gentler, floaty launch)
        const vx = isLeft ? 1 + Math.random() * 2.5 : -(1 + Math.random() * 2.5);
        const vy = 8 + Math.random() * 5; // gentle UPWARD launch

        const rot = Math.random() * 360;
        const vRot = (Math.random() - 0.5) * 4;
        const scale = 1.3 + Math.random() * 1.2;

        newParticles.push({
          id: Math.random() + i,
          emoji,
          x,
          y,
          vx,
          vy,
          rot,
          vRot,
          scale,
          opacity: 1,
        });
      }

      setParticles((prev) => [...prev, ...newParticles]);
    }

    window.addEventListener("trigger-cat-confetti", handleTrigger);
    return () => {
      window.removeEventListener("trigger-cat-confetti", handleTrigger);
    };
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;

    let animId: number;
    const gravity = 0.16;

    function step() {
      setParticles((prev) =>
        prev
          .map((p) => {
            const nextY = p.y + p.vy;
            const nextVy = p.vy - gravity; // ultra-gentle gravity float
            const nextX = p.x + p.vx * 0.05; // convert vx to % offset
            const nextRot = p.rot + p.vRot;
            const nextOpacity = p.opacity - 0.003; // stays on screen for ~5-6 seconds

            return {
              ...p,
              x: nextX,
              y: nextY,
              vy: nextVy,
              rot: nextRot,
              opacity: nextOpacity,
            };
          })
          .filter((p) => p.opacity > 0 && p.y > -100)
      );

      animId = requestAnimationFrame(step);
    }

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [particles.length]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute select-none transition-transform duration-75"
          style={{
            left: `${p.x}%`,
            bottom: `${p.y}px`,
            transform: `scale(${p.scale}) rotate(${p.rot}deg)`,
            opacity: p.opacity,
            fontSize: "2.5rem",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
