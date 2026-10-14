import { motion, useReducedMotion } from "motion/react";

import { Beam, Glow, Stars } from "@/components/home/backdrop";
import { GeneratorDemo } from "@/components/home/generator-demo";
import { Button, Container, EASE } from "@/components/home/ui";
import { WaitlistLink } from "@/components/home/waitlist";

/*
 * Hero: promise + CTAs on top, the real generator UI underneath.
 * The product window enters tilted back in 3D and settles flat as the
 * visitor scrolls into it — the one "wow" moment, tied to the product.
 */

const FORMATS = ["SAT Reading & Writing", "SAT Math", "IELTS Academic Reading"];

export function Hero() {
  const reduce = useReducedMotion();

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: EASE },
  });

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      <Beam className="-z-10" />
      <Stars className="-z-10" count={80} />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-ink"
      />

      <Container>
        <div className="mx-auto max-w-[860px] text-center">
          <motion.p
            {...rise(0.05)}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4 text-[13px] text-mist backdrop-blur"
          >
            <span className="rounded-full bg-violet/25 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--chip-text)]">
              Early access
            </span>
            For learning centers &amp; tutors
          </motion.p>

          <motion.h1
            {...rise(0.1)}
            className="font-display mt-7 text-[2.4rem] leading-[1.04] text-snow sm:text-[3.5rem] lg:text-[4.5rem]"
          >
            From source material to{" "}
            <span className="text-violet-gradient whitespace-nowrap">exam‑ready</span> mock tests.
          </motion.h1>

          <motion.p
            {...rise(0.17)}
            className="mx-auto mt-6 max-w-[620px] text-base leading-relaxed text-mist sm:text-lg"
          >
            Testly&rsquo;s AI agents turn your reading material into structured SAT and IELTS-style
            assessments — so your team stops copying, retyping and re-checking, and gets back to
            teaching.
          </motion.p>

          <motion.div
            {...rise(0.24)}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <WaitlistLink>
                Join the waitlist <span aria-hidden>→</span>
              </WaitlistLink>
            </Button>
            <Button size="lg" variant="glass" className="w-full sm:w-auto" asChild>
              <a href="#workflow">See how it works</a>
            </Button>
          </motion.div>

          <motion.ul
            {...rise(0.3)}
            aria-label="Supported formats"
            className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-mist/80"
          >
            {FORMATS.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span aria-hidden className="h-1 w-1 rounded-full bg-violet-soft" />
                {f}
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="relative mx-auto mt-14 max-w-[1080px] sm:mt-20 [perspective:1600px]">
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Glow className="-inset-x-[10%] -bottom-[18%] top-[30%]" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
          >
            <motion.div
              initial={reduce ? false : { rotateX: 20, scale: 0.92 }}
              animate={{ rotateX: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
              style={{ transformOrigin: "50% 0%" }}
              className="relative will-change-transform"
            >
              {/* top-edge light catch */}
              <div
                aria-hidden
                className="absolute inset-x-[12%] -top-px z-10 h-px bg-gradient-to-r from-transparent via-violet-soft/80 to-transparent"
              />
              <GeneratorDemo />
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
