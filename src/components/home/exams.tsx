import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Clock, Flag, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { Container, DemoTag, EASE, Reveal, SectionTitle } from "@/components/home/ui";
import { DIFFICULTIES, EXAMS } from "@/lib/exams";
import { cn } from "@/lib/utils";

/*
 * Exam-format explorer. Each tab is one section the generator supports
 * today (read from `@/lib/exams`). Like the engine above, it plays itself
 * while on screen: tabs advance on a timer and a "student" answers the
 * sample questions. Any click hands control to the visitor.
 * The sample passages and questions are original, written for this page.
 */

const TAB_MS = 4600;
const STEP_MS = 550;

type TabId = "ielts-reading" | "sat-rw" | "sat-math";

interface Tab {
  id: TabId;
  exam: "SAT" | "IELTS";
  section: string;
  label: string;
  title: string;
  minutes: number;
  total: number;
  /** The question type, length and difficulty this sample was generated with. */
  type: string;
  count: number;
}

const TABS: Tab[] = [
  {
    id: "ielts-reading",
    exam: "IELTS",
    section: "Reading",
    label: "IELTS · Reading",
    title: "IELTS Academic Mock #023",
    minutes: 60,
    total: 40,
    type: "True / False / Not Given",
    count: 40,
  },
  {
    id: "sat-rw",
    exam: "SAT",
    section: "Reading and Writing",
    label: "SAT · Reading & Writing",
    title: "Digital SAT Practice · Module 1",
    minutes: 32,
    total: 27,
    type: "Information and Ideas",
    count: 27,
  },
  {
    id: "sat-math",
    exam: "SAT",
    section: "Math",
    label: "SAT · Math",
    title: "Digital SAT Practice · Math Module 1",
    minutes: 35,
    total: 22,
    type: "Algebra",
    count: 22,
  },
];

export function Exams() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();

  const [tabIndex, setTabIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [step, setStep] = useState(0);
  const [answered, setAnswered] = useState(0);

  const tab = TABS[tabIndex] ?? TABS[0]!;
  const section = EXAMS[tab.exam].sections.find((s) => s.id === tab.section);
  const playing = auto && inView && !reduce;

  // The simulated student: one action per STEP_MS.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => s + 1), STEP_MS);
    return () => clearInterval(id);
  }, [playing, tabIndex]);

  // Advance to the next format.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      setTabIndex((i) => (i + 1) % TABS.length);
      setStep(0);
    }, TAB_MS);
    return () => clearTimeout(t);
  }, [playing, tabIndex]);

  const choose = (i: number) => {
    setAuto(false);
    setTabIndex(i);
    setStep(0);
  };
  const takeOver = () => setAuto(false);
  const replay = () => {
    setStep(0);
    setAuto(true);
  };

  const sampleProps = { step, auto: playing, onInteract: takeOver, onAnswered: setAnswered };

  return (
    <section id="exams" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container>
        <SectionTitle
          eyebrow="Exam formats"
          title={
            <>
              Built around the <span className="text-violet-gradient">real exam shapes.</span>
            </>
          }
          sub="Testly follows the structure of each section — passages, question types, timing and numbering — so a generated mock feels like the real thing to students."
        />

        <div ref={ref}>
          <Reveal className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <div
              role="tablist"
              aria-label="Exam format"
              className="glass inline-flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5"
            >
              {TABS.map((t, i) => {
                const active = i === tabIndex;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="exam-panel"
                    onClick={() => choose(i)}
                    className="relative h-10 shrink-0 overflow-hidden rounded-full px-4 text-sm font-medium sm:px-5"
                  >
                    {active && (
                      <motion.span
                        layoutId="exam-tab"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                        className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#8f6dff,#6a45ea)] shadow-[0_8px_24px_-8px_rgb(121_82_246/0.9)]"
                      />
                    )}
                    {active && playing && (
                      <motion.span
                        key={`bar-${tabIndex}`}
                        aria-hidden
                        className="absolute bottom-0 left-0 h-[2px] bg-white/80"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: TAB_MS / 1000, ease: "linear" }}
                      />
                    )}
                    <span
                      className={cn(
                        "relative transition-colors",
                        active ? "text-[#fff]" : "text-mist hover:text-snow",
                      )}
                    >
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={auto ? takeOver : replay}
              aria-label={auto ? "Pause the demo" : "Play the demo"}
              className="glass grid h-11 w-11 place-items-center rounded-full text-mist transition-colors hover:text-snow"
            >
              {auto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </Reveal>

          <Reveal delay={0.08} className="mt-8">
            <div
              id="exam-panel"
              role="tabpanel"
              className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"
            >
              {/* Student view */}
              <div className="glass relative overflow-hidden rounded-[26px]">
                <TestHeader tab={tab} />
                <div className="relative h-[520px] sm:h-[440px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={tab.id}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="absolute inset-0"
                    >
                      {tab.id === "ielts-reading" && <IeltsReading {...sampleProps} />}
                      {tab.id === "sat-rw" && <SatReadingWriting {...sampleProps} />}
                      {tab.id === "sat-math" && <SatMath {...sampleProps} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <QuestionNav total={tab.total} answered={answered} />
              </div>

              {/* Educator config: what this sample was generated with */}
              <div className="glass flex flex-col rounded-[26px] p-6">
                <p className="mono-label text-[10px] text-violet-soft">Generated with</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={tab.id}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    variants={{ show: { transition: { staggerChildren: 0.035 } } }}
                    className="flex flex-1 flex-col"
                  >
                    <p className="mt-3 text-lg font-semibold text-snow">{tab.label}</p>

                    <ConfigLabel>Question types</ConfigLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {section?.questionTypes.map((q) => (
                        <ConfigChip key={q.id} active={q.id === tab.type}>
                          {q.label}
                        </ConfigChip>
                      ))}
                    </div>

                    <ConfigLabel>Length</ConfigLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {section?.counts.map((c) => (
                        <motion.div
                          key={c.value}
                          variants={chipVariants}
                          className={cn(
                            "rounded-xl border px-3 py-2",
                            c.value === tab.count
                              ? "glass-active border-violet-soft/60 bg-violet/15"
                              : "border-white/10 bg-white/[0.03]",
                          )}
                        >
                          <p className="text-sm font-semibold tabular-nums text-snow">{c.label}</p>
                          <p className="text-[11px] leading-tight text-mist">{c.hint}</p>
                        </motion.div>
                      ))}
                    </div>

                    <ConfigLabel>Difficulty</ConfigLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {DIFFICULTIES.map((d) => (
                        <ConfigChip key={d.value} active={d.value === "medium"}>
                          {d.label}
                        </ConfigChip>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
                <p className="mt-6 border-t border-white/[0.07] pt-4 text-xs leading-relaxed text-mist">
                  Coming next: IELTS Listening &amp; Writing, AP and Milliy formats.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

const chipVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE } },
};

function ConfigChip({ children, active }: { children: string; active: boolean }) {
  return (
    <motion.span
      variants={chipVariants}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs",
        active
          ? "border-violet-soft/60 bg-violet/20 text-snow"
          : "border-white/10 bg-white/[0.03] text-mist",
      )}
    >
      {children}
    </motion.span>
  );
}

function ConfigLabel({ children }: { children: string }) {
  return <p className="mono-label mb-2.5 mt-6 text-[10px] text-mist">{children}</p>;
}

/* ------------------------------------------------------------------ */

function TestHeader({ tab }: { tab: Tab }) {
  return (
    <div className="flex h-14 items-center justify-between gap-3 border-b border-white/[0.07] px-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <TestlyMark tone="dark" className="h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-snow">{tab.title}</p>
          <p className="truncate text-[11px] text-mist">Candidate: Damirbek X.</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <DemoTag className="hidden md:inline-flex" />
        <Countdown key={tab.id} minutes={tab.minutes} />
      </div>
    </div>
  );
}

/** A real ticking timer — only while the panel is on screen. */
function Countdown({ minutes }: { minutes: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const [left, setLeft] = useState(minutes * 60 - 1);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : minutes * 60 - 1)), 1000);
    return () => clearInterval(id);
  }, [inView, minutes]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <span
      ref={ref}
      className="flex items-center gap-1.5 font-mono text-sm font-medium tabular-nums text-snow"
      aria-label="Time remaining"
    >
      <Clock className="h-3.5 w-3.5 text-mist" />
      {mm}:{ss}
    </span>
  );
}

function QuestionNav({ total, answered }: { total: number; answered: number }) {
  return (
    <div className="flex h-12 items-center gap-1 overflow-hidden border-t border-white/[0.07] px-4 sm:px-5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "grid h-6 min-w-6 shrink-0 place-items-center rounded-md text-[10px] font-medium tabular-nums transition-colors duration-300",
            i < answered
              ? "bg-violet text-[#fff]"
              : i === answered
                ? "border border-violet-soft text-snow"
                : "bg-white/[0.05] text-mist/70",
          )}
        >
          {i + 1}
        </span>
      ))}
    </div>
  );
}

/* ---------------------------- Sample tests ---------------------------- */

interface SampleProps {
  /** How many simulated actions have happened on this tab. */
  step: number;
  /** True while the demo drives the sample. */
  auto: boolean;
  onInteract: () => void;
  onAnswered: (count: number) => void;
}

function Choice({
  letter,
  text,
  selected,
  onSelect,
}: {
  letter: string;
  text: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-[13px] transition-[border-color,background-color,transform] duration-200",
        selected
          ? "scale-[1.01] border-violet-soft/70 bg-violet/15 text-snow"
          : "border-white/10 bg-white/[0.02] text-snow/85 hover:border-white/25",
      )}
    >
      <span
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold transition-colors",
          selected ? "border-violet-soft bg-violet text-[#fff]" : "border-white/20 text-mist",
        )}
      >
        {letter}
      </span>
      {text}
    </button>
  );
}

const IELTS_QS = [
  { q: "Green corridors connect habitats that were previously separate.", a: "TRUE" },
  { q: "Green corridors raise street temperatures during summer.", a: "FALSE" },
  { q: "Planners value corridors mainly for their appearance.", a: "FALSE" },
  { q: "Most cities have already built green corridors.", a: "NOT GIVEN" },
];

function IeltsReading({ step, auto, onInteract, onAnswered }: SampleProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // While autoplaying, answer one question per step.
  useEffect(() => {
    if (!auto) return;
    const n = Math.min(step, IELTS_QS.length);
    setAnswers(Object.fromEntries(IELTS_QS.slice(0, n).map((x, i) => [i + 1, x.a])));
  }, [auto, step]);

  useEffect(() => onAnswered(Object.keys(answers).length), [answers, onAnswered]);

  const highlighted = auto ? Math.min(step, IELTS_QS.length) : -1;

  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] sm:grid-cols-2 sm:grid-rows-1">
      <div className="overflow-hidden border-b border-white/[0.07] p-5 sm:border-b-0 sm:border-r">
        <p className="mono-label text-[10px] text-mist">Reading passage 1</p>
        <p className="mt-2 text-base font-semibold text-snow">Urban Green Corridors</p>
        <p className="mt-3 text-[13px] leading-relaxed text-mist">
          <span className="font-semibold text-snow">A</span> Green corridors are often described as
          infrastructure rather than ornament.{" "}
          <Mark on={highlighted === 0 || highlighted === 1}>
            By linking fragmented habitats, they allow species to move between parks and riverbanks,
          </Mark>{" "}
          <Mark on={highlighted === 2}>
            while the same shaded routes lower street temperatures during heat waves.
          </Mark>
        </p>
        <p className="mt-3 hidden text-[13px] leading-relaxed text-mist sm:block">
          <span className="font-semibold text-snow">B</span>{" "}
          <Mark on={highlighted === 3}>
            Planners therefore treat corridors as a single investment answering two separate
            pressures.
          </Mark>
        </p>
      </div>
      <div className="overflow-y-auto p-5">
        <p className="text-sm font-semibold text-snow">Questions 1–4</p>
        <p className="mt-1 text-xs text-mist">
          Do the following statements agree with the information in the passage?
        </p>
        <ol className="mt-4 space-y-3.5">
          {IELTS_QS.map(({ q }, i) => (
            <li key={q}>
              <p className="flex gap-2 text-[13px] text-snow/90">
                <span className="font-semibold text-mist">{i + 1}</span>
                {q}
              </p>
              <div className="mt-2 flex gap-1.5 pl-4">
                {["TRUE", "FALSE", "NOT GIVEN"].map((opt) => {
                  const selected = answers[i + 1] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        onInteract();
                        setAnswers((a) => ({ ...a, [i + 1]: opt }));
                      }}
                      className={cn(
                        "rounded-md border px-2 py-1 font-mono text-[10px] font-medium transition-[background-color,border-color,transform] duration-200",
                        selected
                          ? "scale-105 border-violet-soft bg-violet text-[#fff]"
                          : "border-white/10 text-mist hover:border-white/25",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** Highlighter sweep over the passage text the "student" is reading. */
function Mark({ on, children }: { on: boolean; children: string }) {
  return (
    <span
      className={cn(
        "rounded-[3px] transition-[background-color,color] duration-500",
        on ? "bg-violet-soft/30 text-snow" : "bg-transparent",
      )}
    >
      {children}
    </span>
  );
}

const SAT_RW_OPTIONS = [
  "Corridors mainly serve to make city streets more attractive.",
  "A single design can address both ecological and climate needs.",
  "Riverbanks are more important to wildlife than parks.",
  "Heat waves have become less frequent in planned cities.",
];

function SatReadingWriting({ step, auto, onInteract, onAnswered }: SampleProps) {
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    if (auto) setChoice(step >= 3 ? "B" : null);
  }, [auto, step]);
  useEffect(() => onAnswered(choice ? 1 : 0), [choice, onAnswered]);

  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] sm:grid-cols-2 sm:grid-rows-1">
      <div className="border-b border-white/[0.07] p-5 sm:border-b-0 sm:border-r">
        <p className="text-[13px] leading-relaxed text-snow/90">
          Urban green corridors are often described as infrastructure rather than ornament.{" "}
          <Mark on={auto && step >= 1}>
            By linking fragmented habitats, they allow species to move between parks and riverbanks,
          </Mark>{" "}
          <Mark on={auto && step >= 2}>
            while the same shaded routes lower street temperatures during heat waves.
          </Mark>
        </p>
      </div>
      <div className="overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-snow">
            Question 1
          </span>
          <span className="flex items-center gap-1 text-[11px] text-mist">
            <Flag className="h-3 w-3" /> Mark for review
          </span>
        </div>
        <p className="mt-3 text-[13px] font-medium text-snow">
          Which choice best states the main idea of the text?
        </p>
        <div className="mt-3 space-y-2">
          {SAT_RW_OPTIONS.map((o, i) => {
            const letter = String.fromCharCode(65 + i);
            return (
              <Choice
                key={o}
                letter={letter}
                text={o}
                selected={choice === letter}
                onSelect={() => {
                  onInteract();
                  setChoice(letter);
                }}
              />
            );
          })}
        </div>
        <SavedNote show={choice !== null} />
      </div>
    </div>
  );
}

function SatMath({ step, auto, onInteract, onAnswered }: SampleProps) {
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    if (auto) setChoice(step >= 4 ? "B" : null);
  }, [auto, step]);
  useEffect(() => onAnswered(choice ? 1 : 0), [choice, onAnswered]);

  const work = ["3x + 7 = 25", "3x = 18  →  x = 6", "6x − 4 = 36 − 4 = 32"];
  const shown = auto ? Math.min(step, work.length) : choice ? work.length : 0;

  return (
    <div className="flex h-full flex-col items-center justify-center p-5">
      <div className="w-full max-w-[520px]">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-snow">
            Question 1
          </span>
          <span className="text-[11px] text-mist">Algebra · Medium</span>
        </div>
        <p className="mt-4 text-[15px] text-snow">
          If <span className="font-mono">3x + 7 = 25</span>, what is the value of{" "}
          <span className="font-mono">6x − 4</span>?
        </p>

        {/* scratch work */}
        <div className="mt-4 h-[84px] rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-2.5 font-mono text-[12px] text-mist">
          <AnimatePresence initial={false}>
            {work.slice(0, shown).map((w) => (
              <motion.p
                key={w}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="leading-6"
              >
                {w}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {["28", "32", "36", "40"].map((o, i) => {
            const letter = String.fromCharCode(65 + i);
            return (
              <Choice
                key={o}
                letter={letter}
                text={o}
                selected={choice === letter}
                onSelect={() => {
                  onInteract();
                  setChoice(letter);
                }}
              />
            );
          })}
        </div>
        <SavedNote show={choice !== null} />
      </div>
    </div>
  );
}

function SavedNote({ show }: { show: boolean }) {
  return (
    <p className="mt-3 h-5 text-right text-[11px]">
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-1.5 text-[#5ee0a0]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#5ee0a0]" /> Answer saved
          </motion.span>
        )}
      </AnimatePresence>
    </p>
  );
}
