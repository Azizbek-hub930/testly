import { cn } from "@/lib/utils";

/**
 * The Testly "T" symbol, reproduced from the brand logo:
 * deep navy bar + stem with an electric indigo corner wedge.
 */
export function TestlyMark({
  className,
  navyClassName = "fill-navy",
  accentClassName = "fill-indigo",
}: {
  className?: string;
  navyClassName?: string;
  accentClassName?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={cn("h-8 w-8", className)} role="img" aria-label="Testly">
      <rect x="6" y="8" width="88" height="23" rx="7" className={navyClassName} />
      <path d="M6 31 H41 V53 Z" className={accentClassName} />
      <path d="M41 31 H67 L63 87 q-0.6 5 -5.6 5 H51 q-5 0 -5.3 -5 Z" className={navyClassName} />
    </svg>
  );
}

export function TestlyLogo({
  className,
  wordClassName = "text-navy",
  compact = false,
}: {
  className?: string;
  wordClassName?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <TestlyMark className={compact ? "h-6 w-6" : "h-7 w-7"} />
      <span className={cn("text-[1.15rem] font-semibold tracking-[-0.03em]", wordClassName)}>
        Test<span className="text-indigo">ly</span>
      </span>
    </span>
  );
}
