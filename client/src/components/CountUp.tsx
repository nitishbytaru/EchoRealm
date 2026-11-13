"use client";

import { useEffect, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Counts up from 0 to `value` once it arrives (instant with reduced motion). */
export default function CountUp({ value, duration = 700 }: { value: number; duration?: number }) {
  const [progress, setProgress] = useState(0);
  const animate = value > 0 && !prefersReducedMotion();

  useEffect(() => {
    if (!animate) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, value, duration]);

  return <>{animate ? Math.round(progress * value) : value}</>;
}
