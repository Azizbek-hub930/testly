import { createFileRoute } from "@tanstack/react-router";

import { Audience } from "@/components/home/audience";
import { Classroom } from "@/components/home/classroom";
import { FinalCta, HomeFooter } from "@/components/home/closing";
import { Engine } from "@/components/home/engine";
import { Exams } from "@/components/home/exams";
import { Faq } from "@/components/home/faq";
import { Hero } from "@/components/home/hero";
import { HomeNav } from "@/components/home/nav";
import { Partners, Process } from "@/components/home/partners";
import { Problem } from "@/components/home/problem";
import { HomeShell } from "@/components/home/theme";

const TITLE = "Testly — AI mock exams for SAT & IELTS learning centers";
const DESC =
  "Testly turns source material into structured SAT and IELTS-style mock exams with specialized AI agents. Join the waitlist to become an early partner.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Index,
});

/*
 * A product introduction that ends in one action: join the waitlist.
 * Story order mirrors the promo video:
 * promise → partners → the manual mess → the engine → real exam shapes →
 * the whole room (coming next) → who it's for → how joining works → FAQ.
 */
function Index() {
  return (
    <HomeShell>
      <HomeNav />
      <main>
        <Hero />
        <Partners />
        <Problem />
        <Engine />
        <Exams />
        <Classroom />
        <Audience />
        <Process />
        <Faq />
        <FinalCta />
      </main>
      <HomeFooter />
    </HomeShell>
  );
}
