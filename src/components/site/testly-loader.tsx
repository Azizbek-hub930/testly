import { motion, useReducedMotion } from "motion/react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { cn } from "@/lib/utils";

/**
 * The Testly loading identity: the T mark breathing inside its own glow.
 * Used anywhere the product is thinking — never a generic spinner.
 */
export function TestlyLoader({
  label,
  className,
  size = "md",
}: {
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const reduce = useReducedMotion();
  const box = size === "sm" ? "h-10 w-10" : "h-14 w-14";
  const mark = size === "sm" ? "h-5 w-5" : "h-7 w-7";

  return (
    <div className={cn("flex flex-col items-center gap-4", className)} role="status">
      <div className="relative grid place-items-center">
        {reduce
          ? null
          : [0, 0.7].map((delay) => (
              <motion.span
                key={delay}
                aria-hidden
                className={cn("absolute rounded-2xl border border-indigo/35", box)}
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1.55, opacity: 0 }}
                transition={{ duration: 1.9, repeat: Infinity, delay, ease: "easeOut" }}
              />
            ))}
        <motion.span
          className={cn(
            "relative grid place-items-center rounded-2xl border border-indigo/25 bg-surface glow-indigo",
            box,
          )}
          animate={reduce ? { scale: 1 } : { scale: [1, 1.06, 1] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
        >
          <TestlyMark className={mark} />
        </motion.span>
      </div>

      {label ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
          <AnimatedEllipsis />
        </p>
      ) : null}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );
}

/** Full-height loader for a route that hasn't resolved yet. */
export function TestlyPageLoader({ label }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-5">
      <TestlyLoader label={label ?? "Loading"} />
    </div>
  );
}

/** Small breathing mark for buttons and inline states. */
export function TestlyPulse({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={cn("inline-grid place-items-center", className)}
      animate={reduce ? { opacity: 1 } : { opacity: [1, 0.45, 1], scale: [1, 0.92, 1] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
    >
      <TestlyMark
        className="h-4 w-4"
        navyClassName="fill-current"
        accentClassName="fill-current opacity-50"
      />
    </motion.span>
  );
}

function AnimatedEllipsis() {
  const reduce = useReducedMotion();
  if (reduce) return <span aria-hidden>…</span>;

  return (
    <span aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}
