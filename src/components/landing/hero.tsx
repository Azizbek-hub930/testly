import { motion } from "motion/react";

import { AiEngine } from "@/components/landing/ai-engine";
import { TestlyLogo, TestlyMark } from "@/components/brand/testly-mark";
import { Cta } from "@/components/site/cta";
import { LabelChip } from "@/components/site/paper";
import { Reveal } from "@/components/site/reveal";
import {
  ArrowCurve,
  ArrowLoop,
  DocGlyph,
  SparkGraph,
  Sparkle,
  Underline,
} from "@/components/site/sticker-glyphs";
import { FloatingSticker, StickerLayer, StickerMeta } from "@/components/site/sticker-system";

export function Hero() {
  return (
    <section className="relative pt-28 sm:pt-36">
      {/* Background washes: clipped in their own layer, never clipping stickers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[680px] hairline-grid opacity-[0.45] [mask-image:radial-gradient(75%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute inset-x-0 top-0 h-[680px] page-texture opacity-70 [mask-image:radial-gradient(70%_55%_at_50%_10%,black,transparent)]" />
        <div className="absolute inset-x-0 top-[120px] h-[600px] faint-rules opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_30%,black,transparent)]" />
        <div className="absolute left-1/2 top-[-150px] h-[440px] w-[760px] -translate-x-1/2 rounded-full bg-indigo/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* ---------- Sticker composition: back / mid / front ---------- */}
        <StickerLayer z="z-0">
          <FloatingSticker
            x={0}
            y={40}
            tilt={-4}
            depth="back"
            delay={0.5}
            drift={5}
            period={13}
            visible="xl"
            variant="bare"
            className="opacity-[0.55]"
          >
            <SparkGraph delay={0.9} className="h-16 w-40" />
          </FloatingSticker>
        </StickerLayer>

        <StickerLayer z="z-20">
          {/* Logo sticker — upper left */}
          <FloatingSticker
            x={0.5}
            y="8px"
            tilt={-4}
            depth="mid"
            delay={0.1}
            drift={7}
            period={10}
            visible="lg"
          >
            <TestlyLogo compact />
          </FloatingSticker>

          {/* Practice loop — upper right */}
          <FloatingSticker
            x={0.5}
            y="0px"
            from="right"
            tilt={3}
            depth="mid"
            delay={0.24}
            drift={6}
            period={11}
            visible="lg"
            width={190}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] font-semibold leading-tight tracking-tight">
                Practice.
                <br />
                Analyze.
                <br />
                <span className="text-indigo">Improve.</span>
              </p>
              <ArrowLoop delay={0.5} />
            </div>
          </FloatingSticker>

          {/* Source flow — left, mid height */}
          <FloatingSticker
            x={0}
            y="290px"
            tilt={-2}
            depth="front"
            delay={0.4}
            drift={8}
            period={12}
            visible="lg"
          >
            <p className="hand text-lg leading-6 text-navy dark:text-foreground">
              Source
              <br />
              <span className="text-indigo">↓</span> Questions
              <br />
              <span className="text-indigo">↓</span> Practice
            </p>
          </FloatingSticker>

          {/* Source file — left, below the flow note */}
          <FloatingSticker
            x={3}
            y="404px"
            tilt={2.5}
            depth="front"
            delay={0.62}
            drift={6}
            period={9}
            visible="xl"
            variant="torn"
          >
            <div className="flex items-center gap-2 pr-2">
              <DocGlyph />
              <p className="font-mono text-[10px] uppercase tracking-[0.12em]">
                Academic paper.pdf
              </p>
            </div>
          </FloatingSticker>

          {/* IELTS — right, mid height */}
          <FloatingSticker
            x={0}
            y="316px"
            from="right"
            tilt={4}
            depth="front"
            delay={0.52}
            drift={7}
            period={10}
            visible="lg"
            variant="chip"
          >
            <p className="text-[11px] font-semibold">IELTS</p>
            <StickerMeta className="mt-0.5">Reading · 40 Q</StickerMeta>
          </FloatingSticker>

          {/* AI status — right, tucked under IELTS */}
          <FloatingSticker
            x={4}
            y="404px"
            from="right"
            tilt={-3}
            depth="mid"
            delay={0.72}
            drift={5}
            period={13}
            visible="xl"
            variant="label"
          >
            <span className="flex items-center gap-1.5">
              <Sparkle className="h-2.5 w-2.5 text-indigo-soft" /> AI analyzing…
            </span>
          </FloatingSticker>
        </StickerLayer>

        <div className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo/25 bg-indigo/8 px-3 py-1.5 text-indigo eyebrow">
                <Sparkle className="h-3 w-3" /> AI assessment engine
              </span>
            </Reveal>

            <Reveal delay={0.08} blur>
              <h1 className="display mt-7 text-[2.7rem] sm:text-6xl lg:text-[4.4rem]">
                Turn source material
                <br />
                into{" "}
                <span className="relative inline-block text-indigo">
                  better tests.
                  <Underline
                    delay={1}
                    className="absolute -bottom-1.5 left-0 h-2.5 w-full sm:-bottom-2 sm:h-3"
                  />
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
                Generate structured SAT and IELTS practice from source material with specialized AI
                agents.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Cta size="lg" className="w-full sm:w-auto" asChild>
                  <a href="#early-access">
                    Get Early Access <span aria-hidden>→</span>
                  </a>
                </Cta>
                <Cta size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <a href="#how-it-works">
                    Explore Testly <span aria-hidden>↓</span>
                  </a>
                </Cta>
              </div>
            </Reveal>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 44, scale: 0.98, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto mt-16 max-w-4xl sm:mt-20"
          >
            <AiEngine />

            {/* Stickers pinned to the engine card */}
            <StickerLayer z="z-20" maxWidth={1320}>
              <FloatingSticker
                x={1}
                y="100%"
                tilt={-5}
                depth="front"
                delay={0.8}
                drift={7}
                period={11}
                visible="lg"
                className="-translate-y-1/2"
                variant="chip"
              >
                <div className="flex items-center gap-2">
                  <TestlyMark className="h-4 w-4" />
                  <p className="text-[11px] font-semibold">
                    Question generated <span className="text-indigo">✓</span>
                  </p>
                </div>
              </FloatingSticker>

              <FloatingSticker
                x={1}
                y="100%"
                from="right"
                tilt={4}
                depth="front"
                delay={0.95}
                drift={6}
                period={9}
                visible="lg"
                className="-translate-y-1/3"
                variant="chip"
              >
                <LabelChip tone="navy">SAT</LabelChip>
                <StickerMeta className="mt-1.5">27 Questions</StickerMeta>
              </FloatingSticker>

              <FloatingSticker
                x={12}
                y="-9%"
                from="right"
                tilt={0}
                depth="front"
                delay={1.1}
                drift={5}
                period={12}
                visible="xl"
                variant="bare"
              >
                <ArrowCurve delay={1.2} className="-scale-x-100" />
              </FloatingSticker>
            </StickerLayer>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
