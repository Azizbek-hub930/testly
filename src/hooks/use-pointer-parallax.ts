import { useEffect } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * Normalized pointer offset (-1..1 on both axes) relative to the viewport centre,
 * spring-damped. Returns zeroed values on touch devices and under reduced motion.
 */
export function usePointerParallax() {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 42, damping: 18, mass: 0.7 });
  const y = useSpring(rawY, { stiffness: 42, damping: 18, mass: 0.7 });

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        rawX.set((e.clientX / window.innerWidth) * 2 - 1);
        rawY.set((e.clientY / window.innerHeight) * 2 - 1);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [rawX, rawY, reduce]);

  return { x, y, enabled: !reduce };
}
