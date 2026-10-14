import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

import { TestlyMark } from "@/components/brand/testly-mark";
import { Container, Reveal } from "@/components/home/ui";
import { cn } from "@/lib/utils";

/*
 * The problem, told the way the promo video tells it: the scattered files
 * of a manual mock-exam workflow get pulled together into one clean page.
 *
 * Desktop: a short scroll-linked scene. Mobile and reduced motion: a static
 * before/after layout with the same content.
 */

interface FileCard {
  name: string;
  meta: string;
  kind: "PDF" | "MP3" | "DOC" | "XLS" | "TXT";
  detail?: string;
  /** Start offset from centre, in px at the 1240px layout. */
  x: number;
  y: number;
  r: number;
}

const FILES: FileCard[] = [
  {
    name: "reading_passage_FINAL_v3.pdf",
    meta: "edited 11:48 PM · 12 pages",
    kind: "PDF",
    x: -400,
    y: -190,
    r: -6,
  },
  { name: "listening_section2.mp3", meta: "audio · 07:00", kind: "MP3", x: 400, y: -200, r: 5 },
  {
    name: "answer_key_check.docx",
    meta: "Q1 B · Q2 D · Q3 ??",
    kind: "DOC",
    x: -430,
    y: 150,
    r: 4,
  },
  {
    name: "results_new(1).xlsx",
    meta: "#REF!  ·  6.5  ·  #N/A",
    kind: "XLS",
    x: 30,
    y: 250,
    r: -3,
  },
  {
    name: "40 questions × by hand",
    meta: "|||| |||| |||| |||| ||||",
    kind: "TXT",
    x: 420,
    y: 160,
    r: -5,
  },
];

const KIND_STYLE: Record<FileCard["kind"], string> = {
  PDF: "bg-[#ffe1dc] text-[#d6453a]",
  MP3: "bg-[#ece6ff] text-[#6a45ea]",
  DOC: "bg-[#dfeaff] text-[#2f62d9]",
  XLS: "bg-[#dcf5e7] text-[#1f8a54]",
  TXT: "bg-[#fff1cf] text-[#a5700f]",
};

const PAINS = [
  "Hunting for passages across PDFs and websites",
  "Retyping every question and answer choice",
  "Fixing formatting, checking difficulty, re-checking keys",
  "Finding the mistake after students already sat the test",
];

export function Problem() {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="problem-title" className="relative">
      <h2 id="problem-title" className="sr-only">
        The manual mock-exam workflow
      </h2>
      {reduce ? <StaticScene /> : null}
      <div className={cn(reduce ? "hidden" : "hidden md:block")}>
        <ScrollScene />
      </div>
      <div className={cn(reduce ? "hidden" : "md:hidden")}>
        <StaticScene />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Scroll-linked: the scene is pinned for a short stretch and every step is
 * tied to scroll position, so it moves exactly as fast as the visitor
 * scrolls. It begins as the section rises into view (not only once pinned),
 * so the files are already arriving by the time the headline is centred.
 */
function ScrollScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start 0.4", "end end"] });

  // Act 1 (0 → .38): files fly in, the stamp lands · Act 2 (.38 → .62): pulled together
  // Act 3 (.58 → .8): one clean page
  const introOpacity = useTransform(p, [0, 0.1, 0.42, 0.5], [0, 1, 1, 0]);
  const introY = useTransform(p, [0.42, 0.5], [0, -40]);
  const stampScale = useTransform(p, [0.24, 0.32], [1.7, 1]);
  const stampOpacity = useTransform(p, [0.24, 0.29, 0.42, 0.48], [0, 1, 1, 0]);

  const pageOpacity = useTransform(p, [0.58, 0.7], [0, 1]);
  const pageScale = useTransform(p, [0.58, 0.74], [0.6, 1]);
  const pageRotate = useTransform(p, [0.58, 0.78], [-8, -2]);
  const outroOpacity = useTransform(p, [0.64, 0.76], [0, 1]);
  const outroY = useTransform(p, [0.64, 0.76], [24, 0]);

  return (
    <div ref={ref} className="relative h-[190vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--ink-3),transparent)]"
        />
        <Container className="relative h-full">
          {/* Act 1 copy */}
          <motion.div
            style={{ opacity: introOpacity, y: introY }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center"
          >
            <p className="font-display text-[2.75rem] leading-tight text-snow lg:text-[3.75rem]">
              Every mock exam means…
            </p>
            <motion.p
              style={{ scale: stampScale, opacity: stampOpacity, rotate: -4 }}
              className="font-display mx-auto mt-6 inline-block rounded-xl border-2 border-coral/80 px-5 py-2 text-[1.75rem] text-coral lg:text-[2.25rem]"
            >
              Days of manual work.
            </motion.p>
          </motion.div>

          {/* Files */}
          <div className="absolute left-1/2 top-1/2 origin-center scale-[0.78] lg:scale-100">
            {FILES.map((f, i) => (
              <ScrollFile key={f.name} file={f} index={i} progress={p} />
            ))}
          </div>

          {/* Act 3: one page */}
          <div className="absolute inset-0 grid grid-cols-2 items-center gap-12 lg:gap-20">
            <motion.div style={{ opacity: outroOpacity, y: outroY }} className="justify-self-end">
              <p className="mono-label text-violet-soft">With Testly</p>
              <p className="font-display mt-4 text-[2.75rem] leading-[1.06] text-snow lg:text-[3.75rem]">
                Now it starts
                <br />
                with <span className="text-violet-gradient">one page.</span>
              </p>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-mist">
                Upload a single source. Testly finds the ideas, writes the questions and builds the
                answer key — all in one place.
              </p>
            </motion.div>
            <motion.div
              style={{ opacity: pageOpacity, scale: pageScale, rotate: pageRotate }}
              className="justify-self-start"
            >
              <SourcePage />
            </motion.div>
          </div>
        </Container>
      </div>
    </div>
  );
}

function ScrollFile({
  file,
  index,
  progress,
}: {
  file: FileCard;
  index: number;
  progress: MotionValue<number>;
}) {
  // Enter early with a short stagger, hold, then get pulled to where the page appears.
  const enter = 0.02 + index * 0.03;
  const pullStart = 0.42 + index * 0.015;
  const pullEnd = 0.62;
  const target = { x: 230, y: 0 };

  const opacity = useTransform(
    progress,
    [enter, enter + 0.07, pullEnd - 0.05, pullEnd],
    [0, 1, 1, 0],
  );
  const x = useTransform(
    progress,
    [enter, enter + 0.1, pullStart, pullEnd],
    [file.x * 1.3, file.x, file.x, target.x],
  );
  const y = useTransform(
    progress,
    [enter, enter + 0.1, pullStart, pullEnd],
    [file.y * 1.3, file.y, file.y, target.y],
  );
  const rotate = useTransform(
    progress,
    [enter, enter + 0.1, pullStart, pullEnd],
    [file.r * 2, file.r, file.r, 0],
  );
  const scale = useTransform(progress, [pullStart, pullEnd], [1, 0.45]);

  return (
    <motion.div
      style={{ x, y, rotate, scale, opacity }}
      className="absolute -ml-[130px] -mt-[38px]"
    >
      <FileChip file={file} />
    </motion.div>
  );
}

/** Every file card is the same size — 260 × 76 — so the composition stays even. */
function FileChip({ file, className }: { file: FileCard; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[76px] w-[260px] items-center gap-3 rounded-2xl border border-black/5 bg-[#eceef6] px-3.5 text-[#1b2140] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.85),inset_0_1px_0_rgb(255_255_255/0.9)]",
        className,
      )}
    >
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg font-mono text-[10px] font-bold",
          KIND_STYLE[file.kind],
        )}
      >
        {file.kind}
      </span>
      <div className="min-w-0">
        <p className="truncate font-mono text-[12px] font-medium">{file.name}</p>
        <p
          className={cn(
            "mt-1 truncate font-mono text-[11px]",
            file.kind === "DOC" || file.kind === "XLS" ? "text-[#d6453a]" : "text-[#6b7290]",
          )}
        >
          {file.meta}
        </p>
      </div>
    </div>
  );
}

/** The single, clean source page. */
function SourcePage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-[300px] rounded-2xl border border-white/10 bg-[#f4f5fb] p-5 text-[#1b2140] shadow-[0_40px_90px_-30px_rgb(121_82_246/0.8),0_0_0_1px_rgb(155_122_255/0.35)]",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <TestlyMark className="h-7 w-7" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold">Academic-paper.pdf</p>
          <p className="truncate text-[11px] text-[#6b7290]">Urban Ecosystems and Climate</p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {[100, 92, 96, 70, 100, 84, 90, 58].map((w, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full",
              i % 3 === 1 ? "bg-[#9b7aff]/55" : "bg-[#1b2140]/12",
            )}
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {["climate adaptation", "biodiversity", "urban planning"].map((c) => (
          <span
            key={c}
            className="rounded-full bg-[#ece6ff] px-2 py-0.5 text-[10px] font-medium text-[#6a45ea]"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StaticScene() {
  return (
    <div className="py-20 sm:py-28">
      <Container>
        <Reveal className="text-center">
          <p className="font-display text-[2rem] leading-tight text-snow sm:text-[2.75rem]">
            Every mock exam means…
          </p>
          <p className="font-display mx-auto mt-4 inline-block -rotate-3 rounded-xl border-2 border-coral/80 px-4 py-1.5 text-xl text-coral sm:text-2xl">
            Days of manual work.
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mx-auto mt-10 grid max-w-[560px] justify-items-center gap-3 sm:grid-cols-2"
        >
          {FILES.slice(0, 4).map((f, i) => (
            <FileChip key={f.name} file={f} className={i % 2 ? "rotate-2" : "-rotate-2"} />
          ))}
        </Reveal>

        <ul className="mx-auto mt-10 max-w-md space-y-2 text-sm text-mist">
          {PAINS.map((p) => (
            <li key={p} className="flex gap-3">
              <span aria-hidden className="mt-2 h-1 w-3 shrink-0 rounded-full bg-coral/70" />
              {p}
            </li>
          ))}
        </ul>

        <Reveal className="mt-16 flex flex-col items-center text-center">
          <p className="mono-label text-violet-soft">With Testly</p>
          <p className="font-display mt-3 text-[2rem] leading-tight text-snow sm:text-[2.75rem]">
            Now it starts with <span className="text-violet-gradient">one page.</span>
          </p>
          <SourcePage className="mt-8 -rotate-2" />
        </Reveal>
      </Container>
    </div>
  );
}
