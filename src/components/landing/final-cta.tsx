import { TestlyMark } from "@/components/brand/testly-mark";
import { Cta } from "@/components/site/cta";
import { Reveal } from "@/components/site/reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-navy py-28 text-white sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo/25 blur-[130px]"
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="inline-grid h-14 w-14 place-items-center rounded-2xl border border-white/12 bg-white/6 float-slow">
            <TestlyMark
              className="h-6 w-6"
              navyClassName="fill-white"
              accentClassName="fill-indigo"
            />
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="display mt-8 text-3xl text-white sm:text-[3.25rem]">
            Build better assessments
            <br />
            with AI.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-5 max-w-md text-sm text-white/55 sm:text-base">
            Testly turns source material into ready-to-use practice.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <Cta size="lg" variant="onDark" className="mt-9" asChild>
            <a href="#early-access">
              Get Early Access <span aria-hidden>→</span>
            </a>
          </Cta>
        </Reveal>
      </div>
    </section>
  );
}
