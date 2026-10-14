import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * The Testly brand mark, traced from the master logo: a brushed-steel navy
 * "T" (rounded bar + stem with chamfered ends) and a violet corner wedge.
 *
 * `tone` is the background the mark sits on:
 *   - "light" (default): deep navy steel, for light surfaces.
 *   - "dark": a brighter steel with a bevel highlight, so the navy never
 *     disappears into dark backgrounds.
 *
 * Passing `navyClassName` / `accentClassName` switches to flat fills, for
 * one-colour uses such as loaders (`fill-current`).
 */

type Tone = "light" | "dark";

const PALETTE: Record<
  Tone,
  { bar: [string, string, string]; stem: [string, string]; wedge: [string, string]; edge: string }
> = {
  light: {
    bar: ["#26336f", "#3d4f9c", "#222d63"],
    stem: ["#4a5daa", "#202b5f"],
    wedge: ["#9b7aff", "#6f4cf0"],
    edge: "rgb(255 255 255 / 0.18)",
  },
  dark: {
    bar: ["#6478d0", "#9aabf2", "#5a6ec6"],
    stem: ["#a8b7f7", "#5468c0"],
    wedge: ["#bba6ff", "#8b6bff"],
    edge: "rgb(226 232 255 / 0.7)",
  },
};

export const BAR = "M5.5 0 H95 Q100 0 100 5 V18 Q100 23 95 23 H5.5 Q0 23 0 17.5 V5.5 Q0 0 5.5 0 Z";
export const WEDGE = "M1.5 28.6 H31.4 V54.3 Z";
export const STEM = "M59.6 24.2 H62.3 V92.8 L41.2 106.2 Q37.1 108.4 37.1 103.6 V44.6 Z";

export function TestlyMark({
  className,
  tone = "light",
  navyClassName,
  accentClassName,
}: {
  className?: string;
  tone?: Tone;
  navyClassName?: string;
  accentClassName?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const flat = navyClassName !== undefined || accentClassName !== undefined;
  const p = PALETTE[tone];

  return (
    <svg
      viewBox="-1 -1 102 110"
      className={cn("h-8 w-8", className)}
      role="img"
      aria-label="Testly"
    >
      {flat ? (
        <>
          <path d={BAR} className={navyClassName ?? "fill-navy"} />
          <path d={WEDGE} className={accentClassName ?? "fill-indigo"} />
          <path d={STEM} className={navyClassName ?? "fill-navy"} />
        </>
      ) : (
        <>
          <defs>
            {/* brushed bar: lit from upper left */}
            <linearGradient id={`${uid}-bar`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={p.bar[0]} />
              <stop offset="0.45" stopColor={p.bar[1]} />
              <stop offset="1" stopColor={p.bar[2]} />
            </linearGradient>
            {/* spun-metal stem: a soft radial hotspot */}
            <radialGradient id={`${uid}-stem`} cx="0.5" cy="0.62" r="0.7">
              <stop offset="0" stopColor={p.stem[0]} />
              <stop offset="1" stopColor={p.stem[1]} />
            </radialGradient>
            <linearGradient id={`${uid}-wedge`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={p.wedge[0]} />
              <stop offset="1" stopColor={p.wedge[1]} />
            </linearGradient>
          </defs>
          <path d={BAR} fill={`url(#${uid}-bar)`} stroke={p.edge} strokeWidth="1" />
          <path d={WEDGE} fill={`url(#${uid}-wedge)`} stroke={p.edge} strokeWidth="0.8" />
          <path d={STEM} fill={`url(#${uid}-stem)`} stroke={p.edge} strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

const WORD: Record<Tone, { test: string; ly: string }> = {
  light: {
    test: "linear-gradient(180deg, #34438a 0%, #1f2a5e 100%)",
    ly: "linear-gradient(180deg, #8f6dff 0%, #6a45ea 100%)",
  },
  dark: {
    test: "linear-gradient(180deg, #f2f4ff 0%, #bfc9f5 100%)",
    ly: "linear-gradient(180deg, #d3c6ff 0%, #a387ff 100%)",
  },
};

export function TestlyLogo({
  className,
  wordClassName,
  tone = "light",
  compact = false,
}: {
  className?: string;
  /** Extra classes for the wordmark (size, weight). Colour comes from `tone`. */
  wordClassName?: string;
  tone?: Tone;
  compact?: boolean;
}) {
  const w = WORD[tone];
  const clip = { WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <TestlyMark tone={tone} className={compact ? "h-6 w-6" : "h-8 w-8"} />
      <span
        className={cn(
          "font-display text-[1.3rem] leading-none font-semibold tracking-[-0.01em]",
          wordClassName,
        )}
      >
        <span style={{ ...clip, backgroundImage: w.test }}>Test</span>
        <span style={{ ...clip, backgroundImage: w.ly }}>ly</span>
      </span>
    </span>
  );
}
