import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { TestlyLogo } from "@/components/brand/testly-mark";
import { Beam, Stars } from "@/components/home/backdrop";
import { HomeShell } from "@/components/home/theme";
import { Container, EASE } from "@/components/home/ui";
import { WaitlistForm } from "@/components/home/waitlist";
import { WAITLIST_ROLES, type WaitlistRole } from "@/lib/validation";

const TITLE = "Join the waitlist — Testly";
const DESC =
  "Become an early Testly partner. Tell us about your center, school or platform and our team will reach out personally.";

export const Route = createFileRoute("/waitlist")({
  validateSearch: (search: Record<string, unknown>): { role?: WaitlistRole } => {
    const role = search["role"];
    return typeof role === "string" && (WAITLIST_ROLES as readonly string[]).includes(role)
      ? { role: role as WaitlistRole }
      : {};
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: WaitlistPage,
});

/*
 * The waitlist page: a framed image — paper exams turning into Testly
 * questions — with the sign-up card resting on its lower edge.
 */
function WaitlistPage() {
  const { role } = Route.useSearch();
  const reduce = useReducedMotion();

  return (
    <HomeShell>
      <div className="relative isolate overflow-hidden">
        <Beam className="-z-10 opacity-60" />
        <Stars className="-z-10" count={70} seed={41} />

        {/* Top bar */}
        <header>
          <Container className="flex h-20 items-center justify-between">
            <Link
              to="/"
              className="group inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] pl-3 pr-4 text-sm text-snow/85 backdrop-blur transition-colors hover:border-white/25 hover:text-snow"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Back to home
            </Link>
            <Link to="/" aria-label="Testly home">
              <TestlyLogo tone="dark" />
            </Link>
          </Container>
        </header>

        <main className="pb-24">
          <Container>
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mx-auto mt-6 max-w-2xl text-center sm:mt-10"
            >
              <p className="mono-label text-[11px] text-violet-soft">Early access</p>
              <h1 className="font-display mt-4 text-[2.25rem] leading-[1.05] text-snow sm:text-[3.25rem]">
                From paper to <span className="text-violet-gradient">Testly.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-mist">
                Join the waitlist to become an early partner. We reach out to every applicant
                personally.
              </p>
            </motion.div>

            {/* Framed image */}
            <motion.figure
              initial={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="relative mx-auto mt-10 max-w-[1040px] sm:mt-12"
            >
              <div
                aria-hidden
                className="absolute -inset-x-10 -bottom-10 top-1/3 -z-10 rounded-[50%] bg-[radial-gradient(closest-side,rgb(121_82_246/0.35),transparent)] blur-2xl"
              />
              <div className="overflow-hidden rounded-[28px] border border-white/10 shadow-[0_40px_100px_-40px_rgb(0_0_0/0.9)]">
                <img
                  src="/landing/waitlist-hero.jpg"
                  alt="A stack of paper exams turning into Testly questions on a laptop, linked by a beam of violet light"
                  className="block aspect-[1376/768] w-full object-cover"
                />
              </div>
            </motion.figure>

            {/* Sign-up card, resting on the image's lower edge */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
              className="relative z-10 mx-auto mt-10 max-w-[680px] rounded-[28px] border border-white/10 bg-ink-2/90 shadow-[0_40px_100px_-30px_rgb(0_0_0/0.85),0_0_0_1px_rgb(155_122_255/0.08)] backdrop-blur-xl sm:mt-14"
            >
              <div
                aria-hidden
                className="absolute inset-x-[18%] top-0 h-px bg-gradient-to-r from-transparent via-violet-soft/80 to-transparent"
              />
              <WaitlistForm preset={role ?? null} />
            </motion.div>

            <p className="mt-10 text-center text-xs text-mist/70">
              © {new Date().getFullYear()} Testly
            </p>
          </Container>
        </main>
      </div>
    </HomeShell>
  );
}
