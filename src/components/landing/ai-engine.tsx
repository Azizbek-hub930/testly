import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { LabelChip, PassageLines } from "@/components/site/paper";
import { cn } from "@/lib/utils";

const CONCEPTS = ["climate adaptation", "biodiversity", "urban planning"];

const STAGES = [
  "Reading source",
  "Extracting concepts",
  "Structuring assessment",
  "Generating questions",
  "Checking quality",
  "Assessment ready",
] as const;

const QUESTIONS = [
  ["Question 01", "Main idea · Information & Ideas"],
  ["Question 02", "Inference · Craft & Structure"],
  ["Question 03", "Text structure · Expression"],
];

/**
 * The signature Testly animation:
 * document -> highlighted concepts -> particles -> T engine -> question cards -> ready.
 */
export function AiEngine({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduce) {
      setStage(STAGES.length - 1);
      return;
    }
    const id = window.setInterval(() => setStage((s) => (s + 1) % (STAGES.length + 1)), 1600);
    return () => window.clearInterval(id);
  }, [reduce]);

  const s = Math.min(stage, STAGES.length - 1);
  const highlighting = stage >= 1;
  const flowing = stage >= 2 && stage <= 4;
  const showQuestions = stage >= 3;
  const ready = stage >= 5;

  return (
    <div className={cn("paper-card paper-raised relative overflow-hidden p-4 sm:p-6", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 page-texture opacity-60"
      />

      <div className="flex items-center justify-between gap-3 border-b border-hairline pb-3">
        <LabelChip tone="indigo">Testly engine</LabelChip>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className={cn("h-1.5 w-1.5 rounded-full", ready ? "bg-indigo" : "bg-indigo/50")} />
          <AnimatePresence mode="wait">
            <motion.span
              key={STAGES[s]}
              initial={{ opacity: 0, y: 4, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(3px)" }}
              transition={{ duration: 0.3 }}
            >
              {ready ? "✓ Ready" : `${STAGES[s]}…`}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="grid items-center gap-4 pt-5 sm:gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {/* Source document */}
        <div className="paper-card bg-surface p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-navy text-[10px] font-semibold text-background">
              PDF
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">Academic-paper.pdf</p>
              <p className="truncate text-[11px] text-muted-foreground">
                Urban Ecosystems and Climate
              </p>
            </div>
          </div>
          <PassageLines className="mt-4" rows={5} highlight={highlighting ? [1, 3] : []} />
          <div className="mt-4 flex flex-wrap gap-1.5">
            {CONCEPTS.map((c, i) => (
              <motion.span
                key={c}
                animate={{
                  opacity: highlighting ? 1 : 0.25,
                  scale: highlighting ? 1 : 0.96,
                }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-md bg-indigo/10 px-2 py-1 text-[10px] font-medium text-indigo"
              >
                {c}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Engine */}
        <div className="relative mx-auto grid h-32 w-full max-w-[200px] place-items-center md:h-40 md:w-40">
          <ParticleTrack active={flowing && !reduce} />
          <motion.div
            animate={reduce ? { scale: 1 } : { scale: flowing ? [1, 1.08, 1] : 1 }}
            transition={{ duration: 1.2, repeat: flowing ? Infinity : 0 }}
            className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl border border-indigo/25 bg-surface glow-indigo md:h-20 md:w-20"
          >
            <TestlyMark className="h-8 w-8 md:h-9 md:w-9" />
            {flowing ? (
              <span className="absolute inset-0 -z-10 rounded-2xl bg-indigo/20 blur-xl" />
            ) : null}
          </motion.div>
        </div>

        {/* Output */}
        <div className="space-y-2">
          {QUESTIONS.map(([title, meta], i) => (
            <motion.div
              key={title}
              animate={{
                opacity: showQuestions ? 1 : 0,
                y: showQuestions ? 0 : 14,
                filter: showQuestions ? "blur(0px)" : "blur(6px)",
              }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="paper-card bg-surface px-3.5 py-2.5"
            >
              <p className="text-xs font-semibold">{title}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{meta}</p>
            </motion.div>
          ))}
          <motion.div
            animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 8 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 rounded-xl bg-indigo/10 px-3.5 py-2.5 text-xs font-medium text-indigo"
          >
            <CheckMark active={ready} /> Assessment ready
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ParticleTrack({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 160 120"
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      fill="none"
    >
      <path d="M2 34 C 45 34, 55 60, 80 60" className="stroke-indigo/30" strokeWidth="1" />
      <path d="M2 86 C 45 86, 55 60, 80 60" className="stroke-indigo/30" strokeWidth="1" />
      <path d="M80 60 C 105 60, 115 34, 158 34" className="stroke-indigo/30" strokeWidth="1" />
      <path d="M80 60 C 105 60, 115 86, 158 86" className="stroke-indigo/30" strokeWidth="1" />
      {active
        ? [
            "M2 34 C 45 34, 55 60, 80 60",
            "M2 86 C 45 86, 55 60, 80 60",
            "M80 60 C 105 60, 115 34, 158 34",
            "M80 60 C 105 60, 115 86, 158 86",
          ].map((d, i) => (
            <circle key={i} r="2.4" className="fill-indigo">
              <animateMotion dur="1.4s" repeatCount="indefinite" path={d} begin={`${i * 0.28}s`} />
            </circle>
          ))
        : null}
    </svg>
  );
}

export function CheckMark({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" className="stroke-current opacity-30" strokeWidth="1.2" />
      <motion.path
        d="M6 10.4 L9 13.2 L14.2 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: active ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

/** Standalone success check used by forms. */
export function SuccessCheck({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid h-11 w-11 place-items-center rounded-full bg-indigo/12 text-indigo",
        className,
      )}
    >
      <CheckMark active />
    </span>
  );
}
