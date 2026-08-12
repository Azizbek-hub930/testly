import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Plus, Sparkles, UploadCloud } from "lucide-react";

import { Cta } from "@/components/site/cta";
import { Reveal } from "@/components/site/reveal";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PanelCard,
  StatCard,
  StatusPill,
  TableSkeleton,
  formatDate,
} from "@/components/workspace/ui";
import { fetchDashboardCounts, listAssessments } from "@/lib/api/assessments";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import { describeAssessment } from "@/lib/exams";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const { user, profile } = useAuth();
  const userId = user?.id;

  const counts = useQuery({
    queryKey: ["dashboard", "counts", userId],
    queryFn: fetchDashboardCounts,
    enabled: Boolean(userId),
  });

  const recent = useQuery({
    queryKey: ["assessments", "recent", userId],
    queryFn: () => listAssessments(5),
    enabled: Boolean(userId),
  });

  const firstName = (profile?.full_name ?? "").split(" ")[0];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title={firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
        actions={
          <>
            <Cta size="sm" variant="outline" asChild>
              <Link to="/dashboard/sources">
                <UploadCloud className="h-4 w-4" /> Upload source
              </Link>
            </Cta>
            <Cta size="sm" variant="accent" asChild>
              <Link to="/dashboard/assessments/new">
                <Plus className="h-4 w-4" /> Create assessment
              </Link>
            </Cta>
          </>
        }
      />

      {counts.isError ? (
        <div className="paper-card overflow-hidden">
          <ErrorState
            message={toFriendlyMessage(counts.error, "generic")}
            onRetry={() => void counts.refetch()}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Assessments"
            value={counts.data?.assessments ?? 0}
            loading={counts.isPending}
          />
          <StatCard
            label="Ready"
            value={counts.data?.ready ?? 0}
            loading={counts.isPending}
            delay={0.04}
          />
          <StatCard
            label="Questions generated"
            value={counts.data?.questions ?? 0}
            loading={counts.isPending}
            delay={0.08}
          />
          <StatCard
            label="Sources"
            value={counts.data?.documents ?? 0}
            loading={counts.isPending}
            delay={0.12}
          />
        </div>
      )}

      <Reveal delay={0.06}>
        <PanelCard
          title="Recent assessments"
          action={
            <Link
              to="/dashboard/assessments"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {recent.isPending ? (
            <TableSkeleton rows={3} columns={3} />
          ) : recent.isError ? (
            <ErrorState
              message={toFriendlyMessage(recent.error, "assessment")}
              onRetry={() => void recent.refetch()}
            />
          ) : (recent.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No assessments yet"
              description="Upload a source document, choose an exam shape, and Testly builds the questions."
              action={
                <Cta size="sm" variant="accent" asChild>
                  <Link to="/dashboard/assessments/new">
                    Create your first assessment <span aria-hidden>→</span>
                  </Link>
                </Cta>
              }
            />
          ) : (
            <ul>
              {recent.data?.map((assessment) => (
                <li key={assessment.id}>
                  <Link
                    to="/dashboard/assessments/$id"
                    params={{ id: assessment.id }}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-hairline px-5 py-4 transition-colors last:border-0 hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {assessment.title ?? describeAssessment(assessment)}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {describeAssessment(assessment)} · {formatDate(assessment.created_at)}
                      </p>
                    </div>
                    <StatusPill status={assessment.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      </Reveal>
    </div>
  );
}
