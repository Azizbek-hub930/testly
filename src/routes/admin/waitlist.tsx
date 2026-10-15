import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Download, LogOut, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { TestlyLogo } from "@/components/brand/testly-mark";
import { Container, EASE } from "@/components/home/ui";
import { fetchAllWaitlist } from "@/lib/api/admin";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import type { WaitlistEntry } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { WAITLIST_ROLES } from "@/lib/validation";

export const Route = createFileRoute("/admin/waitlist")({
  component: WaitlistAdmin,
});

/*
 * The admin's only page: everyone on the waitlist, with every answer they
 * gave. Anything an applicant left blank shows as "N/A". Reading the table
 * is restricted to admins by Row Level Security, not by this page.
 */

const NA = "N/A";
const show = (value: string | null | undefined) => (value && value.trim().length > 0 ? value : NA);

const FIELDS: { key: keyof WaitlistEntry; label: string; mono?: boolean }[] = [
  { key: "email", label: "Email", mono: true },
  { key: "phone", label: "Phone", mono: true },
  { key: "telegram", label: "Telegram", mono: true },
  { key: "organization", label: "Organization" },
  { key: "city", label: "City" },
  { key: "website", label: "Website", mono: true },
  { key: "students", label: "Size" },
  { key: "exams", label: "Exams" },
];

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WaitlistAdmin() {
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string>("All");

  const list = useQuery({ queryKey: ["admin", "waitlist", "all"], queryFn: fetchAllWaitlist });
  const rows = useMemo(() => list.data ?? [], [list.data]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: rows.length };
    for (const r of rows) c[r.role ?? "Other"] = (c[r.role ?? "Other"] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (role !== "All" && (r.role ?? "Other") !== role) return false;
      if (!q) return true;
      return [r.name, r.email, r.phone, r.organization, r.city, r.telegram]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q));
    });
  }, [rows, query, role]);

  const exportCsv = () => {
    const header = ["Joined", "Name", "Role", ...FIELDS.map((f) => f.label), "Message"];
    const lines = filtered.map((r) =>
      [
        formatWhen(r.created_at),
        r.name,
        show(r.role),
        ...FIELDS.map((f) => show(r[f.key] as string | null)),
        show(r.message),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob(["﻿" + [header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `testly-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const roleFilters = ["All", ...WAITLIST_ROLES];

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_80%_at_50%_0%,rgb(121_82_246/0.22),transparent)]"
      />

      {/* Top bar */}
      <header className="border-b border-white/[0.07]">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link to="/" aria-label="Testly home">
            <TestlyLogo tone="dark" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-mist sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 px-3.5 text-sm text-snow/80 transition-colors hover:border-white/25 hover:text-snow"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </Container>
      </header>

      <main className="pb-24 pt-10 sm:pt-14">
        <Container>
          {/* Title + actions */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mono-label text-[11px] text-violet-soft">Admin</p>
              <h1 className="font-display mt-3 text-[2.25rem] leading-none text-snow sm:text-[2.75rem]">
                Waitlist
              </h1>
              <p className="mt-3 text-mist">
                {list.isLoading
                  ? "Loading…"
                  : `${rows.length} ${rows.length === 1 ? "person has" : "people have"} joined so far.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void list.refetch()}
                aria-label="Refresh"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-snow/80 transition-colors hover:border-white/25 hover:text-snow"
              >
                <RefreshCw className={cn("h-4 w-4", list.isFetching && "animate-spin")} />
              </button>
              <button
                type="button"
                onClick={exportCsv}
                disabled={filtered.length === 0}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#8f6dff,#6a45ea)] px-5 text-sm font-medium text-[#fff] shadow-[0_12px_30px_-12px_rgb(121_82_246/0.9)] transition-opacity disabled:opacity-40"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* Search + role filter */}
          <div className="mt-8 flex flex-col gap-4">
            <label className="relative block max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, phone, organization…"
                className="h-12 w-full rounded-full border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-snow outline-none placeholder:text-mist/50 focus:border-violet-soft/60 focus:shadow-[0_0_0_4px_rgb(121_82_246/0.16)]"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {roleFilters.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] transition-colors",
                    role === r
                      ? "border-transparent bg-violet/25 text-snow"
                      : "border-white/10 text-mist hover:text-snow",
                  )}
                >
                  {r}
                  <span className="rounded-full bg-white/10 px-1.5 text-[11px] tabular-nums">
                    {counts[r] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="mt-8">
            {list.isError ? (
              <Notice
                title="Couldn't load the waitlist"
                body={toFriendlyMessage(list.error, "generic")}
              />
            ) : list.isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="glass h-40 animate-pulse rounded-[22px]" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Notice
                title={rows.length === 0 ? "No one has joined yet" : "No matches"}
                body={
                  rows.length === 0
                    ? "New sign-ups from the waitlist page will appear here."
                    : "Try a different search or filter."
                }
              />
            ) : (
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {filtered.map((r, i) => (
                    <motion.li
                      key={r.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.03, ease: EASE }}
                    >
                      <EntryCard entry={r} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}

function EntryCard({ entry }: { entry: WaitlistEntry }) {
  const initials = entry.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <article className="glass rounded-[22px] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet/25 text-sm font-semibold text-[var(--chip-text)]">
            {initials || "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-snow">{entry.name}</p>
            <p className="text-xs text-mist">Joined {formatWhen(entry.created_at)}</p>
          </div>
        </div>
        <span className="rounded-full border border-violet-soft/40 bg-violet/15 px-3 py-1 text-xs font-medium text-[var(--chip-text)]">
          {show(entry.role)}
        </span>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-4 border-t border-white/[0.07] pt-5 sm:grid-cols-2 lg:grid-cols-4">
        {FIELDS.map((f) => {
          const value = show(entry[f.key] as string | null);
          const empty = value === NA;
          return (
            <div key={f.key} className="min-w-0">
              <dt className="mono-label text-[10px] text-mist/70">{f.label}</dt>
              <dd
                className={cn(
                  "mt-1 break-words text-sm",
                  empty ? "text-mist/50" : "text-snow",
                  f.mono && !empty && "font-mono text-[13px]",
                )}
              >
                {value}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <p className="mono-label text-[10px] text-mist/70">Message</p>
        <p
          className={cn(
            "mt-1 whitespace-pre-wrap text-sm leading-relaxed",
            entry.message ? "text-snow/90" : "text-mist/50",
          )}
        >
          {show(entry.message)}
        </p>
      </div>
    </article>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-[22px] px-6 py-14 text-center">
      <p className="text-lg font-semibold text-snow">{title}</p>
      <p className="mt-2 text-sm text-mist">{body}</p>
    </div>
  );
}
