import { motion } from "motion/react";

import { cn } from "@/lib/utils";

type GlyphProps = { className?: string; delay?: number };

const draw = (delay = 0, duration = 1) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true } as const,
  transition: { duration, delay, ease: [0.16, 1, 0.3, 1] as const },
});

/** Hand-drawn curved arrow. */
export function ArrowCurve({ className, delay = 0 }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 80 48"
      aria-hidden
      fill="none"
      className={cn("h-11 w-[4.5rem] text-indigo/65", className)}
    >
      <motion.path
        d="M4 8 C 30 4, 54 16, 68 38"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        {...draw(delay)}
      />
      <motion.path
        d="M60 34 L70 38 L64 46"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(delay + 0.7, 0.35)}
      />
    </svg>
  );
}

/** Short nudge arrow, used inline next to labels. */
export function ArrowShort({ className, delay = 0 }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 44 24"
      aria-hidden
      fill="none"
      className={cn("h-5 w-9 text-indigo/70", className)}
    >
      <motion.path
        d="M3 12 H36"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        {...draw(delay, 0.6)}
      />
      <motion.path
        d="M29 5 L38 12 L29 19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(delay + 0.35, 0.3)}
      />
    </svg>
  );
}

/** Looping "repeat" arrow from the brand sticker sheet. */
export function ArrowLoop({ className, delay = 0 }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden
      fill="none"
      className={cn("h-9 w-9 shrink-0 text-indigo", className)}
    >
      <motion.path
        d="M32 20 a12 12 0 1 1 -6.5 -10.7"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        {...draw(delay, 1)}
      />
      <motion.path
        d="M26 3.5 L27 11 L20 10.5"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(delay + 0.7, 0.3)}
      />
    </svg>
  );
}

/** Hand underline that draws itself under a word. */
export function Underline({ className, delay = 0 }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 120 12"
      aria-hidden
      fill="none"
      preserveAspectRatio="none"
      className={cn("h-3 w-full text-indigo/70", className)}
    >
      <motion.path
        d="M2 8 C 28 3, 62 10, 118 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        {...draw(delay, 0.9)}
      />
    </svg>
  );
}

/** Drawn check mark. */
export function CheckGlyph({ className, delay = 0 }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      className={cn("h-4 w-4 text-indigo", className)}
    >
      <motion.path
        d="M4 13 L9.5 18.5 L20 5.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(delay, 0.5)}
      />
    </svg>
  );
}

/** Loose circle scribble, used to ring a word. */
export function CircleScribble({ className, delay = 0 }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 120 56"
      aria-hidden
      fill="none"
      preserveAspectRatio="none"
      className={cn("h-14 w-32 text-indigo/55", className)}
    >
      <motion.path
        d="M60 4 C 20 4, 4 16, 6 30 C 8 46, 40 52, 66 51 C 96 50, 116 40, 113 26 C 110 12, 88 4, 58 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        {...draw(delay, 1.2)}
      />
    </svg>
  );
}

/** Four-point sparkle. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("h-3.5 w-3.5 text-indigo", className)}>
      <path
        d="M12 1 L13.9 9.2 L22 12 L13.9 14.8 L12 23 L10.1 14.8 L2 12 L10.1 9.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Small five-point star, filled. */
export function StarGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("h-3.5 w-3.5 text-indigo", className)}>
      <path
        d="M12 2.5 L14.8 9.2 L22 9.8 L16.5 14.3 L18.2 21.3 L12 17.5 L5.8 21.3 L7.5 14.3 L2 9.8 L9.2 9.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Tiny question mark badge. */
export function QuestionGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      className={cn("h-4 w-4 text-navy dark:text-foreground", className)}
    >
      <path
        d="M8.6 8.8 A3.5 3.5 0 1 1 12.2 12.6 V14.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12.2" cy="18.4" r="1.25" fill="currentColor" />
    </svg>
  );
}

/** Miniature sparkline, suggesting score progress. */
export function SparkGraph({ className, delay = 0 }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 72 28"
      aria-hidden
      fill="none"
      className={cn("h-7 w-[4.5rem] text-indigo", className)}
    >
      <motion.path
        d="M2 24 L14 17 L22 20 L34 10 L44 14 L56 5 L70 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(delay, 1.1)}
      />
      <motion.circle
        cx="70"
        cy="3"
        r="2.2"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 1, duration: 0.3 }}
      />
    </svg>
  );
}

/** Document / source icon. */
export function DocGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      className={cn("h-4 w-4 text-navy dark:text-foreground", className)}
    >
      <path
        d="M6 2.8 H14 L18.5 7.3 V21.2 H6 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 2.8 V7.6 H18.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9 12 H15.5 M9 15.4 H14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        className="text-indigo"
      />
    </svg>
  );
}

/** Paper clip, for pinning stickers to cards. */
export function ClipGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 32"
      aria-hidden
      fill="none"
      className={cn("h-8 w-6 text-navy/40 dark:text-foreground/40", className)}
    >
      <path
        d="M17 9 V22.5 a5 5 0 0 1 -10 0 V7.5 a3.2 3.2 0 0 1 6.4 0 V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Highlighter swipe behind a word. */
export function HighlightSwipe({ className, delay = 0 }: GlyphProps) {
  return (
    <motion.span
      aria-hidden
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ originX: 0 }}
      className={cn(
        "absolute inset-x-0 bottom-0 -z-10 h-[42%] rounded-[3px] bg-indigo/20",
        className,
      )}
    />
  );
}
