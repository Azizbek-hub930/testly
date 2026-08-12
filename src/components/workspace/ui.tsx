import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

/**
 * Shared furniture for the signed-in areas. More functional than the landing
 * page, same materials: paper surfaces, hairline rules, indigo for state.
 */

export function PageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="eyebrow text-muted-foreground">{eyebrow}</p>
        <h1 className="display mt-2 text-2xl sm:text-3xl">{title}</h1>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  loading = false,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  loading?: boolean;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="paper-card h-full p-5">
        <p className="eyebrow text-muted-foreground">{label}</p>
        {loading ? (
          <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-muted" />
        ) : (
          <p className="display mt-3 text-3xl tabular-nums">{value}</p>
        )}
        {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </Reveal>
  );
}

export function PanelCard({
  title,
  action,
  children,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("paper-card overflow-hidden", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const STATUS_TONE: Record<string, string> = {
  ready: "border-indigo/30 bg-indigo/8 text-indigo",
  processing: "border-indigo/25 bg-indigo/5 text-indigo",
  uploading: "border-indigo/25 bg-indigo/5 text-indigo",
  draft: "border-border bg-muted/60 text-muted-foreground",
  failed: "border-destructive/30 bg-destructive/8 text-destructive",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
        STATUS_TONE[status] ?? "border-border text-muted-foreground",
        className,
      )}
    >
      {status === "processing" || status === "uploading" ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      ) : null}
      {status}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-surface">
        <Icon className="h-5 w-5 text-indigo" />
      </div>
      <p className="mt-5 text-sm font-semibold">{title}</p>
      <p className="mt-2 max-w-[42ch] text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-destructive/6 px-5 py-4 text-sm text-destructive last:border-b-0"
    >
      <span>{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-destructive/30 px-3 py-1 text-xs font-medium transition-colors hover:bg-destructive/10"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-hairline">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <div
              key={columnIndex}
              className="h-3 animate-pulse rounded-full bg-muted"
              style={{ width: `${[34, 24, 18, 14, 12][columnIndex % 5]}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
