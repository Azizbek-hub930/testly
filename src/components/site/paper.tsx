import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { cn } from "@/lib/utils";

/** A physical-feeling paper card: warm white, thin edge, soft shadow, slight tilt. */
export function PaperCard({
  children,
  className,
  tilt = 0,
  mark = false,
  ...props
}: ComponentProps<"div"> & { tilt?: number; mark?: boolean }) {
  return (
    <div
      className={cn("paper-card relative", className)}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined, ...props.style }}
      {...props}
    >
      {mark ? (
        <TestlyMark
          className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 opacity-25"
          aria-hidden
        />
      ) : null}
      {children}
    </div>
  );
}

/** A small floating decorative sticker. Sparse by design. */
export function Sticker({
  children,
  className,
  tilt = -2,
  float = true,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  tilt?: number;
  float?: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, rotate: tilt }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn("sticker px-3 py-2", className)}
    >
      <motion.div
        animate={reduce || !float ? { y: 0 } : { y: [0, -4, 0], rotate: [0, 0.6, 0] }}
        transition={{
          duration: 7 + delay * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Tiny uppercase exam/label chip used inside paper compositions. */
export function LabelChip({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "indigo" | "navy";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
        tone === "indigo" && "bg-indigo/10 text-indigo",
        tone === "navy" && "bg-navy text-background",
        tone === "muted" && "bg-muted text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A hand-drawn annotation arrow that draws itself into view. */
export function AnnotationArrow({
  className,
  d = "M4 6 C 30 2, 52 14, 70 34",
  flip = false,
}: {
  className?: string;
  d?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 80 44"
      aria-hidden
      className={cn("h-11 w-20 text-indigo/60", flip && "-scale-x-100", className)}
      fill="none"
    >
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M62 33 L71 35 L66 42"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.85, duration: 0.3 }}
      />
    </svg>
  );
}

/** Fake passage lines used to suggest a document without inventing content. */
export function PassageLines({
  rows = 5,
  highlight = [],
  className,
}: {
  rows?: number;
  highlight?: number[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full",
            highlight.includes(i) ? "bg-indigo/35" : "bg-foreground/10",
          )}
          style={{ width: `${[100, 92, 97, 84, 95, 78][i % 6]}%` }}
        />
      ))}
    </div>
  );
}
