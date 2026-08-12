import { createFileRoute } from "@tanstack/react-router";

import { Agents } from "@/components/landing/agents";
import { Audience } from "@/components/landing/audience";
import { Exams } from "@/components/landing/exams";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PaperToPractice } from "@/components/landing/paper-to-practice";
import { Pricing } from "@/components/landing/pricing";
import { ProductPreview } from "@/components/landing/product-preview";
import { QuestionPreview } from "@/components/landing/question-preview";
import { Waitlist } from "@/components/landing/waitlist";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

const TITLE = "Testly — AI-powered SAT & IELTS assessment generation";
const DESC =
  "Testly transforms source material into original SAT and IELTS practice questions using specialized AI agents.";

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

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <PaperToPractice />
        <HowItWorks />
        <ProductPreview />
        <QuestionPreview />
        <Exams />
        <Agents />
        <Audience />
        <Waitlist />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
