import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { Reveal } from "@/components/site/reveal";

/**
 * Shared shell for the short legal pages. Same paper surface as the rest of the
 * site — these are plain documents, so the type does the work.
 */
export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-36 sm:px-8 sm:pb-32 sm:pt-44">
        <Reveal>
          <p className="eyebrow text-indigo">{eyebrow}</p>
          <h1 className="display mt-5 text-[2.1rem] sm:text-[2.75rem]">{title}</h1>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Last updated {updated}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="paper-card mt-12 space-y-8 p-6 sm:p-10">{children}</div>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-10 text-sm text-muted-foreground">
            Questions about this page?{" "}
            <Link to="/" hash="early-access" className="font-medium text-indigo hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}
