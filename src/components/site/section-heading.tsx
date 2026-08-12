import type { ReactNode } from "react";

import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <Reveal>
          <p className="eyebrow text-indigo">{eyebrow}</p>
        </Reveal>
      ) : null}
      <Reveal delay={0.06}>
        <h2 className="display mt-4 text-[2.1rem] sm:text-[2.75rem] lg:text-[3.1rem]">{title}</h2>
      </Reveal>
      {intro ? (
        <Reveal delay={0.12}>
          <p className="mt-5 text-base text-muted-foreground">{intro}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
