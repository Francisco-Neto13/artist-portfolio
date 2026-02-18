"use client";
import { useEffect, useRef } from "react";

export default function FPSMeter() {
  const spanRef = useRef<HTMLSpanElement>(null);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const loop = (time: number) => {
      frameCount.current++;

      if (time >= lastTime.current + 1000) {
        const fps = frameCount.current;
        frameCount.current = 0;
        lastTime.current = time;

        if (spanRef.current) {
          spanRef.current.textContent = `${fps} FPS`;
          spanRef.current.className = `font-mono text-sm ${
            fps >= 55 ? "text-green-400" : fps >= 30 ? "text-yellow-400" : "text-red-400"
          }`;
        }
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none select-none">
      <div className="bg-black/70 backdrop-blur px-3 py-2 rounded-lg border border-white/10 shadow-lg">
        <span ref={spanRef} className="font-mono text-sm text-green-400">
          -- FPS
        </span>
      </div>
    </div>
  );
}