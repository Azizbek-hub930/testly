import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/*
 * Atmosphere for the dark page: a volumetric violet light beam and a faint
 * star field. Both are pure CSS/SVG, decorative, and ignore the pointer.
 */

/** Deterministic PRNG so server and client render the same stars. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  t: number;
  d: number;
}

function makeStars(count: number, seed: number): Star[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    r: 0.6 + rand() * 1.3,
    o: 0.2 + rand() * 0.6,
    t: 3 + rand() * 5,
    d: rand() * -8,
  }));
}

export function Stars({
  count = 70,
  seed = 7,
  className,
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const stars = makeStars(count, seed);
  return (
    <div aria-hidden className={cn("stars-layer pointer-events-none absolute inset-0", className)}>
      {stars.map((s, i) => (
        <span
          key={i}
          className="twinkle absolute rounded-full bg-white"
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r * 2,
              height: s.r * 2,
              opacity: s.o,
              "--star-o": s.o,
              "--star-t": `${s.t}s`,
              "--star-d": `${s.d}s`,
              boxShadow: s.r > 1.4 ? "0 0 6px 1px rgb(185 164 255 / 0.55)" : undefined,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * The diagonal light beam. Several stacked, blurred gradient shafts give it
 * depth; one slow "breathing" animation keeps it alive without distraction.
 */
export function Beam({
  className,
  side = "left",
}: {
  className?: string;
  side?: "left" | "right";
}) {
  const flip = side === "right";
  return (
    <div
      aria-hidden
      className={cn("beam-layer pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* Source glow at the corner */}
      <div className="absolute -left-[12%] -top-[22%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(closest-side,rgb(155_122_255/0.55),rgb(121_82_246/0.18)_45%,transparent)] blur-2xl" />
      {/* Wide soft shaft */}
      <div
        className="beam-breathe absolute -left-[10%] top-[-10%] h-[38vh] w-[140vw] origin-left bg-[linear-gradient(90deg,rgb(155_122_255/0.42),rgb(121_82_246/0.14)_38%,transparent_75%)] blur-[42px]"
        style={{ "--beam-rot": "34deg" } as CSSProperties}
      />
      {/* Bright core */}
      <div
        className="beam-breathe absolute -left-[8%] top-[-4%] h-[9vh] w-[120vw] origin-left bg-[linear-gradient(90deg,rgb(230_222_255/0.75),rgb(155_122_255/0.3)_30%,transparent_62%)] blur-[18px]"
        style={{ "--beam-rot": "36deg", animationDelay: "-3s" } as CSSProperties}
      />
      {/* Thin secondary ray */}
      <div
        className="beam-breathe absolute -left-[6%] top-[6%] h-[3vh] w-[110vw] origin-left bg-[linear-gradient(90deg,rgb(200_185_255/0.55),transparent_55%)] blur-[10px]"
        style={{ "--beam-rot": "26deg", animationDelay: "-6s" } as CSSProperties}
      />
    </div>
  );
}

/** Soft radial pool of violet light, for under product windows. */
export function Glow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute rounded-[50%] bg-[radial-gradient(closest-side,rgb(121_82_246/0.55),rgb(121_82_246/0.12)_55%,transparent)] blur-2xl",
        className,
      )}
    />
  );
}
