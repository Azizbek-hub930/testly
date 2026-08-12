import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import { createContext, useContext, useMemo, type ComponentProps, type ReactNode } from "react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { usePointerParallax } from "@/hooks/use-pointer-parallax";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Parallax context
 * ------------------------------------------------------------------ */

type ParallaxCtx = { x: MotionValue<number>; y: MotionValue<number> } | null;
const ParallaxContext = createContext<ParallaxCtx>(null);

/** Depth bands. Values are max pixel travel for pointer parallax. */
const DEPTH = {
  back: 2,
  mid: 6,
  front: 10,
  anchor: 1,
} as const;

export type Depth = keyof typeof DEPTH;

/** Visibility floor — decorations drop out rather than shrink into noise. */
const VISIBLE = {
  always: "",
  sm: "hidden sm:block",
  md: "hidden md:block",
  lg: "hidden lg:block",
  xl: "hidden xl:block",
} as const;

export type Visible = keyof typeof VISIBLE;

/* ------------------------------------------------------------------ *
 * Layer
 * ------------------------------------------------------------------ */

/**
 * A non-clipping decoration layer. It spans the viewport minus the safe gutter
 * (capped at `maxWidth`), so any sticker placed inside it stays fully visible —
 * shadows included — at every breakpoint.
 *
 * Must be placed inside a `relative` parent.
 */
export function StickerLayer({
  children,
  className,
  maxWidth = 1520,
  z = "z-10",
}: {
  children: ReactNode;
  className?: string;
  maxWidth?: number;
  z?: string;
}) {
  const { x, y } = usePointerParallax();
  const value = useMemo(() => ({ x, y }), [x, y]);

  return (
    <ParallaxContext.Provider value={value}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-0 h-full -translate-x-1/2",
          z,
          className,
        )}
        style={{
          width: `min(calc(100dvw - 2 * var(--safe-gutter)), ${maxWidth}px)`,
        }}
      >
        {children}
      </div>
    </ParallaxContext.Provider>
  );
}

/* ------------------------------------------------------------------ *
 * Sticker
 * ------------------------------------------------------------------ */

export type StickerPlacement = {
  /** Horizontal anchor, as a percentage of the layer width. */
  x: number;
  /** Vertical anchor, as a percentage of the layer height, or a px offset. */
  y: number | string;
  /** Which edge `x` is measured from. */
  from?: "left" | "right";
  /** Measure `y` from the bottom instead of the top. */
  fromBottom?: boolean;
};

/**
 * A single floating paper sticker: placed by normalized anchors, tilted,
 * drifting slowly, and offset by pointer parallax according to its depth.
 */
export function FloatingSticker({
  children,
  x,
  y,
  from = "left",
  fromBottom = false,
  tilt = -2,
  depth = "mid",
  delay = 0,
  drift = 6,
  period = 9,
  visible = "lg",
  width,
  variant = "note",
  className,
}: StickerPlacement & {
  children: ReactNode;
  tilt?: number;
  depth?: Depth;
  delay?: number;
  /** Vertical drift amplitude in px (4–8 reads as alive but calm). */
  drift?: number;
  period?: number;
  visible?: Visible;
  width?: number | string;
  variant?: StickerVariant | "bare";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const parallax = useContext(ParallaxContext);
  const travel = DEPTH[depth];

  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const srcX: MotionValue<number> = parallax?.x ?? fallbackX;
  const srcY: MotionValue<number> = parallax?.y ?? fallbackY;
  const px = useTransform(srcX, (v: number) => v * travel);
  const py = useTransform(srcY, (v: number) => v * travel * 0.7);

  const style: Record<string, string> = {
    [from]: `${x}%`,
    [fromBottom ? "bottom" : "top"]: typeof y === "number" ? `${y}%` : y,
  };
  if (width) style["width"] = typeof width === "number" ? `${width}px` : width;

  return (
    <motion.div
      className={cn("absolute", VISIBLE[visible], className)}
      style={{ ...style, x: px, y: py }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={
            reduce ? { y: 0, rotate: tilt } : { y: [0, -drift, 0], rotate: [tilt, tilt + 1, tilt] }
          }

          transition={{
            duration: period,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay * 1.6,
          }}
          style={{ rotate: tilt }}
        >
          {variant === "bare" ? (
            children
          ) : (
            <PaperSticker variant={variant}>{children}</PaperSticker>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Paper surfaces
 * ------------------------------------------------------------------ */

export type StickerVariant = "note" | "chip" | "tab" | "label" | "torn";

const VARIANT_CLASS: Record<StickerVariant, string> = {
  note: "sticker paper-sheen px-3.5 py-2.5",
  chip: "sticker paper-sheen px-2.5 py-1.5",
  tab: "sticker paper-sheen rounded-t-xl rounded-b-sm px-3 py-2",
  label:
    "rounded-md bg-navy px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-background shadow-[0_10px_24px_-16px_color-mix(in_oklab,var(--navy)_70%,transparent)]",
  torn: "sticker paper-sheen paper-torn px-3.5 py-2.5",
};

/** A static paper sticker surface (no placement, no motion). */
export function PaperSticker({
  children,
  variant = "note",
  className,
  mark = false,
  ...props
}: ComponentProps<"div"> & {
  variant?: StickerVariant;
  mark?: boolean;
}) {
  return (
    <div className={cn("relative", VARIANT_CLASS[variant], className)} {...props}>
      {mark ? (
        <TestlyMark
          className="pointer-events-none absolute right-2 top-2 h-3 w-3 opacity-25"
          aria-hidden
        />
      ) : null}
      {children}
    </div>
  );
}

/** Small uppercase meta line used inside stickers. */
export function StickerMeta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
