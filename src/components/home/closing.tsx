import { motion, useReducedMotion } from "motion/react";
import { ArrowUp, ArrowUpRight } from "lucide-react";

import { BAR, STEM, TestlyLogo, TestlyMark, WEDGE } from "@/components/brand/testly-mark";
import { Stars } from "@/components/home/backdrop";
import { Button, Container, EASE, Reveal } from "@/components/home/ui";
import { WaitlistLink } from "@/components/home/waitlist";

/** Closing call to action: a spotlight rising from below, like a stage. */
export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden pb-28 pt-24 sm:pb-36 sm:pt-32">
      <Stars className="-z-10" count={40} seed={23} />
      <div
        aria-hidden
        className="absolute bottom-[-30%] left-1/2 -z-10 h-[90%] w-[min(900px,120vw)] -translate-x-1/2 bg-[radial-gradient(50%_60%_at_50%_100%,rgb(155_122_255/0.55),rgb(121_82_246/0.15)_45%,transparent_75%)] blur-xl"
      />
      <div
        aria-hidden
        className="beam-breathe absolute bottom-0 left-1/2 -z-10 h-[75%] w-[180px] -translate-x-1/2 bg-[linear-gradient(0deg,rgb(155_122_255/0.55),rgb(121_82_246/0.15)_60%,transparent)] blur-[36px]"
        style={{ ["--beam-rot" as string]: "0deg" }}
      />
      <Container className="text-center">
        <Reveal>
          <TestlyMark
            tone="dark"
            className="mx-auto h-14 w-14 drop-shadow-[0_0_30px_rgb(155_122_255/0.6)]"
          />
          <h2 className="font-display mx-auto mt-8 max-w-[760px] text-[2.25rem] leading-[1.05] text-snow sm:text-[3.25rem] lg:text-[4rem]">
            Your next mock exam starts with <span className="text-violet-gradient">one page.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-mist sm:text-lg">
            Join the learning centers, tutors and schools shaping Testly as early partners.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <WaitlistLink>
                Join the waitlist <span aria-hidden>→</span>
              </WaitlistLink>
            </Button>
            <Button size="lg" variant="glass" className="w-full sm:w-auto" asChild>
              <a href="/#workflow">See how it works</a>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ================================================================== */
/*  Footer: calm columns on the left, the T mark drawn in light on the */
/*  right — it sketches itself in when the footer scrolls into view.   */
/* ================================================================== */

const FOOTER_COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Product",
    links: [
      ["How it works", "/#workflow"],
      ["Exam formats", "/#exams"],
      ["Who it's for", "/#audience"],
      ["FAQ", "/#faq"],
    ],
  },
  {
    title: "Exams",
    links: [
      ["SAT Reading & Writing", "/#exams"],
      ["SAT Math", "/#exams"],
      ["IELTS Academic Reading", "/#exams"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Join the waitlist", "/waitlist"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

export function HomeFooter() {
  return (
    <footer className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-soft/50 to-transparent"
      />
      <div
        aria-hidden
        className="absolute -right-40 top-1/2 -z-10 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(121_82_246/0.22),transparent)]"
      />

      <Container className="grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <TestlyLogo tone="dark" />
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-mist">
            Exam-ready SAT and IELTS mock tests from a single page of source material — built with
            learning centers, tutors and schools.
          </p>
          <Button className="mt-7" asChild>
            <WaitlistLink>
              Join the waitlist <span aria-hidden>→</span>
            </WaitlistLink>
          </Button>

          <nav aria-label="Footer" className="mt-14 grid grid-cols-2 gap-10 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="mono-label text-[10px] text-violet-soft">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="group inline-flex items-center gap-1 text-sm text-snow/70 transition-colors duration-200 hover:text-snow"
                      >
                        {label}
                        <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <LineMark />
      </Container>

      <div className="border-t border-white/[0.07]">
        <Container className="flex flex-col gap-3 py-6 text-xs text-mist/80 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Testly. All rights reserved.</p>
          <p className="sm:text-center">
            SAT is a trademark of the College Board. IELTS is a registered trademark of its owners.
            Testly is not affiliated with either.
          </p>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center gap-1.5 self-start text-snow/70 transition-colors hover:text-snow sm:self-auto"
          >
            Back to top <ArrowUp className="h-3.5 w-3.5" />
          </a>
        </Container>
      </div>
    </footer>
  );
}

/** The T mark as glowing line art that draws itself, then softly fills. */
function LineMark() {
  const reduce = useReducedMotion();
  const parts = [
    { d: BAR, delay: 0, fill: "url(#lm-fill)" },
    { d: STEM, delay: 0.35, fill: "url(#lm-fill)" },
    { d: WEDGE, delay: 0.7, fill: "var(--violet-soft)" },
  ];
  return (
    <div aria-hidden className="relative mx-auto hidden w-[300px] lg:block">
      <svg
        viewBox="-3 -3 106 114"
        className="w-full overflow-visible drop-shadow-[0_0_18px_rgb(155_122_255/0.45)]"
      >
        <defs>
          <linearGradient id="lm-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--violet-soft)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--violet)" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {parts.map((p) => (
          <motion.path
            key={p.d}
            d={p.d}
            fill={p.fill}
            stroke="var(--violet-soft)"
            strokeWidth="0.7"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0, fillOpacity: 0 }}
            whileInView={{ pathLength: 1, fillOpacity: 1 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{
              pathLength: { duration: 1.1, delay: p.delay, ease: EASE },
              fillOpacity: { duration: 0.6, delay: p.delay + 0.9 },
            }}
          />
        ))}
      </svg>
      <p className="mono-label mt-6 text-center text-[10px] text-mist">
        From one page to exam-ready
      </p>
    </div>
  );
}
