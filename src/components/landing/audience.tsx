import { Building2, GraduationCap, School, Users } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";

const AUDIENCE = [
  { icon: GraduationCap, title: "Learning Centers", note: "SAT · IELTS" },
  { icon: Users, title: "Tutors", note: "1:1 practice" },
  { icon: School, title: "Schools", note: "Class sets" },
  { icon: Building2, title: "Educational Organizations", note: "Programs" },
];

export function Audience() {
  return (
    <section id="who" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Who it's for"
          title={
            <>
              Built for people who
              <br />
              <span className="text-indigo">create assessments.</span>
            </>
          }
        />

        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCE.map(({ icon: Icon, title, note }, i) => (
            <RevealItem key={title}>
              <div
                className="paper-card group relative h-full p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo/35"
                style={{ transform: `rotate(${(i % 2 ? 0.5 : -0.5).toFixed(1)}deg)` }}
              >
                <Icon className="h-5 w-5 text-indigo" />
                <h3 className="mt-6 text-base font-semibold leading-snug">{title}</h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {note}
                </p>
                <span className="absolute bottom-4 right-4 hand text-base text-indigo opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  ✓
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
