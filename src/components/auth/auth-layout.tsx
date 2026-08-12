import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

import { TestlyLogo, TestlyMark } from "@/components/brand/testly-mark";
import { TestlyPulse } from "@/components/site/testly-loader";
import { cn } from "@/lib/utils";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-indigo/25 blur-[120px]"
        />
        <Link to="/" className="relative">
          <TestlyLogo wordClassName="text-white" />
        </Link>
        <div className="relative">
          <TestlyMark
            className="h-10 w-10 float-slow"
            navyClassName="fill-white"
            accentClassName="fill-indigo"
          />
          <p className="display mt-8 max-w-sm text-[2.5rem] text-white">
            Build better assessments with AI.
          </p>
          <p className="mt-5 max-w-xs text-sm text-white/50">
            Source material in. Exam-ready SAT and IELTS practice out.
          </p>
        </div>
        <p className="relative font-mono text-[10px] uppercase tracking-widest text-white/35">
          Testly · Assessment engine
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col justify-center px-5 py-14 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="lg:hidden">
            <TestlyLogo />
          </Link>
          <h1 className="display mt-10 text-3xl lg:mt-0">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-9">{children}</div>
          <div className="mt-8 text-sm text-muted-foreground">{footer}</div>
        </div>
      </main>
    </div>
  );
}

export function AuthField({
  label,
  action,
  error,
  className,
  id,
  ...input
}: Omit<ComponentProps<"input">, "id"> & {
  label: string;
  action?: ReactNode;
  error?: string | undefined;
  id?: string;
}) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${fieldId}-error`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={fieldId} className="eyebrow text-muted-foreground">
          {label}
        </label>
        {action}
      </div>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-indigo/50 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--indigo)_14%,transparent)] disabled:opacity-60",
          error &&
            "border-destructive/60 focus:border-destructive/70 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--destructive)_12%,transparent)]",
          className,
        )}
        {...input}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function GoogleButton({
  label,
  loading = false,
  ...button
}: ComponentProps<"button"> & { label: string; loading?: boolean }) {
  return (
    <button
      type="button"
      {...button}
      disabled={button.disabled || loading}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-3 rounded-full border border-border bg-surface text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo/40 disabled:pointer-events-none disabled:opacity-60",
        button.className,
      )}
    >
      {loading ? (
        <TestlyPulse />
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5a4.7 4.7 0 0 1-2 3.1l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2.1H12Z"
          />
          <path
            fill="#34A853"
            d="M6.6 14.3 5.9 15l-2.5 2A9 9 0 0 0 12 21c2.4 0 4.5-.8 6-2.2l-3.2-2.5c-.8.6-1.9.9-2.8.9-2.3 0-4.2-1.5-4.9-3.6Z"
          />
          <path
            fill="#4A90E2"
            d="M3.4 7A9 9 0 0 0 3 12c0 1.7.4 3.4 1.2 4.9l3.4-2.6a5.4 5.4 0 0 1 0-3.4L3.4 7Z"
          />
          <path
            fill="#FBBC05"
            d="M12 6.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 3.4 7l3.2 2.5C7.4 8.1 9.3 6.6 12 6.6Z"
          />
        </svg>
      )}
      {loading ? "Connecting…" : label}
    </button>
  );
}

/** Inline, non-blocking error banner shared by the auth screens. */
export function AuthError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/25 bg-destructive/8 px-3.5 py-3 text-sm text-destructive"
    >
      {message}
    </div>
  );
}
