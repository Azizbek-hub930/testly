import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/*
 * Shared motion + UI primitives for the landing page.
 *
 * One easing curve and a small set of durations keep every section moving
 * the same way: elements ~0.4s, section reveals ~0.55s, siblings staggered
 * 80ms, buttons 180ms.
 */

export const EASE = [0.22, 1, 0.36, 1] as const;
export const DUR = { fast: 0.15, base: 0.3, reveal: 0.4, hero: 0.5 } as const;
export const STAGGER = 0.08;

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap outline-none transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] ease-[var(--ease-out-soft)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        violet:
          "bg-[linear-gradient(180deg,#8f6dff_0%,#7952f6_55%,#6640e6_100%)] text-[#fff] shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_0_0_1px_rgb(155_122_255/0.5),0_12px_40px_-10px_rgb(121_82_246/0.75)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.32),0_0_0_1px_rgb(155_122_255/0.7),0_18px_54px_-10px_rgb(121_82_246/0.95)]",
        glass:
          "border border-white/12 bg-white/[0.04] text-snow backdrop-blur-md hover:-translate-y-0.5 hover:border-violet-soft/45 hover:bg-white/[0.07]",
        quiet: "text-mist hover:text-snow",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-5 text-sm",
        lg: "h-[52px] px-7 text-[15px]",
      },
    },
    defaultVariants: { variant: "violet", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

/** Section container: one width, one gutter, everywhere. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1240px] px-4 sm:px-8", className)}>{children}</div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mono-label inline-flex items-center gap-2 text-violet-soft", className)}>
      <span aria-hidden className="h-px w-6 bg-gradient-to-r from-transparent to-violet-soft" />
      {children}
    </p>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  sub,
  align = "center",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="font-display mt-5 text-[2rem] leading-[1.08] text-snow sm:text-[2.75rem] lg:text-[3.25rem]">
        {title}
      </h2>
      {sub ? (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed text-mist sm:text-lg",
            align === "center" && "mx-auto max-w-2xl",
          )}
        >
          {sub}
        </p>
      ) : null}
    </Reveal>
  );
}

/** Fade + rise once when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0.2 : DUR.reveal, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** A small "sample data" tag so illustrative UI never reads as a real result. */
export function DemoTag({
  className,
  children = "Sample data",
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "mono-label inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-mist",
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-violet-soft/80" />
      {children}
    </span>
  );
}

/** Tiny check glyph in a filled circle. */
export function Tick({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn("h-4 w-4", className)} aria-hidden>
      <circle cx="10" cy="10" r="10" className="fill-current" />
      <path
        d="M6 10.4l2.6 2.6L14.2 7.4"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
