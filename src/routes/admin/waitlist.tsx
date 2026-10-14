import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ListChecks, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Cta } from "@/components/site/cta";
import { Reveal } from "@/components/site/reveal";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PanelCard,
  TableSkeleton,
  formatDate,
  formatDateTime,
} from "@/components/workspace/ui";
import {
  fetchWaitlistPage,
  fetchWaitlistStats,
  updateWaitlistNotes,
  type WaitlistSort,
} from "@/lib/api/admin";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import type { WaitlistEntry } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { WAITLIST_ROLES } from "@/lib/validation";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/admin/waitlist")({
  component: AdminWaitlist,
});

function AdminWaitlist() {
  const { isAdmin } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput, 300);
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [sort, setSort] = useState<WaitlistSort>("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<WaitlistEntry | null>(null);

  // Any filter change invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [search, role, organization, sort]);

  const stats = useQuery({
    queryKey: ["admin", "waitlist-stats"],
    queryFn: fetchWaitlistStats,
    enabled: isAdmin,
  });

  const list = useQuery({
    queryKey: ["admin", "waitlist", { search, role, organization, sort, page }],
    queryFn: () =>
      fetchWaitlistPage({ search, role, organization, sort, page, pageSize: PAGE_SIZE }),
    enabled: isAdmin,
  });

  const total = list.data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow = Math.min(page * PAGE_SIZE, total);
  const filtered = Boolean(search || role || organization);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Testly Admin"
        title="Waitlist."
        actions={
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {stats.data ? `${stats.data.total} total` : ""}
          </span>
        }
      />

      <Reveal>
        <div className="paper-card p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name, email or organization"
                aria-label="Search the waitlist"
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-indigo/50 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--indigo)_14%,transparent)]"
              />
            </div>

            <FilterSelect
              label="Role"
              value={role}
              onChange={setRole}
              options={[
                { value: "", label: "All roles" },
                ...WAITLIST_ROLES.map((item) => ({ value: item, label: item })),
              ]}
            />

            <FilterSelect
              label="Organization"
              value={organization}
              onChange={setOrganization}
              options={[
                { value: "", label: "All organizations" },
                ...(stats.data?.organizationList ?? []).map((item) => ({
                  value: item,
                  label: item,
                })),
              ]}
            />

            <FilterSelect
              label="Sort"
              value={sort}
              onChange={(value) => setSort(value as WaitlistSort)}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
              ]}
            />
          </div>

          {filtered ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setRole("");
                setOrganization("");
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo hover:underline"
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          ) : null}
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <PanelCard
          title={
            list.isPending
              ? "Loading"
              : `${total} ${total === 1 ? "person" : "people"}${filtered ? " matched" : ""}`
          }
        >
          {list.isPending ? (
            <TableSkeleton rows={6} columns={5} />
          ) : list.isError ? (
            <ErrorState
              message={toFriendlyMessage(list.error, "admin")}
              onRetry={() => void list.refetch()}
            />
          ) : total === 0 ? (
            <EmptyState
              icon={ListChecks}
              title={filtered ? "No matches" : "No one on the waitlist yet"}
              description={
                filtered
                  ? "Try a different search or clear the filters."
                  : "Submissions from the landing page appear here the moment they arrive."
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[46rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-hairline">
                      {["Name", "Email", "Organization", "Role", "Joined", "Source"].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] font-medium text-muted-foreground"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {list.data?.rows.map((entry) => (
                      <tr
                        key={entry.id}
                        tabIndex={0}
                        role="button"
                        onClick={() => setSelected(entry)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelected(entry);
                          }
                        }}
                        className="cursor-pointer border-b border-hairline transition-colors last:border-0 hover:bg-accent/50 focus:bg-accent/50"
                      >
                        <td className="max-w-[12rem] truncate px-5 py-3.5 text-sm font-medium">
                          {entry.name}
                        </td>
                        <td className="max-w-[16rem] truncate px-5 py-3.5 text-sm text-muted-foreground">
                          {entry.email}
                        </td>
                        <td className="max-w-[12rem] truncate px-5 py-3.5 text-sm text-muted-foreground">
                          {entry.organization ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">
                          {entry.role ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-sm text-muted-foreground">
                          {formatDate(entry.created_at)}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">
                          {entry.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-5 py-3.5">
                <p className="text-xs text-muted-foreground">
                  Showing {firstRow}–{lastRow} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <PagerButton
                    label="Previous page"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </PagerButton>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {page} / {lastPage}
                  </span>
                  <PagerButton
                    label="Next page"
                    disabled={page >= lastPage}
                    onClick={() => setPage((value) => Math.min(lastPage, value + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </PagerButton>
                </div>
              </div>
            </>
          )}
        </PanelCard>
      </Reveal>

      <WaitlistDetail entry={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-11 w-full appearance-none rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-shadow focus:border-indigo/50 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--indigo)_14%,transparent)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PagerButton({
  label,
  children,
  onClick,
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-indigo/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function WaitlistDetail({ entry, onClose }: { entry: WaitlistEntry | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setNotes(entry?.notes ?? "");
  }, [entry]);

  useEffect(() => {
    if (!entry) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entry, onClose]);

  const save = useMutation({
    mutationFn: () => updateWaitlistNotes(entry?.id ?? "", notes),
    onSuccess: () => {
      toast.success("Notes saved.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "waitlist"] });
      onClose();
    },
    onError: (error) => toast.error(toFriendlyMessage(error, "admin")),
  });

  return (
    <AnimatePresence>
      {entry ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 grid place-items-end bg-navy/35 p-0 backdrop-blur-sm sm:place-items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Waitlist entry for ${entry.name}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="paper-card paper-raised max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-b-none sm:rounded-[14px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
              <div className="min-w-0">
                <p className="eyebrow text-muted-foreground">Waitlist entry</p>
                <h2 className="display mt-1.5 truncate text-xl">{entry.name}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="divide-y divide-hairline">
              <DetailRow label="Email" value={entry.email} mono />
              <DetailRow label="Organization" value={entry.organization ?? "—"} />
              <DetailRow label="Role" value={entry.role ?? "—"} />
              <DetailRow label="Phone" value={entry.phone ?? "—"} mono />
              <DetailRow label="Telegram" value={entry.telegram ?? "—"} mono />
              <DetailRow label="Website" value={entry.website ?? "—"} mono />
              <DetailRow label="City" value={entry.city ?? "—"} />
              <DetailRow label="Students" value={entry.students ?? "—"} />
              <DetailRow label="Exams" value={entry.exams ?? "—"} />
              <DetailRow label="Message" value={entry.message ?? "—"} />
              <DetailRow label="Joined" value={formatDateTime(entry.created_at)} />
              <DetailRow label="Source" value={entry.source} />
            </dl>

            <div className="border-t border-hairline p-5">
              <label htmlFor="waitlist-notes" className="eyebrow text-muted-foreground">
                Internal notes
              </label>
              <textarea
                id="waitlist-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Only visible to administrators."
                className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-indigo/50 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--indigo)_14%,transparent)]"
              />
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Cta size="sm" variant="outline" type="button" onClick={onClose}>
                  Close
                </Cta>
                <Cta
                  size="sm"
                  type="button"
                  onClick={() => save.mutate()}
                  disabled={save.isPending || notes === (entry.notes ?? "")}
                >
                  {save.isPending ? "Saving…" : "Save notes"}
                </Cta>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-3.5">
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "min-w-0 max-w-[60%] break-words text-right text-sm",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
