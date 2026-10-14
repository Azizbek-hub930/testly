import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Container, EASE, Reveal, SectionTitle } from "@/components/home/ui";
import { cn } from "@/lib/utils";

const FAQS: [string, string][] = [
  [
    "What is Testly?",
    "Testly helps learning centers and tutors build mock exams. You upload source material, choose the exam shape, and specialized AI agents produce a structured assessment with an answer key — ready for you to review and edit.",
  ],
  [
    "Which exams are supported?",
    "Today: SAT Reading and Writing, SAT Math, and IELTS Academic Reading. IELTS Listening and Writing, AP and Milliy formats are on the roadmap.",
  ],
  [
    "Are these official SAT or IELTS questions?",
    "No. Testly writes original, exam-style questions that follow each section's structure. It doesn't reproduce secure official papers, and Testly isn't affiliated with the College Board or IELTS.",
  ],
  [
    "How does the quality check work?",
    "A dedicated quality agent checks structure, numbering, question types and that each answer is keyed and supported by the passage, then flags anything that needs a human look. It's a strong first pass — your review is still the final word.",
  ],
  [
    "Can I edit the questions?",
    "Yes. Every generated question, answer choice and key stays editable before students see it.",
  ],
  [
    "What source material can I use?",
    "PDFs today — articles, textbook chapters, reports. Please only upload material you have the right to use.",
  ],
  [
    "How do I get access?",
    "Join the waitlist — it takes about two minutes. Our team then reaches out to every applicant personally to set up early-partner access.",
  ],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-20 py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-20">
        <SectionTitle
          align="left"
          eyebrow="FAQ"
          title="Questions, answered."
          sub="Something missing? Ask us when you request access."
        />
        <Reveal delay={0.1}>
          <div className="space-y-2.5">
            {FAQS.map(([q, a], i) => {
              const isOpen = open === i;
              return (
                <div
                  key={q}
                  className={cn(
                    "rounded-2xl border transition-colors duration-300",
                    isOpen
                      ? "border-violet-soft/30 bg-white/[0.04]"
                      : "border-white/[0.07] bg-white/[0.015]",
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left"
                    >
                      <span className="text-[15px] font-medium text-snow">{q}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors",
                          isOpen
                            ? "border-violet-soft/50 text-violet-soft"
                            : "border-white/10 text-mist",
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </motion.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 pr-14 text-sm leading-relaxed text-mist">{a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
