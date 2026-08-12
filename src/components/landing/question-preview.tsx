import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { CheckMark } from "@/components/landing/ai-engine";
import { LabelChip, Sticker } from "@/components/site/paper";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { cn } from "@/lib/utils";

const PASSAGE = `Urban green corridors are often described as infrastructure rather than ornament. By linking fragmented habitats, they allow species to move between parks and riverbanks, while the same shaded routes lower street temperatures during heat waves. Planners therefore treat corridors as a single investment answering two separate pressures.`;

const CHOICES = [
  {
    id: "A",
    text: "Green corridors are valued mainly for their visual contribution to cities.",
  },
  {
    id: "B",
    text: "Green corridors serve ecological and climate functions at the same time.",
  },
  {
    id: "C",
    text: "Planners disagree about whether corridors should connect parks.",
  },
  {
    id: "D",
    text: "Heat waves are the primary reason cities build green corridors.",
  },
];

const CORRECT = "B";

export function QuestionPreview() {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <section id="question" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Question preview"
          title={
            <>
              A real question,
              <br />
              not a <span className="text-indigo">screenshot.</span>
            </>
          }
        />

        <Reveal delay={0.1}>
          <div className="relative mt-14">
            <div className="paper-card paper-raised overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <LabelChip tone="navy">SAT</LabelChip>
                  <span className="text-xs text-muted-foreground">Reading &amp; Writing</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Question 01 / 27
                </span>
              </div>

              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
                <div>
                  <p className="eyebrow text-muted-foreground">Passage</p>
                  <p className="mt-3 text-[0.95rem] leading-7 text-foreground/85">{PASSAGE}</p>
                  <p className="mt-6 text-sm font-semibold">
                    Which choice best states the main idea of the text?
                  </p>
                </div>

                <div className="space-y-2.5">
                  {CHOICES.map((c) => {
                    const isPicked = picked === c.id;
                    const isCorrect = c.id === CORRECT;
                    const revealed = picked !== null;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setPicked(c.id)}
                        aria-pressed={isPicked}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200",
                          !revealed &&
                            "border-border hover:-translate-y-0.5 hover:border-indigo/45 hover:bg-indigo/5",
                          revealed && isCorrect && "border-indigo bg-indigo/8 text-foreground",
                          revealed &&
                            !isCorrect &&
                            (isPicked
                              ? "border-destructive/40 bg-destructive/5 opacity-90"
                              : "border-border opacity-55"),
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[11px] font-semibold",
                            revealed && isCorrect
                              ? "border-indigo bg-indigo text-white"
                              : "border-border text-muted-foreground",
                          )}
                        >
                          {c.id}
                        </span>
                        <span className="min-w-0 flex-1">{c.text}</span>
                      </button>
                    );
                  })}

                  <AnimatePresence>
                    {picked ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 rounded-xl border border-indigo/25 bg-indigo/6 p-4">
                          <p className="flex items-center gap-2 text-sm font-semibold text-indigo">
                            <CheckMark active />
                            {picked === CORRECT ? "Correct" : `Correct answer: ${CORRECT}`}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            The passage presents corridors as a single investment that answers two
                            pressures — habitat connection and street-level cooling — so the main
                            idea combines both functions rather than favoring one.
                          </p>
                          <button
                            type="button"
                            onClick={() => setPicked(null)}
                            className="mt-4 text-xs font-medium text-indigo hover:underline"
                          >
                            Try again
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div aria-hidden className="pointer-events-none hidden lg:block">
              <Sticker className="absolute -left-12 -top-6 px-3 py-2" tilt={-6} delay={0.4}>
                <p className="hand text-lg text-navy dark:text-foreground">
                  pick one <span className="text-indigo">→</span>
                </p>
              </Sticker>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
