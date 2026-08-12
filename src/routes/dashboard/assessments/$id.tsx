import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, FlaskConical, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CheckMark } from "@/components/landing/ai-engine";
import { Cta } from "@/components/site/cta";
import { LabelChip } from "@/components/site/paper";
import { Reveal } from "@/components/site/reveal";
import { TestlyLoader, TestlyPulse } from "@/components/site/testly-loader";
import { GenerationProgress, useGenerationStage } from "@/components/workspace/generation-progress";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PanelCard,
  StatusPill,
  formatDateTime,
} from "@/components/workspace/ui";
import { deleteAssessment, getAssessment, listQuestions } from "@/lib/api/assessments";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import { describeAssessment } from "@/lib/exams";
import { goTo } from "@/lib/navigation";
import { parseOptions, type Json, type QuestionRow } from "@/lib/supabase/types";
import { startGeneration } from "@/rpc/generation";

export const Route = createFileRoute("/dashboard/assessments/$id")({
  component: AssessmentDetail,
});

function AssessmentDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, session } = useAuth();
  const [showAnswers, setShowAnswers] = useState(true);

  const assessment = useQuery({
    queryKey: ["assessment", id],
    queryFn: () => getAssessment(id),
    enabled: Boolean(user?.id),
    refetchInterval: (query) => (query.state.data?.status === "processing" ? 3000 : false),
  });

  const questions = useQuery({
    queryKey: ["questions", id],
    queryFn: () => listQuestions(id),
    enabled: Boolean(user?.id) && assessment.data?.status === "ready",
  });

  const regenerate = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("Your session expired. Please sign in again.");
      return startGeneration({ data: { accessToken: session.access_token, assessmentId: id } });
    },
    onSuccess: (outcome) => {
      if (outcome.ok) {
        toast.success(`${outcome.questionCount} questions ready.`);
      } else {
        toast.error(outcome.message);
      }
      void queryClient.invalidateQueries({ queryKey: ["assessment", id] });
      void queryClient.invalidateQueries({ queryKey: ["questions", id] });
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "counts"] });
    },
    onError: (error) => toast.error(toFriendlyMessage(error, "generation")),
  });

  const remove = useMutation({
    mutationFn: () => deleteAssessment(id),
    onSuccess: () => {
      toast.success("Assessment deleted.");
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "counts"] });
      goTo(router, "/dashboard/assessments", { replace: true });
    },
    onError: (error) => toast.error(toFriendlyMessage(error, "assessment")),
  });

  const stage = useGenerationStage(regenerate.isPending);

  if (assessment.isPending) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <TestlyLoader label="Loading assessment" />
      </div>
    );
  }

  if (assessment.isError) {
    return (
      <div className="paper-card overflow-hidden">
        <ErrorState
          message={toFriendlyMessage(assessment.error, "assessment")}
          onRetry={() => void assessment.refetch()}
        />
      </div>
    );
  }

  if (!assessment.data) {
    return (
      <div className="paper-card overflow-hidden">
        <EmptyState
          icon={Sparkles}
          title="Assessment not found"
          description="It may have been deleted, or it belongs to another account."
          action={
            <Cta size="sm" asChild>
              <Link to="/dashboard/assessments">Back to assessments</Link>
            </Cta>
          }
        />
      </div>
    );
  }

  const data = assessment.data;
  const config = readConfig(data.config);
  const isMock = config.isMock;
  const isBusy = regenerate.isPending || data.status === "processing";

  return (
    <div className="space-y-8">
      <Link
        to="/dashboard/assessments"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All assessments
      </Link>

      <PageHeader
        eyebrow={describeAssessment(data)}
        title={data.title ?? describeAssessment(data)}
        actions={
          <>
            <StatusPill status={data.status} />
            {data.status === "ready" ? (
              <Cta
                size="sm"
                variant="outline"
                onClick={() => setShowAnswers((value) => !value)}
                type="button"
              >
                {showAnswers ? "Hide answers" : "Show answers"}
              </Cta>
            ) : null}
            {data.status !== "processing" ? (
              <Cta
                size="sm"
                variant={data.status === "ready" ? "outline" : "accent"}
                type="button"
                onClick={() => regenerate.mutate()}
                disabled={isBusy}
              >
                {regenerate.isPending ? (
                  <>
                    <TestlyPulse /> Generating
                  </>
                ) : data.status === "ready" ? (
                  "Regenerate"
                ) : (
                  <>
                    Generate <span aria-hidden>→</span>
                  </>
                )}
              </Cta>
            ) : null}
            <button
              type="button"
              aria-label="Delete assessment"
              title="Delete assessment"
              onClick={() => {
                if (window.confirm("Delete this assessment and its questions?")) remove.mutate();
              }}
              disabled={remove.isPending}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetaCard label="Difficulty" value={data.difficulty} />
        <MetaCard
          label="Question types"
          value={config.questionTypes.join(", ") || data.question_type}
        />
        <MetaCard label="Created" value={formatDateTime(data.created_at)} />
      </div>

      {isMock && data.status === "ready" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-indigo/25 bg-indigo/6 p-4">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-indigo" />
          <div className="text-sm">
            <p className="font-semibold">Development generator output</p>
            <p className="mt-1 text-muted-foreground">
              These questions are placeholders produced without an AI provider — no source text was
              analysed. Set <span className="font-mono text-xs">AI_PROVIDER</span> and a provider
              key on the server to generate real questions.
            </p>
          </div>
        </div>
      ) : null}

      {config.warnings.length > 0 && data.status === "ready" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="text-sm">
            <p className="font-semibold">Quality control</p>
            <ul className="mt-1 space-y-0.5 text-muted-foreground">
              {config.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {data.status === "failed" && data.error_message ? (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/8 p-4 text-sm text-destructive">
          {data.error_message}
        </div>
      ) : null}

      {isBusy ? (
        <div className="paper-card grid min-h-[380px] place-items-center p-6">
          <GenerationProgress
            stage={data.status === "processing" && !regenerate.isPending ? 1 : stage}
            chips={[data.exam, data.section, String(data.question_count)]}
          />
        </div>
      ) : data.status === "draft" ? (
        <div className="paper-card overflow-hidden">
          <EmptyState
            icon={Sparkles}
            title="Ready to generate"
            description="This draft is saved with its exam shape. Run generation to produce the questions."
            action={
              <Cta size="sm" variant="accent" type="button" onClick={() => regenerate.mutate()}>
                Generate now <span aria-hidden>→</span>
              </Cta>
            }
          />
        </div>
      ) : data.status === "ready" ? (
        <Reveal>
          <PanelCard
            title={`${questions.data?.length ?? data.question_count} questions`}
            action={<LabelChip tone="indigo">{data.exam}</LabelChip>}
          >
            {questions.isPending ? (
              <div className="grid min-h-[200px] place-items-center py-10">
                <TestlyLoader label="Loading questions" size="sm" />
              </div>
            ) : questions.isError ? (
              <ErrorState
                message={toFriendlyMessage(questions.error, "assessment")}
                onRetry={() => void questions.refetch()}
              />
            ) : (questions.data?.length ?? 0) === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No questions saved"
                description="Generation finished without producing questions. Try running it again."
              />
            ) : (
              <ul className="divide-y divide-hairline">
                {questions.data?.map((question) => (
                  <li key={question.id} className="p-5">
                    <QuestionCard question={question} showAnswer={showAnswers} />
                  </li>
                ))}
              </ul>
            )}
          </PanelCard>
        </Reveal>
      ) : (
        <div className="paper-card overflow-hidden">
          <EmptyState
            icon={AlertTriangle}
            title="Generation failed"
            description="Nothing was saved. You can run it again — your configuration is unchanged."
            action={
              <Cta size="sm" variant="accent" type="button" onClick={() => regenerate.mutate()}>
                Try again
              </Cta>
            }
          />
        </div>
      )}
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="paper-card p-4">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="mt-2 truncate text-sm font-medium capitalize">{value}</p>
    </div>
  );
}

function QuestionCard({ question, showAnswer }: { question: QuestionRow; showAnswer: boolean }) {
  const options = parseOptions(question.options);

  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <LabelChip tone="navy">Q{question.question_number}</LabelChip>
        <LabelChip tone="muted">{question.question_type}</LabelChip>
      </div>

      {question.passage ? (
        <div className="paper-card mt-4 bg-surface p-4">
          <p className="whitespace-pre-line text-xs leading-6 text-muted-foreground">
            {question.passage}
          </p>
        </div>
      ) : null}

      <p className="mt-4 text-sm font-medium leading-6">{question.question_text}</p>

      {options.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {options.map((option) => {
            const correct =
              showAnswer &&
              option.label.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
            return (
              <li
                key={option.label}
                className={
                  "flex items-start gap-2.5 rounded-xl border px-3 py-2 text-sm " +
                  (correct
                    ? "border-indigo/40 bg-indigo/8 text-foreground"
                    : "border-border text-muted-foreground")
                }
              >
                <span
                  className={
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold " +
                    (correct ? "bg-indigo text-white" : "bg-muted text-muted-foreground")
                  }
                >
                  {option.label.slice(0, 2)}
                </span>
                <span className="min-w-0">{option.text}</span>
                {correct ? <CheckMark active /> : null}
              </li>
            );
          })}
        </ul>
      ) : showAnswer ? (
        <p className="mt-3 rounded-xl border border-indigo/30 bg-indigo/8 px-3 py-2 text-sm">
          <span className="font-medium">Answer:</span> {question.correct_answer}
        </p>
      ) : null}

      {showAnswer && question.explanation ? (
        <p className="mt-3 text-xs leading-6 text-muted-foreground">{question.explanation}</p>
      ) : null}
    </article>
  );
}

interface AssessmentConfig {
  questionTypes: string[];
  warnings: string[];
  isMock: boolean;
}

function readConfig(value: Json): AssessmentConfig {
  const record =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, Json>)
      : {};

  const types = record["question_types"];
  const warnings = record["warnings"];

  return {
    questionTypes: Array.isArray(types)
      ? types.filter((entry): entry is string => typeof entry === "string")
      : [],
    warnings: Array.isArray(warnings)
      ? warnings.filter((entry): entry is string => typeof entry === "string")
      : [],
    isMock: record["is_mock"] === true,
  };
}
