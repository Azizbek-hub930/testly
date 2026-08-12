import { Cta } from "@/components/site/cta";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

const PLANS = [
  { name: "Plus", price: "$99.90", note: "For individual tutors" },
  { name: "Pro", price: "$349.90", note: "For learning centers", featured: true },
  { name: "Corporate", price: "Custom", note: "For organizations" },
];

export function Pricing() {
  return (
    <section className="py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow text-muted-foreground">Pricing</p>
          <h2 className="display mt-4 max-w-xl text-3xl sm:text-5xl">Simple while we're early.</h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <article
                className={cn(
                  "flex h-full flex-col rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1",
                  p.featured
                    ? "border-indigo/45 bg-indigo/6"
                    : "border-border bg-surface hover:border-indigo/30",
                )}
              >
                <p className="eyebrow text-muted-foreground">{p.name}</p>
                <p className="display mt-6 text-4xl">{p.price}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.note}</p>
                <Cta variant={p.featured ? "accent" : "outline"} className="mt-8 w-full" asChild>
                  <a href="#early-access">
                    Get Early Access <span aria-hidden>→</span>
                  </a>
                </Cta>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
