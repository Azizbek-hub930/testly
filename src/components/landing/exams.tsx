import { motion } from "motion/react";
import { useState } from "react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { LabelChip } from "@/components/site/paper";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { cn } from "@/lib/utils";

const SAT = [
  {
    group: "Reading & Writing",
    items: [
      "Information & Ideas",
      "Craft & Structure",
      "Expression of Ideas",
      "Standard English Conventions",
    ],
  },
  {
    group: "Math",
    items: ["Algebra", "Advanced Math", "Problem Solving", "Geometry"],
  },
];

const IELTS_FORMATS = [
  "Multiple Choice",
  "True / False / Not Given",
  "Matching Headings",
  "Matching Information",
  "Sentence Completion",
  "Summary Completion",
];

const IELTS_CONFIGS = [
  ["13 questions", "1 passage"],
  ["27 questions", "2 passages"],
  ["40 questions", "3 passages"],
];

export function Exams() {
  const [config, setConfig] = useState(2);
  const [format, setFormat] = useState("Matching Headings");

  return (
    <section id="exams" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="SAT & IELTS"
          title={
            <>
              Built around the
              <br />
              <span className="text-indigo">real exam shapes.</span>
            </>
          }
          intro="Testly generates against the section, domain, and question formats each exam actually uses."
        />

        {/* Oversized exam cards */}
        <RevealGroup className="mt-14 grid gap-5 lg:grid-cols-2">
          <RevealItem>
            <ExamCard name="SAT" count="27 Questions" detail="Reading & Writing" tilt={-0.6} />
          </RevealItem>
          <RevealItem>
            <ExamCard name="IELTS" count="40 Questions" detail="Reading" tilt={0.6} accent />
          </RevealItem>
        </RevealGroup>

        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          {/* SAT domains */}
          <Reveal>
            <div className="paper-card h-full p-6">
              <div className="flex items-center gap-2">
                <LabelChip tone="navy">SAT</LabelChip>
                <span className="text-xs text-muted-foreground">Domains</span>
              </div>
              <div className="mt-6 space-y-6">
                {SAT.map((g) => (
                  <div key={g.group}>
                    <p className="eyebrow text-muted-foreground">{g.group}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {g.items.map((i) => (
                        <span
                          key={i}
                          className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs transition-colors hover:border-indigo/40 hover:text-indigo"
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* IELTS formats + configs */}
          <Reveal delay={0.08}>
            <div className="paper-card h-full p-6">
              <div className="flex items-center gap-2">
                <LabelChip tone="indigo">IELTS</LabelChip>
                <span className="text-xs text-muted-foreground">Reading formats</span>
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {IELTS_FORMATS.map((f) => {
                  const active = format === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all duration-200",
                        active
                          ? "border-indigo bg-indigo/8 text-indigo"
                          : "border-hairline bg-surface text-muted-foreground hover:-translate-y-0.5 hover:border-indigo/40 hover:text-foreground",
                      )}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>

              <p className="eyebrow mt-7 text-muted-foreground">Configuration</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {IELTS_CONFIGS.map(([q, p], i) => {
                  const active = config === i;
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setConfig(i)}
                      className={cn(
                        "paper-card px-3 py-3 text-left transition-all duration-200",
                        active
                          ? "border-indigo/50 -translate-y-0.5"
                          : "hover:-translate-y-0.5 hover:border-indigo/30",
                      )}
                    >
                      <p className={cn("text-sm font-semibold", active && "text-indigo")}>{q}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{p}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ExamCard({
  name,
  count,
  detail,
  tilt,
  accent = false,
}: {
  name: string;
  count: string;
  detail: string;
  tilt: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -8, rotate: 0 }}
      initial={{ rotate: tilt }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="paper-card group relative h-full overflow-hidden p-7 sm:p-9"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 rule-lines opacity-[0.35]" />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl transition-opacity duration-500",
          accent ? "bg-indigo/15" : "bg-navy/10",
          "opacity-0 group-hover:opacity-100",
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="display text-[3rem] leading-none sm:text-[3.6rem]">{name}</p>
          <p className="mt-4 text-sm text-muted-foreground">{detail}</p>
        </div>
        <TestlyMark className="h-6 w-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="relative mt-10 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold">{count}</span>
        <span className="h-px flex-1 origin-left scale-x-0 bg-indigo transition-transform duration-500 group-hover:scale-x-100" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Generated by Testly
        </span>
      </div>
    </motion.div>
  );
}
