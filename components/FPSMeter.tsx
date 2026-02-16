"use client";

import { useEffect, useRef, useState } from "react";

export default function FPSMeter() {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const loop = (time: number) => {
      frameCount.current++;

      if (time >= lastTime.current + 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = time;
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const getColor = () => {
    if (fps >= 55) return "text-green-400";
    if (fps >= 30) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none select-none">
      <div className="bg-black/70 backdrop-blur px-3 py-2 rounded-lg border border-white/10 shadow-lg">
        <span className={`font-mono text-sm ${getColor()}`}>
          {fps} FPS
        </span>
      </div>
    </div>
  );
}
