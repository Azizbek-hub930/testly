import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Check, FileText, Sparkles } from "lucide-react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { cn } from "@/lib/utils";

const STEPS = [
  "Reading source",
  "Extracting concepts",
  "Structuring exam data",
  "Generating questions",
  "Quality verified",
];

const FACETS = ["Topics", "Question types", "Difficulty", "Exam structure"];

const QUESTIONS = [
  "Which choice best states the main purpose…",
  "The passage most strongly suggests that…",
  "Which finding, if true, would weaken…",
];

/**
 * Signature animation: source material → particles → the Testly T engine →
 * structured facets → assessment agent → finished questions.
 */
export function AiPipeline({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  const active = reduce ? 4 : step;

  return (
    <div
      className={cn(
        "relative rounded-3xl border border-border bg-surface/80 p-4 backdrop-blur-xl sm:p-6",
        "shadow-[0_40px_120px_-60px_color-mix(in_oklab,var(--navy)_75%,transparent)]",
        className,
      )}
    >
      {/* status bar */}
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-indigo/60 [animation:testly-pulse-ring_2s_ease-out_infinite]" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo" />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="truncate text-xs font-medium text-foreground/70"
            >
              {STEPS[active]}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Testly engine
        </span>
      </div>

      <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        {/* SOURCE */}
        <div className="rounded-2xl border border-border/80 bg-background/60 p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="eyebrow text-muted-foreground">Source</span>
          </div>
          <p className="mt-3 text-sm font-medium">Research material</p>
          <div className="mt-4 space-y-2">
            {[0, 1, 2, 3, 4].map((i) => {
              const highlighted = i === 1 || i === 3;
              return (
                <motion.div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full",
                    highlighted ? "bg-indigo/70" : "bg-foreground/10",
                  )}
                  style={{ width: `${[92, 74, 86, 58, 80][i]}%` }}
                  animate={highlighted && !reduce ? { opacity: [0.45, 1, 0.45] } : {}}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* CONNECTOR + ENGINE */}
        <div className="flex flex-row items-center justify-center gap-2 lg:flex-col">
          <Connector vertical />
          <Engine active={active} reduce={!!reduce} />
          <Connector vertical />
        </div>

        {/* OUTPUT */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {FACETS.map((f, i) => (
              <motion.span
                key={f}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: active >= 2 ? 1 : 0.4 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-full border border-indigo/25 bg-indigo/8 px-2.5 py-1 text-[10px] font-medium text-indigo"
              >
                {f}
              </motion.span>
            ))}
          </div>

          <div className="space-y-2">
            {QUESTIONS.map((q, i) => (
              <motion.div
                key={q}
                initial={false}
                animate={{
                  opacity: active >= 3 ? 1 : 0.25,
                  y: active >= 3 ? 0 : 6,
                }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="rounded-xl border border-border/80 bg-background/60 px-3 py-2.5"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    0{i + 1}
                  </span>
                  <p className="line-clamp-1 text-xs text-foreground/80">{q}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: active >= 4 ? 1 : 0.25 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between rounded-xl border border-indigo/25 bg-indigo/8 px-3 py-2.5"
          >
            <span className="flex items-center gap-2 text-xs font-medium text-indigo">
              <Check className="h-3.5 w-3.5" /> Assessment ready
            </span>
            <span className="font-mono text-[10px] text-indigo/80">SAT · IELTS</span>
          </motion.div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-border/70 pt-4 text-[11px] text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-indigo" />
        Research agent · Assessment agent · Quality agent
      </div>
    </div>
  );
}

function Connector({ vertical }: { vertical?: boolean }) {
  return (
    <svg
      viewBox="0 0 6 60"
      preserveAspectRatio="none"
      className={cn("text-border", vertical ? "h-10 w-1.5 lg:h-12 lg:w-1.5" : "h-1.5 w-12")}
      aria-hidden
    >
      <line x1="3" y1="0" x2="3" y2="60" stroke="currentColor" strokeWidth="1.5" />
      <line
        x1="3"
        y1="0"
        x2="3"
        y2="60"
        stroke="var(--indigo)"
        strokeWidth="1.5"
        className="flowing-line"
      />
    </svg>
  );
}

function Engine({ active, reduce }: { active: number; reduce: boolean }) {
  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <span className="absolute inset-3 rounded-full bg-indigo/12 blur-xl" />
      {!reduce &&
        [0, 1].map((i) => (
          <span
            key={i}
            className="absolute inset-4 rounded-full border border-indigo/35"
            style={{
              animation: `testly-pulse-ring 3s ease-out ${i * 1.5}s infinite`,
            }}
          />
        ))}
      <motion.div
        animate={reduce ? {} : { rotate: [0, 2, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface shadow-[0_16px_40px_-20px_color-mix(in_oklab,var(--indigo)_80%,transparent)]"
      >
        <TestlyMark className="h-6 w-6" />
      </motion.div>
      {!reduce &&
        [0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-indigo"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: [0, Math.cos((i / 4) * Math.PI * 2) * 34],
              y: [0, Math.sin((i / 4) * Math.PI * 2) * 34],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 0.45 + (active % 2) * 0.1,
              ease: "easeOut",
            }}
          />
        ))}
    </div>
  );
}
