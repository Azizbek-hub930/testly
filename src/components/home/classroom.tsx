import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Play, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { Container, EASE, SectionTitle } from "@/components/home/ui";
import { cn } from "@/lib/utils";

/*
 * Run a mock with a whole room: join code → everyone starts → objective
 * sections graded automatically.
 *
 * NOTE: classroom delivery and auto-grading are on the roadmap, not in the
 * product yet, so this section is labelled "Coming next". Remove the label
 * (and this note) when the feature ships.
 */

const STUDENTS = [
  { name: "Ali K.", l: "7.5", r: "7.0" },
  { name: "Madina T.", l: "6.5", r: "7.0" },
  { name: "Damirbek X.", l: "7.0", r: "8.0" },
  { name: "Aziza R.", l: "6.5", r: "5.5" },
  { name: "Jasur M.", l: "7.0", r: "6.0" },
  { name: "Nilufar S.", l: "7.0", r: "7.0" },
  { name: "Bekzod A.", l: "5.5", r: "6.5" },
  { name: "Sevara N.", l: "8.0", r: "7.5" },
  { name: "Timur O.", l: "7.5", r: "6.0" },
  { name: "Kamila Y.", l: "5.5", r: "7.0" },
  { name: "Sardor B.", l: "7.0", r: "7.5" },
  { name: "Dilnoza H.", l: "6.5", r: "7.5" },
];

type RoomState = "waiting" | "running" | "graded";
const ORDER: RoomState[] = ["waiting", "running", "graded"];
const DURATION: Record<RoomState, number> = { waiting: 1300, running: 1900, graded: 2600 };

export function Classroom() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [state, setState] = useState<RoomState>("waiting");

  useEffect(() => {
    if (reduce) {
      setState("graded");
      return;
    }
    if (!inView) return;
    const t = setTimeout(() => {
      const next = ORDER[(ORDER.indexOf(state) + 1) % ORDER.length] ?? "waiting";
      setState(next);
    }, DURATION[state]);
    return () => clearTimeout(t);
  }, [inView, reduce, state]);

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <SectionTitle
          eyebrow={
            <>
              Run it with the whole room
              <span className="ml-1 rounded-full border border-violet-soft/40 bg-violet/15 px-2 py-0.5 text-[9px] tracking-[0.12em] text-[var(--chip-text)]">
                Coming next
              </span>
            </>
          }
          title={
            <>
              One code. <span className="text-violet-gradient">The whole room starts.</span>
            </>
          }
          sub="Share a join code, start the mock for everyone at once, and get objective sections scored the moment students submit."
        />

        <div ref={ref} className="relative mt-14">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {STUDENTS.map((s, i) => (
              <StudentTile key={s.name} student={s} index={i} state={state} />
            ))}
          </div>

          {/* Join code card */}
          <AnimatePresence>
            {state === "waiting" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
                transition={{ duration: 0.45, ease: EASE }}
                className="absolute inset-0 grid place-items-center px-2"
              >
                <div className="w-full max-w-[380px] rounded-[22px] border border-white/10 bg-[#f4f5fb] p-5 text-[#1b2140] shadow-[0_40px_90px_-30px_rgb(121_82_246/0.9)]">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[11px] font-semibold tracking-[0.12em]">
                      IELTS MOCK #023
                    </p>
                    <span className="rounded-full bg-[#fff1cf] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#a5700f]">
                      ● WAITING
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-[13px]">
                      <Users className="h-4 w-4 text-[#6b7290]" /> 24 connected
                    </p>
                    <div className="flex gap-1">
                      {["A", "B", "C", "1", "2", "3"].map((c) => (
                        <span
                          key={c}
                          className="grid h-7 w-6 place-items-center rounded-md bg-[#1b2140]/[0.06] font-mono text-[13px] font-semibold"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 flex h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#8f6dff,#6a45ea)] text-sm font-semibold tracking-wide text-[#fff]">
                    <Play className="h-3.5 w-3.5 fill-white" /> START TEST
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ol
          className="mx-auto mt-8 flex max-w-xl justify-center gap-2 text-xs"
          aria-label="Room states"
        >
          {ORDER.map((s) => (
            <li
              key={s}
              className={cn(
                "rounded-full border px-3 py-1 capitalize transition-colors duration-300",
                s === state
                  ? "border-violet-soft/50 bg-violet/15 text-snow"
                  : "border-white/10 text-mist",
              )}
            >
              {s === "running" ? "In progress" : s === "graded" ? "Auto-graded" : "Waiting"}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function StudentTile({
  student,
  index,
  state,
}: {
  student: (typeof STUDENTS)[number];
  index: number;
  state: RoomState;
}) {
  return (
    <div
      className={cn(
        "glass h-[104px] rounded-2xl p-3.5 transition-[opacity,border-color] duration-500",
        state === "waiting" && "opacity-40",
        index >= 6 && "hidden sm:block",
        index >= 9 && "sm:hidden lg:block",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="flex min-w-0 items-center gap-1.5 truncate text-[13px] font-medium text-snow">
          <TestlyMark tone="dark" className="h-3.5 w-3.5 shrink-0" />
          {student.name}
        </p>
        <span className="font-mono text-[10px] text-mist">
          {state === "waiting" ? "--:--" : "59:59"}
        </span>
      </div>

      <div className="mt-3 h-[42px]">
        <AnimatePresence mode="wait" initial={false}>
          {state === "graded" ? (
            <motion.div
              key="graded"
              initial={{ opacity: 0, rotateX: -70 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, delay: index * 0.06, ease: EASE }}
              className="flex items-end gap-4"
            >
              <Score label="Listening" value={student.l} />
              <Score label="Reading" value={student.r} />
            </motion.div>
          ) : (
            <motion.div key="bars" exit={{ opacity: 0 }} className="space-y-2 pt-1">
              {[0, 1].map((k) => (
                <div key={k} className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet to-violet-soft"
                    initial={false}
                    animate={{
                      width: state === "running" ? `${55 + ((index * 17 + k * 23) % 40)}%` : "0%",
                    }}
                    transition={{ duration: 1.5, delay: index * 0.025, ease: "easeOut" }}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p
        className={cn(
          "mt-1 flex items-center gap-1.5 text-[10px] transition-colors",
          state === "graded"
            ? "text-[#5ee0a0]"
            : state === "running"
              ? "text-violet-soft"
              : "text-mist",
        )}
      >
        <span className="h-1 w-1 rounded-full bg-current" />
        {state === "graded" ? "Auto-graded" : state === "running" ? "In progress" : "Waiting"}
      </p>
    </div>
  );
}

function Score({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-mist">{label}</p>
      <p className="font-display text-xl leading-none text-snow">{value}</p>
    </div>
  );
}
