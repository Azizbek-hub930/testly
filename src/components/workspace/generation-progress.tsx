import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { CheckMark } from "@/components/landing/ai-engine";
import { cn } from "@/lib/utils";

/**
 * The generation takeover, in the same visual language as the landing preview.
 *
 * Stage names describe work the pipeline actually performs — preparing the
 * request, calling the provider, running quality control, writing rows — so
 * nothing on screen claims analysis that didn't happen.
 */
export const GENERATION_STAGES = [
  "Preparing source",
  "Generating questions",
  "Checking quality",
  "Saving assessment",
] as const;

/**
 * Walks through the stages while a request is in flight and holds on the last
 * one until it resolves. The real completion signal is the response, never the
 * timer.
 */
export function useGenerationStage(active: boolean): number {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setStage(0);
      return;
    }

    const id = window.setInterval(() => {
      setStage((current) => Math.min(current + 1, GENERATION_STAGES.length - 1));
    }, 1400);

    return () => window.clearInterval(id);
  }, [active]);

  return stage;
}

export function GenerationProgress({
  stage,
  chips = [],
  className,
}: {
  stage: number;
  chips?: string[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const current = Math.min(stage, GENERATION_STAGES.length - 1);

  return (
    <div className={cn("w-full max-w-md px-6 text-center", className)}>
      <div className="relative mx-auto grid h-32 w-32 place-items-center">
        {reduce
          ? null
          : chips.map((chip, index) => {
              const angle = (index / Math.max(chips.length, 1)) * Math.PI * 2;
              return (
                <motion.span
                  key={`${chip}-${index}`}
                  className="absolute whitespace-nowrap rounded-full border border-indigo/25 bg-surface px-2 py-1 text-[10px] font-medium text-indigo"
                  initial={{
                    x: Math.cos(angle) * 120,
                    y: Math.sin(angle) * 90,
                    opacity: 0,
                  }}
                  animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [1, 0.7] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: index * 0.22,
                    ease: "easeInOut",
                  }}
                >
                  {chip}
                </motion.span>
              );
            })}
        <motion.div
          animate={reduce ? { scale: 1 } : { scale: [1, 1.09, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="relative z-10 grid h-20 w-20 place-items-center rounded-2xl border border-indigo/25 bg-surface glow-indigo"
        >
          <TestlyMark className="h-9 w-9" />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={current}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.3 }}
          className="mt-8 text-sm font-medium"
        >
          {GENERATION_STAGES[current]}…
        </motion.p>
      </AnimatePresence>

      <div className="mx-auto mt-4 h-1 w-56 overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full bg-indigo"
          animate={{ width: `${((current + 1) / GENERATION_STAGES.length) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <ul className="mx-auto mt-6 w-full max-w-[15rem] space-y-1.5 text-left">
        {GENERATION_STAGES.map((label, index) => (
          <motion.li
            key={label}
            animate={{ opacity: index <= current ? 1 : 0.35, x: index === current ? 2 : 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "flex items-center gap-2 text-[11px] font-medium",
              index < current ? "text-muted-foreground" : "text-foreground",
            )}
          >
            <CheckMark active={index < current} />
            <span className="min-w-0 truncate">{label}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
