import { motion } from "motion/react";
import { useState } from "react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

const AGENTS = [
  {
    id: "research",
    name: "Research Agent",
    body: "Finds and organizes source material.",
    meta: [
      ["Sources", "Connected"],
      ["Indexing", "Continuous"],
      ["Status", "Active"],
    ],
  },
  {
    id: "assessment",
    name: "Assessment Agent",
    body: "Creates SAT / IELTS questions.",
    meta: [
      ["Exam", "SAT"],
      ["Status", "Ready"],
      ["Questions", "Generating"],
    ],
  },
  {
    id: "quality",
    name: "Quality Agent",
    body: "Checks structure and similarity.",
    meta: [
      ["Similarity", "0.12"],
      ["Structure", "Valid"],
      ["Status", "Passing"],
    ],
  },
] as const;

export function Agents() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="product" className="scroll-mt-24 bg-navy py-28 text-white sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow text-white/45">The engine</p>
          <h2 className="display mt-4 max-w-2xl text-3xl text-white sm:text-5xl">
            One platform.
            <br />
            <span className="text-indigo-soft">Specialized AI agents.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {AGENTS.map((agent, i) => (
            <Reveal key={agent.id} delay={i * 0.1}>
              <div className="relative">
                {i < AGENTS.length - 1 && (
                  <svg
                    aria-hidden
                    viewBox="0 0 60 6"
                    preserveAspectRatio="none"
                    className="absolute -right-4 top-1/2 hidden h-1.5 w-8 -translate-y-1/2 lg:block"
                  >
                    <line
                      x1="0"
                      y1="3"
                      x2="60"
                      y2="3"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="0"
                      y1="3"
                      x2="60"
                      y2="3"
                      stroke="var(--indigo)"
                      strokeWidth="1.5"
                      className="flowing-line"
                    />
                  </svg>
                )}

                <motion.article
                  onHoverStart={() => setHovered(agent.id)}
                  onHoverEnd={() => setHovered(null)}
                  onFocus={() => setHovered(agent.id)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  animate={{ scale: hovered === agent.id ? 1.02 : 1 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "rounded-2xl border border-white/10 bg-white/4 p-6 outline-none transition-colors duration-300",
                    hovered === agent.id && "border-indigo/50 bg-white/6",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/12 bg-white/6">
                      <span className="absolute inset-0 rounded-xl border border-indigo/40 [animation:testly-pulse-ring_3.4s_ease-out_infinite]" />
                      <TestlyMark
                        className="h-4 w-4"
                        navyClassName="fill-white"
                        accentClassName="fill-indigo"
                      />
                    </span>
                    <h3 className="text-base font-semibold">{agent.name}</h3>
                  </div>

                  <p className="mt-4 text-sm text-white/55">{agent.body}</p>

                  <motion.div
                    initial={false}
                    animate={{
                      height: hovered === agent.id ? "auto" : 0,
                      opacity: hovered === agent.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <dl className="mt-5 space-y-2 rounded-xl border border-white/10 bg-navy/60 p-4">
                      {agent.meta.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3 text-xs">
                          <dt className="text-white/45">{k}</dt>
                          <dd className="font-mono text-indigo-soft">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </motion.div>
                </motion.article>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
