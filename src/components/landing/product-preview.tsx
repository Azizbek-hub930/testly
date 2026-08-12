import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { CheckMark } from "@/components/landing/ai-engine";
import { Cta } from "@/components/site/cta";
import { LabelChip, PassageLines } from "@/components/site/paper";
import { FloatingSticker, StickerLayer } from "@/components/site/sticker-system";

import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { cn } from "@/lib/utils";

type UploadState = "empty" | "uploading" | "ready";
type GenState = "idle" | "working" | "done";

const STAGES = [
  "Analyzing source",
  "Extracting concepts",
  "Structuring assessment",
  "Generating questions",
  "Checking quality",
];

const CONFIG = [
  { key: "Exam", options: ["SAT", "IELTS"] },
  { key: "Section", options: ["Reading & Writing", "Math"] },
  {
    key: "Question type",
    options: ["Information & Ideas", "Craft & Structure", "Expression of Ideas"],
  },
  { key: "Difficulty", options: ["Easy", "Medium", "Hard"] },
  { key: "Questions", options: ["12", "22", "27"] },
];

export function ProductPreview() {
  const reduce = useReducedMotion();
  const [upload, setUpload] = useState<UploadState>("empty");
  const [progress, setProgress] = useState(0);
  const [choice, setChoice] = useState<Record<string, string>>({
    Exam: "SAT",
    Section: "Reading & Writing",
    "Question type": "Information & Ideas",
    Difficulty: "Medium",
    Questions: "27",
  });
  const [gen, setGen] = useState<GenState>("idle");
  const [stage, setStage] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const startUpload = () => {
    if (upload === "uploading") return;
    setUpload("uploading");
    setProgress(0);
    const tick = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(tick);
          setUpload("ready");
          return 100;
        }
        return p + (reduce ? 100 : 7);
      });
    }, 60);
  };

  const generate = () => {
    if (gen === "working") return;
    setGen("working");
    setStage(0);
    const step = reduce ? 120 : 780;
    STAGES.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStage(i), i * step));
    });
    timers.current.push(window.setTimeout(() => setGen("done"), STAGES.length * step));
  };

  const reset = () => {
    setGen("idle");
    setStage(0);
  };

  return (
    <section id="generator" className="relative py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hairline-grid opacity-40 [mask-image:radial-gradient(65%_60%_at_50%_45%,black,transparent)]"
      />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="The product"
          title={
            <>
              Create an <span className="text-indigo">assessment.</span>
            </>
          }
          intro="Upload a source, set the exam shape, and watch Testly build the questions."
        />

        <Reveal delay={0.1}>
          <div className="paper-card paper-raised relative mt-14 overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <TestlyMark className="h-4 w-4" />
                <p className="text-xs font-semibold">New assessment</p>
              </div>
              <LabelChip tone={gen === "done" ? "indigo" : "muted"}>
                {gen === "done" ? "27 questions ready" : "Draft"}
              </LabelChip>
            </div>

            <div className="relative grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              {/* Upload */}
              <div>
                <p className="eyebrow text-muted-foreground">Upload source</p>
                <button
                  type="button"
                  onClick={startUpload}
                  className={cn(
                    "mt-3 flex w-full flex-col items-start rounded-2xl border border-dashed p-5 text-left transition-colors",
                    upload === "empty"
                      ? "border-border hover:border-indigo/50 hover:bg-indigo/5"
                      : "border-indigo/40 bg-indigo/5",
                  )}
                >
                  {upload === "empty" ? (
                    <>
                      <UploadCloud className="h-6 w-6 text-indigo" />
                      <p className="mt-4 text-sm font-medium">Drop your source here</p>
                      <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX or pasted text</p>
                    </>
                  ) : (
                    <>
                      <div className="flex w-full items-center gap-2">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-navy text-[9px] font-semibold text-background">
                          PDF
                        </span>
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">
                          Academic-paper.pdf
                        </p>
                        {upload === "ready" ? (
                          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-indigo">
                            <CheckMark active /> Ready
                          </span>
                        ) : (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {progress}%
                          </span>
                        )}
                      </div>
                      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-border">
                        <motion.div
                          className="h-full rounded-full bg-indigo"
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </>
                  )}
                </button>

                <div className="paper-card mt-4 bg-surface p-4">
                  <p className="text-[11px] font-medium">Urban Ecosystems and Climate</p>
                  <PassageLines
                    className="mt-3"
                    rows={4}
                    highlight={upload === "ready" ? [0, 2] : []}
                  />
                </div>
              </div>

              {/* Config */}
              <div>
                <p className="eyebrow text-muted-foreground">Assessment setup</p>
                <div className="mt-3 space-y-4">
                  {CONFIG.map((row) => (
                    <div key={row.key}>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {row.key}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {row.options.map((opt) => {
                          const active = choice[row.key] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setChoice((c) => ({ ...c, [row.key]: opt }))}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                                active
                                  ? "border-indigo bg-indigo/10 text-indigo"
                                  : "border-border text-muted-foreground hover:-translate-y-0.5 hover:border-indigo/40 hover:text-foreground",
                              )}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <Cta variant="accent" size="lg" className="mt-6 w-full" onClick={generate}>
                  Generate <span aria-hidden>→</span>
                </Cta>
              </div>

              {/* Processing takeover */}
              <AnimatePresence>
                {gen !== "idle" ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 z-20 grid place-items-center bg-paper/92 backdrop-blur-md"
                  >
                    {gen === "working" ? (
                      <Processing stage={stage} chips={Object.values(choice)} reduce={!!reduce} />
                    ) : (
                      <Done count={choice["Questions"] ?? "27"} onReset={reset} />
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        <StickerLayer z="z-20">
          <FloatingSticker
            x={2}
            y="-16px"
            from="right"
            tilt={5}
            depth="front"
            delay={0.3}
            drift={6}
            period={10}
            visible="lg"
          >
            <p className="hand text-base text-navy dark:text-foreground">
              try it <span className="text-indigo">→</span>
            </p>
          </FloatingSticker>
        </StickerLayer>
      </div>
    </section>
  );
}

function Processing({ stage, chips, reduce }: { stage: number; chips: string[]; reduce: boolean }) {
  return (
    <div className="w-full max-w-md px-6 text-center">
      <div className="relative mx-auto grid h-32 w-32 place-items-center">
        {!reduce
          ? chips.map((c, i) => {
              const angle = (i / chips.length) * Math.PI * 2;
              return (
                <motion.span
                  key={c + i}
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
                    delay: i * 0.22,
                    ease: "easeInOut",
                  }}
                >
                  {c}
                </motion.span>
              );
            })
          : null}
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
          key={stage}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.3 }}
          className="mt-8 text-sm font-medium"
        >
          {STAGES[stage]}…
        </motion.p>
      </AnimatePresence>

      <div className="mx-auto mt-4 h-1 w-56 overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full bg-indigo"
          animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <ul className="mx-auto mt-6 w-full max-w-[15rem] space-y-1.5 text-left">
        {STAGES.map((s, i) => (
          <motion.li
            key={s}
            animate={{
              opacity: i <= stage ? 1 : 0.35,
              x: i === stage ? 2 : 0,
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "flex items-center gap-2 text-[11px] font-medium",
              i < stage ? "text-muted-foreground" : "text-foreground",
            )}
          >
            <CheckMark active={i < stage} />
            <span className="min-w-0 truncate">{s}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function Done({ count, onReset }: { count: string; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg px-6 text-center"
    >
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-indigo/25 bg-surface glow-indigo">
        <TestlyMark className="h-8 w-8" />
      </div>
      <p className="display mt-6 text-3xl">
        {count} Questions <span className="text-indigo">Ready</span>
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        {["Question 01", "Question 02", "Question 03"].map((q, i) => (
          <motion.div
            key={q}
            initial={{ opacity: 0, y: 18, rotate: i % 2 ? 1.2 : -1.2, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }}
            transition={{
              delay: 0.22 + i * 0.13,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="paper-card lift-card flex items-center gap-2 bg-surface px-3 py-2.5 text-left text-[11px] font-medium"
          >
            <TestlyMark className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 truncate">{q}</span>
            <CheckMark active />
          </motion.div>
        ))}
      </div>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Cta size="sm" asChild>
          <a href="#question">
            Preview question <span aria-hidden>↓</span>
          </a>
        </Cta>
        <Cta size="sm" variant="outline" onClick={onReset}>
          Start over
        </Cta>
      </div>
    </motion.div>
  );
}
