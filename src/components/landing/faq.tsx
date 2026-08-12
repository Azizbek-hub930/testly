import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Reveal } from "@/components/site/reveal";

const FAQS: [string, string][] = [
  [
    "What is Testly?",
    "Testly is an AI-powered assessment engine. It turns source material into original SAT and IELTS practice questions that are ready to use.",
  ],
  [
    "How does the AI work?",
    "Specialized agents divide the work: one researches and organizes material, one writes exam-aligned questions, and one validates structure, difficulty, and similarity.",
  ],
  [
    "Can Testly create SAT questions?",
    "Yes. Reading & Writing and Math, mapped to the official domains such as Information & Ideas, Craft & Structure, Algebra, and Advanced Math.",
  ],
  [
    "Can Testly create IELTS questions?",
    "Yes. Reading, Listening, Writing, and Speaking, including question types like Matching Headings and True / False / Not Given.",
  ],
  [
    "Who is Testly for?",
    "Learning centers, tutors, schools, educational organizations, and assessment teams who need original practice material at volume.",
  ],
  [
    "Can learning centers use Testly?",
    "Yes — centers are our first focus. Teams can generate, review, and reuse assessments from their own shared sources.",
  ],
  [
    "How does Testly check generated questions?",
    "Every question passes a quality agent that scores exam alignment, answer validity, difficulty balance, and similarity to existing items.",
  ],
  [
    "How can I join early access?",
    "Request access from the early access form. We're onboarding organizations in small groups.",
  ],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <Reveal>
            <p className="eyebrow text-muted-foreground">FAQ</p>
            <h2 className="display mt-4 text-3xl sm:text-5xl">
              Questions,
              <br />
              answered.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border-t border-border">
              {FAQS.map(([q, a], i) => {
                const isOpen = open === i;
                return (
                  <div key={q} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left"
                    >
                      <span className="text-sm font-medium sm:text-base">{q}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 135 : 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
                          <path
                            d="M12 5v14M5 12h14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-prose pb-6 pr-10 text-sm leading-relaxed text-muted-foreground">
                            {a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
