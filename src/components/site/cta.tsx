import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const ctaVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-navy text-background shadow-[0_10px_30px_-14px_color-mix(in_oklab,var(--navy)_85%,transparent)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_color-mix(in_oklab,var(--navy)_75%,transparent)]",
        accent:
          "bg-indigo text-white shadow-[0_10px_30px_-14px_color-mix(in_oklab,var(--indigo)_90%,transparent)] hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-16px_color-mix(in_oklab,var(--indigo)_80%,transparent)]",
        outline:
          "border border-border bg-surface/70 text-foreground hover:-translate-y-0.5 hover:border-indigo/40 hover:bg-surface",
        ghost: "text-foreground/70 hover:bg-accent hover:text-foreground",
        onDark:
          "bg-background text-navy hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-18px_rgba(255,255,255,0.5)]",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-[0.95rem]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Cta({
  className,
  variant,
  size,
  asChild,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof ctaVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(ctaVariants({ variant, size }), className)} {...props} />;
}
