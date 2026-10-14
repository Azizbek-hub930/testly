import { motion } from "motion/react";
import { Building2, GraduationCap, Landmark, Rocket } from "lucide-react";
import type { ReactNode } from "react";

import { Button, Container, EASE, SectionTitle, Tick } from "@/components/home/ui";
import { WaitlistLink } from "@/components/home/waitlist";
import type { WaitlistRole } from "@/lib/validation";
import { cn } from "@/lib/utils";

/*
 * Who Testly is for. There is no public pricing yet: each card ends in a
 * waitlist slot that opens the form pre-set to that audience, and the team
 * follows up with every applicant personally.
 */

interface AudienceCard {
  id: string;
  name: string;
  tagline: string;
  icon: ReactNode;
  points: string[];
  role: WaitlistRole;
  featured?: boolean;
}

const AUDIENCES: AudienceCard[] = [
  {
    id: "tutors",
    name: "Private tutors",
    tagline: "One teacher, many students",
    icon: <GraduationCap className="h-5 w-5" />,
    points: [
      "A practice set for each student's weak spots",
      "SAT and IELTS formats ready to go",
      "Every question editable before you share it",
    ],
    role: "Private tutor",
  },
  {
    id: "startups",
    name: "Web host startups",
    tagline: "Platforms that host tests online",
    icon: <Rocket className="h-5 w-5" />,
    points: [
      "Fresh exam-style content for your platform",
      "Structured questions with answer keys",
      "Talk to us about volume and integration",
    ],
    role: "Web host startup",
  },
  {
    id: "centers",
    name: "Learning centers",
    tagline: "Mock exams every week, for every group",
    icon: <Building2 className="h-5 w-5" />,
    points: [
      "Weekly mocks without the copy-paste",
      "The same exam structure across all teachers",
      "Quality-checked before your review",
    ],
    role: "Learning center",
    featured: true,
  },
  {
    id: "schools",
    name: "Schools & institutions",
    tagline: "Recurring assessments at scale",
    icon: <Landmark className="h-5 w-5" />,
    points: [
      "Assessments across classes and departments",
      "A standard structure every time",
      "Custom formats shaped with our team",
    ],
    role: "School or institution",
  },
];

export function Audience() {
  return (
    <section id="audience" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container>
        <SectionTitle
          eyebrow="Who it's for"
          title={
            <>
              Made for the people who <span className="text-violet-gradient">build the tests.</span>
            </>
          }
          sub="We're onboarding early partners personally. Join the waitlist for your type of team and we'll reach out to shape Testly around how you work."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a, i) => (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
              className={cn(
                "glass group relative flex flex-col rounded-[24px] p-6 transition-transform duration-300 hover:-translate-y-1",
                a.featured && "border-violet-soft/25",
              )}
            >
              {a.featured && <span aria-hidden className="glow-ring" />}
              {a.featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-[linear-gradient(180deg,#8f6dff,#6a45ea)] px-3 py-1 text-[11px] font-semibold text-[#fff] shadow-[0_8px_20px_-6px_rgb(121_82_246/0.9)]">
                  Main focus
                </span>
              )}
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-xl border transition-colors duration-300",
                  a.featured
                    ? "border-violet-soft/50 bg-violet/25 text-[var(--chip-text)]"
                    : "border-white/10 bg-white/[0.04] text-mist group-hover:border-violet-soft/40 group-hover:text-[var(--chip-text)]",
                )}
              >
                {a.icon}
              </span>
              <p className="mt-5 text-lg font-semibold text-snow">{a.name}</p>
              <p className="text-sm text-violet-soft">{a.tagline}</p>

              <ul className="mt-5 flex-1 space-y-3 border-t border-white/[0.07] pt-5">
                {a.points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm leading-snug text-snow/85">
                    <Tick className="mt-0.5 h-4 w-4 shrink-0 text-violet-soft" />
                    {p}
                  </li>
                ))}
              </ul>

              {/* Where a price tag would sit: a waitlist slot instead */}
              <div className="mt-6 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-4">
                <p className="mono-label text-[10px] text-mist">Early-partner access</p>
                <p className="mt-1 text-sm text-snow/90">
                  Personal onboarding · pricing on request
                </p>
                <Button variant={a.featured ? "violet" : "glass"} className="mt-4 w-full" asChild>
                  <WaitlistLink role={a.role}>
                    Join the waitlist <span aria-hidden>→</span>
                  </WaitlistLink>
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
