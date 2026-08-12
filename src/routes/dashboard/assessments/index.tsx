import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus, Sparkles } from "lucide-react";

import { Cta } from "@/components/site/cta";
import { Reveal } from "@/components/site/reveal";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PanelCard,
  StatusPill,
  TableSkeleton,
  formatDate,
} from "@/components/workspace/ui";
import { listAssessments } from "@/lib/api/assessments";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import { describeAssessment } from "@/lib/exams";

export const Route = createFileRoute("/dashboard/assessments/")({
  component: AssessmentsList,
});

function AssessmentsList() {
  const { user } = useAuth();

  const assessments = useQuery({
    queryKey: ["assessments", "all", user?.id],
    queryFn: () => listAssessments(),
    enabled: Boolean(user?.id),
    // Keeps `processing` rows moving without a manual refresh.
    refetchInterval: (query) =>
      query.state.data?.some((assessment) => assessment.status === "processing") ? 4000 : false,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Assessments"
        title="Your assessments."
        actions={
          <Cta size="sm" variant="accent" asChild>
            <Link to="/dashboard/assessments/new">
              <Plus className="h-4 w-4" /> New assessment
            </Link>
          </Cta>
        }
      />

      <Reveal>
        <PanelCard
          title={
            assessments.data
              ? `${assessments.data.length} assessment${assessments.data.length === 1 ? "" : "s"}`
              : "All assessments"
          }
        >
          {assessments.isPending ? (
            <TableSkeleton rows={4} columns={3} />
          ) : assessments.isError ? (
            <ErrorState
              message={toFriendlyMessage(assessments.error, "assessment")}
              onRetry={() => void assessments.refetch()}
            />
          ) : assessments.data.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Nothing here yet"
              description="Pick a source, choose the exam shape, and Testly generates a full set of questions."
              action={
                <Cta size="sm" variant="accent" asChild>
                  <Link to="/dashboard/assessments/new">
                    Create an assessment <span aria-hidden>→</span>
                  </Link>
                </Cta>
              }
            />
          ) : (
            <ul>
              {assessments.data.map((assessment) => (
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
                        {describeAssessment(assessment)} · {assessment.difficulty} ·{" "}
                        {formatDate(assessment.created_at)}
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
