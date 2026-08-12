import { motion } from "motion/react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { LabelChip, PassageLines } from "@/components/site/paper";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";

export function PaperToPractice() {
  return (
    <section id="product" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="The story"
          title={
            <>
              From paper to <span className="text-indigo">practice.</span>
            </>
          }
          intro="One source document becomes a structured, exam-shaped assessment."
        />

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-4">
          <RevealItem>
            <Stage step="01" label="Paper">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded bg-navy text-[9px] font-semibold text-background">
                  PDF
                </span>
                <p className="truncate text-xs font-medium">Academic-paper.pdf</p>
              </div>
              <PassageLines className="mt-4" rows={4} highlight={[1]} />
            </Stage>
          </RevealItem>

          <RevealItem>
            <Stage step="02" label="Testly AI">
              <div className="grid h-[74px] place-items-center">
                <motion.div
                  animate={{ scale: [1, 1.07, 1] }}
                  transition={{ duration: 2.6, repeat: Infinity }}
                  className="grid h-12 w-12 place-items-center rounded-xl border border-indigo/25 bg-surface"
                >
                  <TestlyMark className="h-6 w-6" />
                </motion.div>
              </div>
              <p className="text-center text-[11px] text-muted-foreground">Concepts → structure</p>
            </Stage>
          </RevealItem>

          <RevealItem>
            <Stage step="03" label="Questions">
              <div className="space-y-1.5">
                {["Question 01", "Question 02", "Question 03"].map((q) => (
                  <div
                    key={q}
                    className="rounded-lg border border-hairline bg-surface px-2.5 py-2 text-[11px] font-medium"
                  >
                    {q}
                  </div>
                ))}
              </div>
            </Stage>
          </RevealItem>

          <RevealItem>
            <Stage step="04" label="Assessment">
              <div className="flex flex-wrap gap-1.5">
                <LabelChip tone="navy">SAT</LabelChip>
                <LabelChip tone="indigo">IELTS</LabelChip>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-indigo/10 px-2.5 py-2 text-[11px] font-medium text-indigo">
                <span aria-hidden>✓</span> Ready to practice
              </div>
            </Stage>
          </RevealItem>
        </RevealGroup>

        <Reveal delay={0.1}>
          <div className="relative mt-6 hidden h-px w-full bg-hairline md:block">
            <motion.span
              className="absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-indigo"
              animate={{ left: ["4%", "96%"] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stage({
  step,
  label,
  children,
}: {
  step: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="paper-card group h-full p-4 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
          {step}
        </span>
        <span className="eyebrow text-navy dark:text-foreground">{label}</span>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
