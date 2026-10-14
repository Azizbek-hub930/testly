import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { BookOpenText, PenLine, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Container, DemoTag, EASE, SectionTitle, Tick } from "@/components/home/ui";
import { cn } from "@/lib/utils";

/*
 * The engine: Research → Assessment → Quality → your review.
 * One stage at a time lights up across three equal agent cards, a connector
 * fills between them, and the canvas below shows what that stage produces.
 * Autoplays while visible; every stage is also directly selectable.
 */

const STAGE_MS = 3000;

const STAGES = [
  { id: "research", label: "Research", title: "Reads the source, builds a blueprint" },
  { id: "generate", label: "Generate", title: "Writes exam-shaped questions" },
  { id: "quality", label: "Quality review", title: "Checks structure and the answer key" },
  { id: "ready", label: "Your review", title: "You review, edit and approve" },
] as const;

interface AgentDef {
  name: string;
  role: string;
  icon: ReactNode;
  rows: { label: string; values: [string, string, string, string] }[];
  status: [string, string, string, string];
}

const AGENTS: AgentDef[] = [
  {
    name: "Research agent",
    role: "Finds and organizes source material",
    icon: <BookOpenText className="h-[18px] w-[18px]" />,
    rows: [
      { label: "Source", values: ["1 PDF", "1 PDF", "1 PDF", "1 PDF"] },
      { label: "Concepts", values: ["Indexing…", "4 found", "4 found", "4 found"] },
    ],
    status: ["Active", "Done", "Done", "Done"],
  },
  {
    name: "Assessment agent",
    role: "Creates SAT / IELTS-style questions",
    icon: <PenLine className="h-[18px] w-[18px]" />,
    rows: [
      {
        label: "Exam",
        values: ["IELTS Reading", "IELTS Reading", "IELTS Reading", "IELTS Reading"],
      },
      { label: "Questions", values: ["—", "Writing…", "40", "40"] },
    ],
    status: ["Waiting", "Active", "Done", "Done"],
  },
  {
    name: "Quality agent",
    role: "Checks structure and answers",
    icon: <ShieldCheck className="h-[18px] w-[18px]" />,
    rows: [
      { label: "Checks", values: ["—", "—", "Running…", "6 / 6"] },
      { label: "Flagged", values: ["—", "—", "…", "2 for review"] },
    ],
    status: ["Waiting", "Waiting", "Active", "Done"],
  },
];

export function Engine() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [run, setRun] = useState(0);

  const autoplay = inView && !reduce;

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => setStage((s) => (s + 1) % STAGES.length), STAGE_MS);
    return () => clearTimeout(t);
  }, [autoplay, stage, run]);

  const select = (i: number) => {
    setStage(i);
    setRun((r) => r + 1);
  };

  return (
    <section id="workflow" className="relative scroll-mt-20 py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/3 -z-10 h-[60%] bg-[radial-gradient(60%_50%_at_50%_50%,rgb(121_82_246/0.16),transparent)]"
      />
      <Container>
        <SectionTitle
          eyebrow="The engine"
          title={
            <>
              Three specialized agents.
              <br className="hidden sm:block" />{" "}
              <span className="text-violet-gradient">One connected workflow.</span>
            </>
          }
          sub="Each agent does one job well and hands its work to the next — and you get the final word before anything reaches students."
        />

        <div ref={ref} className="mt-14 sm:mt-16">
          {/* Agent row */}
          <div className="relative">
            <Connector stage={stage} />
            <div className="relative grid gap-3 md:grid-cols-3 md:gap-10">
              {AGENTS.map((a, i) => (
                <AgentCard
                  key={a.name}
                  agent={a}
                  index={i}
                  stage={stage}
                  onSelect={() => select(i)}
                />
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="glass relative mt-6 h-[440px] overflow-hidden rounded-[28px] sm:h-[380px] md:mt-10">
            <div className="absolute right-4 top-4 z-10">
              <DemoTag />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="absolute inset-0 p-5 pt-14 sm:p-8 sm:pt-14"
              >
                {stage === 0 && <ResearchView />}
                {stage === 1 && <GenerateView />}
                {stage === 2 && <QualityView />}
                {stage === 3 && <ReadyView />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stage track */}
          <div
            role="tablist"
            aria-label="Workflow stages"
            className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {STAGES.map((s, i) => {
              const active = i === stage;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => select(i)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border px-4 py-3 text-left transition-colors duration-300",
                    active
                      ? "border-violet-soft/40 bg-violet/10"
                      : "border-white/[0.07] bg-white/[0.02] hover:border-white/15",
                  )}
                >
                  <span className="mono-label text-[10px] text-mist">0{i + 1}</span>
                  <span
                    className={cn(
                      "mt-1 block text-sm font-medium transition-colors",
                      active ? "text-snow" : "text-mist",
                    )}
                  >
                    {s.label}
                  </span>
                  <span className="mt-0.5 hidden truncate text-xs text-mist/70 sm:block">
                    {s.title}
                  </span>
                  {active && (
                    <motion.span
                      key={`bar-${stage}-${run}`}
                      aria-hidden
                      className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-violet to-violet-soft"
                      initial={{ width: autoplay ? "0%" : "100%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: autoplay ? STAGE_MS / 1000 : 0, ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Connector({ stage }: { stage: number }) {
  // Fill reaches card 2 at stage 1, card 3 at stage 2+.
  const fill = Math.min(stage, 2) / 2;
  return (
    <div
      aria-hidden
      className="absolute inset-x-[16%] top-1/2 hidden h-[2px] -translate-y-1/2 md:block"
    >
      <div className="absolute inset-0 rounded-full bg-white/[0.08]" />
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet to-violet-soft shadow-[0_0_14px_2px_rgb(155_122_255/0.6)]"
        animate={{ width: `${fill * 100}%` }}
        transition={{ duration: 0.8, ease: EASE }}
      />
      <motion.span
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff] shadow-[0_0_16px_4px_rgb(155_122_255/0.9)]"
        animate={{ left: `${fill * 100}%` }}
        transition={{ duration: 0.8, ease: EASE }}
      />
    </div>
  );
}

function AgentCard({
  agent,
  index,
  stage,
  onSelect,
}: {
  agent: AgentDef;
  index: number;
  stage: number;
  onSelect: () => void;
}) {
  const state = agent.status[stage] ?? "Waiting";
  const active = state === "Active";
  const done = state === "Done";
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      animate={{ y: active ? -6 : 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cn(
        "glass flex h-full flex-col rounded-[22px] p-5 text-left transition-[border-color,box-shadow] duration-500 md:h-[200px]",
        active && "glass-active",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors duration-500",
            active
              ? "border-violet-soft/50 bg-violet/25 text-[var(--chip-text)]"
              : "border-white/10 bg-white/[0.04] text-mist",
          )}
        >
          {agent.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-snow">{agent.name}</p>
          <p className="mt-0.5 truncate text-xs text-mist">{agent.role}</p>
        </div>
        <span className="mono-label text-[10px] text-mist/60">0{index + 1}</span>
      </div>

      <dl className="mt-5 space-y-2 border-t border-white/[0.06] pt-4 font-mono text-[11px]">
        {agent.rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <dt className="uppercase tracking-[0.12em] text-mist/70">{r.label}</dt>
            <dd className="truncate text-snow">{r.values[stage]}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3">
          <dt className="uppercase tracking-[0.12em] text-mist/70">Status</dt>
          <dd
            className={cn(
              "flex items-center gap-1.5",
              active ? "text-violet-soft" : done ? "text-[#5ee0a0]" : "text-mist/70",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                active ? "animate-pulse bg-violet-soft" : done ? "bg-[#5ee0a0]" : "bg-white/20",
              )}
            />
            {state}
          </dd>
        </div>
      </dl>
    </motion.button>
  );
}

/* ---------------------------- Stage views ---------------------------- */

const stagger = (i: number, base = 0.08) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay: base + i * 0.07, ease: EASE },
});

function ResearchView() {
  const blueprint = [
    ["Passage 1", "Urban green corridors"],
    ["Passage 2", "Cooling the heat island"],
    ["Passage 3", "Planning for biodiversity"],
    ["Question mix", "T/F/NG · Headings · Summary"],
  ];
  return (
    <div className="flex h-full flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:gap-10">
      <div className="hidden w-[260px] shrink-0 rounded-2xl bg-[#f4f5fb] p-5 text-[#1b2140] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] sm:block">
        <p className="text-[13px] font-semibold">Academic-paper.pdf</p>
        <div className="mt-4 space-y-2">
          {[100, 90, 96, 74, 100, 86, 92, 60, 88].map((w, i) => (
            <div
              key={i}
              className="relative h-1.5 rounded-full bg-[#1b2140]/12"
              style={{ width: `${w}%` }}
            >
              {i % 3 === 1 && (
                <motion.div
                  className="absolute inset-0 origin-left rounded-full bg-[#9b7aff]/70"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.08, ease: EASE }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <svg
        aria-hidden
        viewBox="0 0 80 20"
        className="hidden h-5 w-20 shrink-0 text-violet-soft sm:block"
      >
        <motion.path
          d="M2 10 H70 M62 3 L72 10 L62 17"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
        />
      </svg>

      <div className="min-w-0 flex-1">
        <p className="mono-label text-[10px] text-violet-soft">Assessment blueprint</p>
        <ul className="mt-3 space-y-2">
          {blueprint.map(([k, v], i) => (
            <motion.li
              key={k}
              {...stagger(i, 0.3)}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <span className="text-xs text-mist">{k}</span>
              <span className="truncate text-sm font-medium text-snow">{v}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const QUESTION_CARDS = [
  { n: "Q01", t: "True / False / Not Given" },
  { n: "Q02", t: "True / False / Not Given" },
  { n: "Q14", t: "Matching Headings" },
  { n: "Q15", t: "Matching Headings" },
  { n: "Q28", t: "Summary Completion" },
  { n: "Q29", t: "Multiple Choice" },
];

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}

function GenerateView() {
  const wide = useWide();
  const spread = wide ? 108 : 40;
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="relative h-[200px] w-full max-w-[760px]">
        {QUESTION_CARDS.map((q, i) => {
          const mid = (QUESTION_CARDS.length - 1) / 2;
          const offset = i - mid;
          return (
            <motion.div
              key={q.n}
              className="absolute left-1/2 top-4 -ml-[70px] h-[150px] w-[140px] rounded-2xl bg-[#f4f5fb] p-3.5 text-[#1b2140] shadow-[0_24px_50px_-18px_rgb(0_0_0/0.9)] sm:-ml-[80px] sm:w-[160px]"
              initial={{ x: 0, y: 30, rotate: 0, opacity: 0 }}
              animate={{
                x: offset * spread,
                y: Math.abs(offset) * (wide ? 10 : 6),
                rotate: offset * 6,
                opacity: 1,
              }}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.06, ease: EASE }}
              style={{ zIndex: 10 - Math.round(Math.abs(offset)) }}
            >
              <p className="font-mono text-[10px] font-semibold text-[#6a45ea]">{q.n}</p>
              <p className="mt-1 text-[11px] font-semibold leading-tight">{q.t}</p>
              <div className="mt-3 space-y-1.5">
                {[100, 86, 70].map((w, k) => (
                  <div
                    key={k}
                    className="h-1.5 rounded-full bg-[#1b2140]/12"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1">
                {["A", "B", "C", "D"].map((l) => (
                  <span
                    key={l}
                    className="rounded-md border border-[#1b2140]/10 py-0.5 text-center text-[9px] font-semibold text-[#6b7290]"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
      <motion.p {...stagger(0, 0.45)} className="mt-4 text-center text-sm text-mist">
        <span className="font-semibold text-snow">40 questions</span> across 3 passages, in the
        question types you chose
      </motion.p>
    </div>
  );
}

const CHECKS: { label: string; flag?: boolean }[] = [
  { label: "Each question has exactly one keyed answer" },
  { label: "Answer key is supported by the passage" },
  { label: "Question types match IELTS Reading" },
  { label: "Numbering and formatting are consistent" },
  { label: "2 items flagged for a human look", flag: true },
];

/** Rows on the top sheet: answer, and whether the quality agent flags it. */
const PAPER_ROWS: { q: number; a: string; flag?: boolean }[] = [
  { q: 1, a: "TRUE" },
  { q: 2, a: "FALSE" },
  { q: 3, a: "NOT GIVEN", flag: true },
  { q: 4, a: "TRUE" },
  { q: 5, a: "FALSE" },
  { q: 6, a: "NOT GIVEN" },
];

/** A stack of real-looking exam sheets: ruled lines, margin, ticks marked in as the agent checks. */
function PaperStack() {
  const sheet =
    "absolute inset-0 rounded-[6px] border border-black/[0.06] bg-[#fbfaf6] shadow-[0_18px_36px_-18px_rgb(0_0_0/0.85)]";
  const ruled = {
    backgroundImage:
      "linear-gradient(90deg, transparent 26px, rgb(230 90 90 / 0.35) 26px, rgb(230 90 90 / 0.35) 27px, transparent 27px), repeating-linear-gradient(180deg, transparent 0 21px, rgb(120 140 200 / 0.28) 21px 22px)",
    backgroundPosition: "0 0, 0 44px",
  };
  return (
    <div className="relative mx-auto hidden h-[262px] w-[206px] shrink-0 sm:block">
      {/* sheets underneath */}
      {[2, 1].map((i) => (
        <motion.div
          key={i}
          className={sheet}
          style={{ ...ruled, zIndex: 3 - i }}
          initial={{ opacity: 0, rotate: 0, x: 0, y: 0 }}
          animate={{ opacity: 1, rotate: i === 2 ? -6 : 3.5, x: i === 2 ? -10 : 8, y: i * 4 }}
          transition={{ duration: 0.45, delay: 0.05 * i, ease: EASE }}
        />
      ))}

      {/* top sheet */}
      <motion.div
        className={cn(sheet, "z-10 overflow-hidden px-3 pb-3 pt-3 text-[#1b2140]")}
        style={ruled}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        {/* folded corner */}
        <span
          aria-hidden
          className="absolute right-0 top-0 h-5 w-5 bg-[linear-gradient(225deg,#141c42_50%,#e6e3da_50%)] shadow-[-2px_2px_3px_rgb(0_0_0/0.15)]"
        />
        <div className="flex h-[32px] items-start justify-between pl-[22px] pr-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em]">IELTS Academic</p>
            <p className="text-[8px] text-[#6b7290]">Reading · Passage 1</p>
          </div>
        </div>
        <ul className="pl-[22px]">
          {PAPER_ROWS.map((row, i) => (
            <li key={row.q} className="flex h-[22px] items-center gap-2 font-mono text-[9px]">
              <span className="w-3 text-right text-[#6b7290]">{row.q}</span>
              <span className="h-[1px] w-8 bg-[#1b2140]/30" />
              <span className="font-semibold">{row.a}</span>
              <motion.span
                className="ml-auto"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.35 + i * 0.12 }}
              >
                {row.flag ? (
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#f5a524] text-[8px] font-bold text-[#fff]">
                    !
                  </span>
                ) : (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#1f9d63]" aria-hidden>
                    <path
                      d="M3 8.5l3 3L13 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </motion.span>
            </li>
          ))}
        </ul>
        <p className="absolute bottom-2 left-0 right-0 text-center font-mono text-[8px] text-[#6b7290]">
          Page 1 of 6
        </p>

        {/* the quality agent's scan line */}
        <motion.span
          aria-hidden
          className="absolute inset-x-0 h-10 bg-[linear-gradient(180deg,transparent,rgb(121_82_246/0.18),transparent)]"
          initial={{ top: "-15%" }}
          animate={{ top: "105%" }}
          transition={{ duration: 1.3, delay: 0.25, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.span
        className="absolute -right-3 -top-3 z-20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 18, delay: 1.2 }}
      >
        <Tick className="h-9 w-9 text-[#5ee0a0] drop-shadow-[0_0_14px_rgb(94_224_160/0.6)]" />
      </motion.span>
    </div>
  );
}

function QualityView() {
  return (
    <div className="flex h-full flex-col justify-center gap-6 sm:flex-row sm:items-center sm:gap-12">
      <PaperStack />

      <ul className="min-w-0 flex-1 space-y-2.5">
        {CHECKS.map((c, i) => (
          <motion.li
            key={c.label}
            {...stagger(i, 0.15)}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm",
              c.flag
                ? "border-[#ffc861]/30 bg-[#ffc861]/[0.07] text-[#ffe2a3]"
                : "border-white/[0.07] bg-white/[0.03] text-snow",
            )}
          >
            {c.flag ? (
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#ffc861] text-[10px] font-bold text-ink">
                !
              </span>
            ) : (
              <Tick className="h-4 w-4 shrink-0 text-[#5ee0a0]" />
            )}
            <span className="truncate">{c.label}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function ReadyView() {
  return (
    <div className="flex h-full flex-col justify-center">
      <motion.div
        {...stagger(0, 0.05)}
        className="mx-auto w-full max-w-[640px] rounded-2xl border border-white/10 bg-white/[0.04] p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-snow">IELTS Academic Mock · Reading</p>
            <p className="mt-0.5 text-xs text-mist">
              40 questions · 3 passages · answer key included
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#5ee0a0]/12 px-3 py-1 text-xs font-medium text-[#5ee0a0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5ee0a0]" /> Ready for review
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {["Passage 1 · Q1–13", "Passage 2 · Q14–26", "Passage 3 · Q27–40"].map((p, i) => (
            <motion.div
              key={p}
              {...stagger(i, 0.15)}
              className="rounded-xl border border-white/[0.08] bg-ink/60 p-3"
            >
              <p className="truncate text-[11px] font-medium text-snow">{p}</p>
              <div className="mt-2.5 space-y-1.5">
                {[100, 80, 92].map((w, k) => (
                  <div
                    key={k}
                    className="h-1 rounded-full bg-white/10"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
          <p className="text-xs text-mist">Every question stays editable before students see it.</p>
          <span className="inline-flex h-9 items-center rounded-full bg-[linear-gradient(180deg,#8f6dff,#6a45ea)] px-4 text-[13px] font-medium text-[#fff]">
            Review &amp; edit →
          </span>
        </div>
      </motion.div>
    </div>
  );
}
