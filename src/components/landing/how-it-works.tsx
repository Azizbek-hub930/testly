import { motion } from "motion/react";

import { AnnotationArrow, PassageLines, Sticker } from "@/components/site/paper";
import { RevealGroup, RevealItem } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { TestlyMark } from "@/components/brand/testly-mark";

const STEPS = [
  {
    n: "01",
    title: "Upload",
    text: "Upload a paper or source.",
  },
  {
    n: "02",
    title: "Generate",
    text: "Choose exam and question settings.",
  },
  {
    n: "03",
    title: "Practice",
    text: "Get a ready-to-use assessment.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 page-texture opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_50%,black,transparent)]"
      />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                Three steps.
                <br />
                No test writing.
              </>
            }
          />
          <div className="hidden items-end gap-3 lg:flex">
            <p className="hand text-xl text-navy dark:text-foreground">start here</p>
            <AnnotationArrow className="mb-1" />
          </div>
        </div>

        <div className="relative mt-16">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-9 hidden h-px bg-hairline md:block"
          >
            <motion.span
              className="absolute -top-[3px] h-1.5 w-1.5 rounded-full bg-indigo"
              initial={{ left: "0%" }}
              whileInView={{ left: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <RevealGroup className="grid gap-8 md:grid-cols-3 md:gap-6">
            {STEPS.map((s, i) => (
              <RevealItem key={s.n}>
                <div className="relative">
                  <span className="display block text-[3.4rem] leading-none text-indigo/25 sm:text-[4.2rem]">
                    {s.n}
                  </span>
                  <h3 className="display mt-4 text-2xl">{s.title}</h3>
                  <p className="mt-2 max-w-[24ch] text-sm text-muted-foreground">{s.text}</p>

                  <div className="paper-card mt-6 p-4">
                    {i === 0 ? (
                      <>
                        <p className="text-[11px] font-medium">Academic-paper.pdf</p>
                        <PassageLines className="mt-3" rows={3} highlight={[1]} />
                      </>
                    ) : null}
                    {i === 1 ? (
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        {["SAT", "Reading & Writing", "Medium", "27"].map((c) => (
                          <span
                            key={c}
                            className="rounded-md border border-hairline px-2 py-1 text-muted-foreground"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {i === 2 ? (
                      <div className="flex items-center gap-2">
                        <TestlyMark className="h-4 w-4" />
                        <p className="text-[11px] font-medium">
                          27 questions · <span className="text-indigo">ready</span>
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {i === 2 ? (
                    <Sticker
                      className="absolute -right-3 -top-4 hidden px-2.5 py-1.5 lg:block"
                      tilt={6}
                      delay={0.5}
                    >
                      <p className="hand text-base text-indigo">nice.</p>
                    </Sticker>
                  ) : null}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
