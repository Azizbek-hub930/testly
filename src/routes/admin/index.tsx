import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowRight, ListChecks } from "lucide-react";

import { Reveal } from "@/components/site/reveal";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PanelCard,
  StatCard,
  TableSkeleton,
  formatDate,
} from "@/components/workspace/ui";
import { fetchWaitlistPage, fetchWaitlistStats, type DayCount } from "@/lib/api/admin";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";

export const Route = createFileRoute("/admin/")({
  // The admin area is just the waitlist for now.
  beforeLoad: () => {
    throw redirect({ to: "/admin/waitlist" });
  },
  component: AdminOverview,
});

function AdminOverview() {
  const { isAdmin } = useAuth();

  const stats = useQuery({
    queryKey: ["admin", "waitlist-stats"],
    queryFn: fetchWaitlistStats,
    enabled: isAdmin,
  });

  const recent = useQuery({
    queryKey: ["admin", "waitlist-recent"],
    queryFn: () =>
      fetchWaitlistPage({
        search: "",
        role: "",
        organization: "",
        sort: "newest",
        page: 1,
        pageSize: 6,
      }),
    enabled: isAdmin,
  });

  const roleTotal = (stats.data?.roles ?? []).reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Testly Admin" title="Overview." />

      {stats.isError ? (
        <div className="paper-card overflow-hidden">
          <ErrorState
            message={toFriendlyMessage(stats.error, "admin")}
            onRetry={() => void stats.refetch()}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Waitlist"
            value={stats.data?.total ?? 0}
            hint={stats.data ? `+${stats.data.week} this week` : undefined}
            loading={stats.isPending}
          />
          <StatCard
            label="Today"
            value={stats.data?.today ?? 0}
            loading={stats.isPending}
            delay={0.04}
          />
          <StatCard
            label="This week"
            value={stats.data?.week ?? 0}
            loading={stats.isPending}
            delay={0.08}
          />
          <StatCard
            label="Organizations"
            value={stats.data?.organizations ?? 0}
            loading={stats.isPending}
            delay={0.12}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Reveal>
          <PanelCard
            title="Last 30 days"
            action={
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Signups per day
              </span>
            }
          >
            <div className="p-5">
              {stats.isPending ? (
                <div className="h-28 animate-pulse rounded-xl bg-muted" />
              ) : (
                <SignupChart data={stats.data?.daily ?? []} />
              )}
            </div>
          </PanelCard>
        </Reveal>

        <Reveal delay={0.06}>
          <PanelCard title="Roles">
            <div className="space-y-3 p-5">
              {stats.isPending ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="h-3 animate-pulse rounded-full bg-muted" />
                  ))}
                </div>
              ) : (stats.data?.roles.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No signups yet.</p>
              ) : (
                stats.data?.roles.map((entry) => (
                  <div key={entry.role}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate font-medium">{entry.role}</span>
                      <span className="tabular-nums text-muted-foreground">{entry.count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-indigo"
                        style={{
                          width: `${roleTotal > 0 ? Math.max(4, (entry.count / roleTotal) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </PanelCard>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <PanelCard
          title="Newest signups"
          action={
            <Link
              to="/admin/waitlist"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {recent.isPending ? (
            <TableSkeleton rows={4} columns={4} />
          ) : recent.isError ? (
            <ErrorState
              message={toFriendlyMessage(recent.error, "admin")}
              onRetry={() => void recent.refetch()}
            />
          ) : (recent.data?.rows.length ?? 0) === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No one on the waitlist yet"
              description="Submissions from the landing page appear here the moment they arrive."
            />
          ) : (
            <ul>
              {recent.data?.rows.map((entry) => (
                <li
                  key={entry.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-hairline px-5 py-3.5 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{entry.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {entry.email}
                      {entry.organization ? ` · ${entry.organization}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(entry.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      </Reveal>
    </div>
  );
}

/** Bars for the last 30 days, drawn from the real per-day counts. */
function SignupChart({ data }: { data: DayCount[] }) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No signups in the last 30 days.
      </p>
    );
  }

  const max = Math.max(...data.map((entry) => entry.count), 1);

  return (
    <div>
      <div className="flex h-28 items-end gap-1">
        {data.map((entry) => (
          <div
            key={entry.day}
            title={`${entry.day}: ${entry.count}`}
            className="min-w-0 flex-1 rounded-t-sm bg-indigo/70 transition-colors hover:bg-indigo"
            style={{ height: `${Math.max(4, (entry.count / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{data[0]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}
