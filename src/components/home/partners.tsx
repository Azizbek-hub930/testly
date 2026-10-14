import { motion, useReducedMotion } from "motion/react";

import { Button, Container, EASE, Reveal, SectionTitle } from "@/components/home/ui";
import { WaitlistLink } from "@/components/home/waitlist";
import { cn } from "@/lib/utils";

/*
 * Early partners, shown as an endless marquee. Logos are the partners' own
 * files (public/partners/), sitting on white plates so their colours stay
 * true. Figures are as published on each partner's website.
 */

interface Partner {
  name: string;
  kind: string;
  /** One or two logo files, rendered side by side (mark + wordmark). */
  logos: { src: string; className: string }[];
  stats: { value: string; label: string }[];
  site: string;
}

const PARTNERS: Partner[] = [
  {
    name: "Registon",
    kind: "Learning center network",
    logos: [{ src: "/partners/registon.png", className: "h-9" }],
    stats: [
      { value: "63+", label: "branches" },
      { value: "36,000+", label: "students" },
    ],
    site: "rgn.uz",
  },
  {
    name: "SAT Makon",
    kind: "SAT, ACT & AP prep platform",
    logos: [
      { src: "/partners/makon-mark.svg", className: "h-8" },
      { src: "/partners/makon-word.svg", className: "h-6" },
    ],
    stats: [
      { value: "50,000+", label: "students" },
      { value: "40+", label: "countries" },
    ],
    site: "makon.ai",
  },
  {
    name: "IELTS Zone",
    kind: "IELTS preparation center",
    logos: [{ src: "/partners/ielts-zone.svg", className: "h-10" }],
    stats: [
      { value: "6", label: "branches" },
      { value: "5,000+", label: "students at 7.0+" },
    ],
    site: "ieltszone.uz",
  },
];

export function Partners() {
  const reduce = useReducedMotion();
  // Enough copies that one track is always wider than the viewport.
  const track = Array.from({ length: 3 }, () => PARTNERS).flat();

  return (
    <section aria-labelledby="partners-title" className="relative py-12 sm:py-16">
      <Container className="text-center">
        <p id="partners-title" className="mono-label text-[11px] text-mist">
          Building Testly with our early partners
        </p>
      </Container>

      <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div
          className={cn("flex w-max", !reduce && "marquee")}
          style={{ ["--marquee-duration" as string]: "48s" }}
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
              className="flex shrink-0 gap-5 pr-5"
            >
              {track.map((p, i) => (
                <li key={`${copy}-${i}`}>
                  <PartnerCard partner={p} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article className="glass flex h-[132px] w-[380px] items-stretch gap-4 rounded-[22px] p-3 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-violet-soft/40">
      <div className="flex w-[148px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#fff] px-3 shadow-[inset_0_-2px_0_rgb(0_0_0/0.06)]">
        {partner.logos.map((l) => (
          <img
            key={l.src}
            src={l.src}
            alt={partner.logos.length === 1 || l === partner.logos[0] ? `${partner.name} logo` : ""}
            loading="lazy"
            className={cn("w-auto max-w-full object-contain", l.className)}
          />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center pr-2">
        <p className="font-display truncate text-lg text-snow">{partner.name}</p>
        <p className="truncate text-xs text-violet-soft">{partner.kind}</p>
        <dl className="mt-3 flex gap-5">
          {partner.stats.map((s) => (
            <div key={s.label} className="min-w-0">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-[17px] leading-none text-snow">{s.value}</dd>
              <dd className="mt-1 truncate text-[11px] text-mist">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */

const STEPS = [
  {
    title: "Join the waitlist",
    body: "Tell us who you are and what you prepare students for. It takes about two minutes.",
  },
  {
    title: "We reach out personally",
    body: "Our team contacts every applicant to understand your exams, groups and workflow.",
  },
  {
    title: "Onboard as an early partner",
    body: "Start building mock exams with Testly and help shape what we build next.",
  },
];

export function Process() {
  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <SectionTitle
          eyebrow="How joining works"
          title={
            <>
              Three steps to <span className="text-violet-gradient">early access.</span>
            </>
          }
        />

        <div className="relative mt-14">
          {/* connector */}
          <div
            aria-hidden
            className="absolute left-[16.6%] right-[16.6%] top-7 hidden h-[2px] bg-white/[0.07] md:block"
          >
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-violet to-violet-soft shadow-[0_0_14px_2px_rgb(155_122_255/0.5)]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "0px 0px -20% 0px" }}
              transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
            />
          </div>

          <ol className="relative grid gap-4 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.08, ease: EASE }}
                className="flex flex-col items-center text-center"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full border border-violet-soft/50 bg-ink font-display text-lg text-snow shadow-[0_0_0_6px_var(--ink),0_0_30px_-4px_rgb(121_82_246/0.8)]">
                  {i + 1}
                </span>
                <p className="mt-6 text-lg font-semibold text-snow">{s.title}</p>
                <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-mist">{s.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        <Reveal className="mt-12 flex justify-center" delay={0.3}>
          <Button size="lg" asChild>
            <WaitlistLink>
              Join the waitlist <span aria-hidden>→</span>
            </WaitlistLink>
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
