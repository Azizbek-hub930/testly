import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { FileText, MousePointer2, Sparkles, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { DemoTag, EASE, Tick } from "@/components/home/ui";
import { DIFFICULTIES, EXAMS } from "@/lib/exams";
import { cn } from "@/lib/utils";

/*
 * A looping, self-driving replica of the real "New assessment" screen.
 * The exam, section and question-count options come from `@/lib/exams`,
 * the same catalogue the product's generator form reads — so the demo can
 * never advertise an option the product doesn't have.
 *
 * Phases
 *   0 empty · 1 file dropped · 2 extracting concepts · 3 exam → IELTS
 *   4 difficulty → Medium · 5 count → max · 6 generating · 7 ready
 */

const TIMELINE = [0, 350, 800, 1700, 2200, 2700, 3200, 4700];
const AGENT_TIMES = [3200, 3650, 4100];
const LOOP_MS = 7000;
const STATIC_PHASE = 5;

const CONCEPTS = ["climate adaptation", "biodiversity", "urban planning", "heat islands"];
const AGENTS = ["Research agent", "Assessment agent", "Quality agent"];

type Target = "ielts" | "medium" | "count" | "generate" | "rest";

function cursorTargetFor(phase: number): Target {
  if (phase <= 2) return "ielts";
  if (phase === 3) return "medium";
  if (phase === 4) return "count";
  if (phase === 5) return "generate";
  return "rest";
}

/** Position of `el`'s centre inside `root`, ignoring CSS transforms on ancestors. */
function centreWithin(el: HTMLElement, root: HTMLElement) {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

export function GeneratorDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const reduce = useReducedMotion();

  const [phase, setPhase] = useState(0);
  const [agent, setAgent] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduce) {
      setPhase(STATIC_PHASE);
      return;
    }
    if (!inView) return;
    const timers = [
      ...TIMELINE.map((t, i) => setTimeout(() => setPhase(i), t)),
      ...AGENT_TIMES.map((t, i) => setTimeout(() => setAgent(i), t)),
      setTimeout(() => setCycle((c) => c + 1), LOOP_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce, cycle]);

  const exam = phase >= 3 ? EXAMS.IELTS : EXAMS.SAT;
  const section = exam.sections[0];
  const counts = section?.counts ?? [];
  const countIndex = phase >= 5 ? counts.length - 1 : Math.min(1, counts.length - 1);
  const difficulty = phase >= 4 ? "medium" : "easy";
  const chosenCount = counts[countIndex];

  /* ---------- fake cursor ---------- */
  const targets = useRef<Partial<Record<Target, HTMLElement | null>>>({});
  const register = useCallback(
    (key: Target) => (el: HTMLElement | null) => {
      targets.current[key] = el;
    },
    [],
  );
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const target = cursorTargetFor(phase);

  useLayoutEffect(() => {
    const measure = () => {
      const root = rootRef.current;
      const el = targets.current[target];
      if (!root || !el) return;
      const c = centreWithin(el, root);
      setCursor(target === "rest" ? { x: c.x, y: c.y } : { x: c.x + 6, y: c.y + 4 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [target]);

  const clicking = phase >= 3 && phase <= 6;

  return (
    <div ref={rootRef} className="glass relative rounded-[22px] text-left sm:rounded-[28px]">
      {/* Window bar */}
      <div className="flex h-12 items-center justify-between border-b border-white/[0.07] px-4 sm:h-14 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <TestlyMark tone="dark" className="h-5 w-5 shrink-0" />
          <p className="truncate text-sm font-semibold text-snow">New assessment</p>
          <span className="mono-label hidden rounded-md border border-white/10 px-1.5 py-0.5 text-[9px] text-mist sm:inline">
            Draft
          </span>
        </div>
        <div className="flex items-center gap-3">
          <DemoTag className="hidden sm:inline-flex">Live demo · sample data</DemoTag>
          <span className="mono-label flex items-center gap-1.5 text-[10px] text-mist">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-violet-soft/60" />
              <span className="relative h-2 w-2 rounded-full bg-violet-soft" />
            </span>
            Testly engine
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:h-[440px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)] md:gap-6">
        {/* ---------------- Source ---------------- */}
        <div className="flex min-h-0 flex-col">
          <PanelLabel>Upload source</PanelLabel>
          <div
            className={cn(
              "relative mt-3 flex h-[260px] flex-col overflow-hidden rounded-2xl border border-dashed p-4 transition-colors duration-500 md:h-auto md:flex-1",
              phase === 0
                ? "border-violet-soft/45 bg-violet/[0.06]"
                : "border-white/10 bg-white/[0.02]",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {phase === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="flex flex-1 flex-col items-center justify-center text-center"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-violet-soft/30 bg-violet/15 text-violet-soft">
                    <UploadCloud className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-medium text-snow">Drop a PDF here</p>
                  <p className="mt-1 text-xs text-mist">Articles, textbook chapters, reports</p>
                </motion.div>
              ) : (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, y: -28, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="flex flex-1 flex-col"
                >
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#2a1f5c] text-[10px] font-bold text-violet-soft">
                      PDF
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-snow">Academic-paper.pdf</p>
                      <p className="truncate text-xs text-mist">
                        Urban Ecosystems and Climate · 12 pages
                      </p>
                    </div>
                    <AnimatePresence>
                      {phase >= 2 && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 420, damping: 22 }}
                        >
                          <Tick className="h-5 w-5 text-[#5ee0a0]" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-3 flex h-[58px] flex-wrap content-start gap-1.5">
                    {phase >= 2 &&
                      CONCEPTS.map((c, i) => (
                        <motion.span
                          key={c}
                          initial={{ opacity: 0, y: 8, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 + i * 0.12, ease: EASE }}
                          className="rounded-full border border-violet-soft/30 bg-violet/15 px-2.5 py-1 text-[11px] text-[var(--chip-text)]"
                        >
                          {c}
                        </motion.span>
                      ))}
                  </div>

                  <div className="mt-2 flex-1 space-y-2.5 overflow-hidden">
                    {[92, 100, 78, 96, 64, 88, 72].map((w, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-2 rounded-full bg-white/[0.07]",
                          phase === 2 && "scan-sheen",
                          phase >= 3 && i % 3 === 1 && "bg-violet-soft/25",
                        )}
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>

                  <p className="mono-label mt-3 flex items-center gap-2 text-[10px] text-violet-soft">
                    <Sparkles className="h-3 w-3" />
                    {phase === 1 && "Reading source…"}
                    {phase === 2 && "Extracting concepts…"}
                    {phase >= 3 && "4 concepts · 1,820 words"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ---------------- Setup ---------------- */}
        <div className="flex min-h-0 flex-col">
          <PanelLabel>Assessment setup</PanelLabel>

          <FieldLabel>Exam</FieldLabel>
          <Segmented
            id="exam"
            options={[
              { value: "SAT", label: "SAT" },
              { value: "IELTS", label: "IELTS", ref: register("ielts") },
            ]}
            value={exam.id}
          />
          <p className="mt-2 h-4 text-xs text-mist">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={exam.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="inline-block"
              >
                {exam.id === "IELTS" ? "Academic · Reading" : "Digital SAT · Reading and Writing"}
              </motion.span>
            </AnimatePresence>
          </p>

          <FieldLabel>Difficulty</FieldLabel>
          <Segmented
            id="difficulty"
            options={DIFFICULTIES.map((d) => ({
              value: d.value,
              label: d.label,
              ...(d.value === "medium" ? { ref: register("medium") } : {}),
            }))}
            value={difficulty}
          />

          <FieldLabel>Questions</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {counts.map((c, i) => {
              const active = i === countIndex;
              return (
                <div
                  key={`${exam.id}-${c.value}`}
                  ref={i === counts.length - 1 ? register("count") : undefined}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 transition-[border-color,background-color,box-shadow] duration-300",
                    active
                      ? "glass-active border-violet-soft/60 bg-violet/15"
                      : "border-white/10 bg-white/[0.03]",
                  )}
                >
                  <p className="text-sm font-semibold text-snow tabular-nums">{c.label}</p>
                  <p className="mt-0.5 truncate text-[11px] text-mist">{c.hint}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-5">
            <GenerateButton
              phase={phase}
              agent={agent}
              cycle={cycle}
              buttonRef={register("generate")}
              summary={chosenCount ? `${exam.label} · ${chosenCount.value} questions` : exam.label}
            />
          </div>
        </div>
      </div>

      {/* Ready toast — hangs off the window's bottom edge so it never covers the UI */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-7 z-10 flex justify-center px-4">
        <AnimatePresence>
          {phase === 7 && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex w-full max-w-[380px] items-center gap-3 rounded-2xl border border-[#5ee0a0]/30 bg-[#0d1d1f] p-3 shadow-[0_24px_60px_-18px_rgb(0_0_0/0.95)]"
            >
              <Tick className="h-6 w-6 shrink-0 text-[#5ee0a0]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-snow">Assessment ready for review</p>
                <p className="truncate text-xs text-mist">
                  IELTS Reading · 40 questions · 3 passages · answer key
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rest anchor for the cursor */}
      <span
        ref={register("rest")}
        aria-hidden
        className="pointer-events-none absolute bottom-10 right-[22%] h-px w-px"
      />

      {/* Cursor */}
      {cursor && !reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block"
          initial={false}
          animate={{ x: cursor.x, y: cursor.y }}
          transition={{ duration: 0.42, ease: [0.45, 0, 0.2, 1] }}
        >
          <motion.span
            key={`click-${phase}-${cycle}`}
            className="absolute -left-4 -top-4 h-8 w-8 rounded-full border-2 border-violet-soft"
            initial={{ scale: 0.3, opacity: clicking ? 0.9 : 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <MousePointer2 className="h-5 w-5 fill-white text-ink drop-shadow-[0_4px_10px_rgb(0_0_0/0.6)]" />
        </motion.div>
      ) : null}
    </div>
  );
}

function PanelLabel({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-semibold text-snow">{children}</p>;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mono-label mb-2 mt-4 text-[10px] text-mist">{children}</p>;
}

function Segmented({
  id,
  options,
  value,
}: {
  id: string;
  options: { value: string; label: string; ref?: (el: HTMLElement | null) => void }[];
  value: string;
}) {
  return (
    <div
      className="grid gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <div
            key={o.value}
            ref={o.ref}
            className="relative flex h-8 items-center justify-center rounded-full text-[13px]"
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#8f6dff,#6a45ea)] shadow-[0_6px_20px_-6px_rgb(121_82_246/0.9)]"
              />
            )}
            <span
              className={cn(
                "relative font-medium transition-colors duration-300",
                active ? "text-[#fff]" : "text-mist",
              )}
            >
              {o.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function GenerateButton({
  phase,
  agent,
  cycle,
  buttonRef,
  summary,
}: {
  phase: number;
  agent: number;
  cycle: number;
  buttonRef: (el: HTMLElement | null) => void;
  summary: string;
}) {
  const generating = phase === 6;
  const ready = phase === 7;
  return (
    <div>
      <motion.div
        ref={buttonRef}
        animate={{ scale: phase === 6 ? [0.97, 1] : 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative flex h-12 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-[#fff]",
          ready
            ? "bg-[#163a33] shadow-[0_0_0_1px_rgb(94_224_160/0.4)]"
            : "bg-[linear-gradient(180deg,#8f6dff,#6a45ea)] shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_14px_36px_-12px_rgb(121_82_246/0.9)]",
        )}
      >
        {generating && (
          <motion.span
            key={`progress-${cycle}`}
            className="absolute inset-y-0 left-0 bg-white/20"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
        <span className="relative flex items-center gap-2">
          {ready ? (
            <>
              <Tick className="h-4 w-4 text-[#5ee0a0]" /> Ready · {summary}
            </>
          ) : generating ? (
            <>
              <FileText className="h-4 w-4" /> {AGENTS[agent]} working…
            </>
          ) : (
            <>Generate assessment →</>
          )}
        </span>
      </motion.div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {AGENTS.map((a, i) => {
          const done = ready || (generating && i < agent);
          const active = generating && i === agent;
          return (
            <div key={a} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300",
                  done ? "bg-[#5ee0a0]" : active ? "bg-violet-soft" : "bg-white/15",
                  active && "shadow-[0_0_10px_2px_rgb(155_122_255/0.7)]",
                )}
              />
              <span
                className={cn(
                  "truncate text-[11px] transition-colors duration-300",
                  done || active ? "text-snow" : "text-mist/60",
                )}
              >
                {a.replace(" agent", "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
