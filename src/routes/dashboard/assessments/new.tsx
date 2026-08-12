import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { FileText } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { LabelChip } from "@/components/site/paper";
import { Cta } from "@/components/site/cta";
import { Reveal } from "@/components/site/reveal";
import { TestlyPulse } from "@/components/site/testly-loader";
import { GenerationProgress, useGenerationStage } from "@/components/workspace/generation-progress";
import { SourceUploader } from "@/components/workspace/source-uploader";
import { EmptyState, ErrorState, PageHeader, TableSkeleton } from "@/components/workspace/ui";
import { createAssessment } from "@/lib/api/assessments";
import { listDocuments } from "@/lib/api/documents";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import { DIFFICULTIES, EXAM_LIST, defaultsFor, getExam, getSection } from "@/lib/exams";
import { goTo } from "@/lib/navigation";
import type { Difficulty, ExamKind } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { assessmentSchema, fieldErrors, formatBytes } from "@/lib/validation";
import { startGeneration } from "@/rpc/generation";

export const Route = createFileRoute("/dashboard/assessments/new")({
  component: NewAssessment,
});

function NewAssessment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, session } = useAuth();

  const [exam, setExam] = useState<ExamKind>("SAT");
  const [documentId, setDocumentId] = useState<string>("");
  const [section, setSection] = useState(() => defaultsFor("SAT").section);
  const [questionTypes, setQuestionTypes] = useState<string[]>(
    () => defaultsFor("SAT").questionTypes,
  );
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionCount, setQuestionCount] = useState(() => defaultsFor("SAT").questionCount);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const documents = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: listDocuments,
    enabled: Boolean(user?.id),
  });

  const readyDocuments = useMemo(
    () => (documents.data ?? []).filter((document) => document.status === "ready"),
    [documents.data],
  );

  const examConfig = getExam(exam);
  const sectionConfig = getSection(exam, section);

  const generate = useMutation({
    mutationFn: async () => {
      if (!user || !session) throw new Error("Your session expired. Please sign in again.");

      const assessment = await createAssessment({
        userId: user.id,
        documentId,
        exam,
        section,
        questionTypes,
        difficulty,
        questionCount,
        title: null,
      });

      const outcome = await startGeneration({
        data: { accessToken: session.access_token, assessmentId: assessment.id },
      });

      return { assessmentId: assessment.id, outcome };
    },
    onSuccess: ({ assessmentId, outcome }) => {
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "counts"] });

      if (!outcome.ok) {
        toast.error(outcome.message);
      } else {
        toast.success(`${outcome.questionCount} questions ready.`);
      }

      goTo(router, `/dashboard/assessments/${assessmentId}`);
    },
    onError: (error) => toast.error(toFriendlyMessage(error, "generation")),
  });

  const stage = useGenerationStage(generate.isPending);

  const changeExam = (next: ExamKind) => {
    const defaults = defaultsFor(next);
    setExam(next);
    setSection(defaults.section);
    setQuestionTypes(defaults.questionTypes);
    setQuestionCount(defaults.questionCount);
    setErrors({});
  };

  const changeSection = (next: string) => {
    setSection(next);
    const config = getSection(exam, next);
    setQuestionTypes(config?.questionTypes[0] ? [config.questionTypes[0].id] : []);
    setQuestionCount(config?.counts[1]?.value ?? config?.counts[0]?.value ?? 13);
    setErrors({});
  };

  const toggleType = (id: string) => {
    if (!sectionConfig?.multiType) {
      setQuestionTypes([id]);
      return;
    }
    setQuestionTypes((current) =>
      current.includes(id)
        ? current.length > 1
          ? current.filter((value) => value !== id)
          : current
        : [...current, id],
    );
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (generate.isPending) return;

    const parsed = assessmentSchema.safeParse({
      documentId,
      exam,
      section,
      questionTypes,
      difficulty,
      questionCount,
      title: "",
    });

    if (!parsed.success) {
      const issues = fieldErrors(parsed.error);
      setErrors(issues);
      toast.error(Object.values(issues)[0] ?? "Please check the form.");
      return;
    }

    setErrors({});
    generate.mutate();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="New assessment"
        title="Create an assessment."
        actions={
          <Cta size="sm" variant="outline" asChild>
            <Link to="/dashboard/assessments">Cancel</Link>
          </Cta>
        }
      />

      <Reveal>
        <form onSubmit={onSubmit}>
          <div className="paper-card paper-raised relative overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-6">
              <p className="text-xs font-semibold">New assessment</p>
              <LabelChip tone="muted">Draft</LabelChip>
            </div>

            <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              {/* Source */}
              <div>
                <p className="eyebrow text-muted-foreground">Source</p>

                {documents.isPending ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-border">
                    <TableSkeleton rows={2} columns={2} />
                  </div>
                ) : documents.isError ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-border">
                    <ErrorState
                      message={toFriendlyMessage(documents.error, "upload")}
                      onRetry={() => void documents.refetch()}
                    />
                  </div>
                ) : readyDocuments.length === 0 ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-border">
                    <EmptyState
                      icon={FileText}
                      title="No sources yet"
                      description="Upload a PDF to generate questions from it."
                    />
                  </div>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {readyDocuments.map((document) => {
                      const active = documentId === document.id;
                      return (
                        <li key={document.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setDocumentId(document.id);
                              setErrors((current) => {
                                const { documentId: _removed, ...rest } = current;
                                return rest;
                              });
                            }}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200",
                              active
                                ? "border-indigo bg-indigo/8"
                                : "border-border hover:-translate-y-0.5 hover:border-indigo/40",
                            )}
                          >
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-navy text-[9px] font-semibold text-background">
                              PDF
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">
                                {document.file_name}
                              </span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {formatBytes(document.file_size)}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "h-4 w-4 shrink-0 rounded-full border",
                                active ? "border-indigo bg-indigo" : "border-border",
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {errors["documentId"] ? (
                  <p className="mt-2 text-xs text-destructive">{errors["documentId"]}</p>
                ) : null}

                <div className="mt-4">
                  <SourceUploader
                    onUploaded={(document) => {
                      setDocumentId(document.id);
                      void queryClient.invalidateQueries({ queryKey: ["documents"] });
                    }}
                  />
                </div>
              </div>

              {/* Configuration */}
              <div className="space-y-5">
                <p className="eyebrow text-muted-foreground">Assessment setup</p>

                <ChipRow
                  label="Exam"
                  options={EXAM_LIST.map((item) => ({ id: item.id, label: item.label }))}
                  selected={[exam]}
                  onSelect={(id) => changeExam(id as ExamKind)}
                />

                <ChipRow
                  label="Section"
                  options={(examConfig?.sections ?? []).map((item) => ({
                    id: item.id,
                    label: item.label,
                  }))}
                  selected={[section]}
                  onSelect={changeSection}
                  error={errors["section"]}
                />

                <ChipRow
                  label={sectionConfig?.multiType ? "Question types (choose any)" : "Question type"}
                  options={(sectionConfig?.questionTypes ?? []).map((item) => ({
                    id: item.id,
                    label: item.label,
                  }))}
                  selected={questionTypes}
                  onSelect={toggleType}
                  error={errors["questionTypes"]}
                />

                <ChipRow
                  label="Difficulty"
                  options={DIFFICULTIES.map((item) => ({ id: item.value, label: item.label }))}
                  selected={[difficulty]}
                  onSelect={(id) => setDifficulty(id as Difficulty)}
                />

                <ChipRow
                  label="Questions"
                  options={(sectionConfig?.counts ?? []).map((item) => ({
                    id: String(item.value),
                    label: item.label,
                    hint: item.hint,
                  }))}
                  selected={[String(questionCount)]}
                  onSelect={(id) => setQuestionCount(Number(id))}
                  error={errors["questionCount"]}
                />

                <Cta
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="mt-2 w-full"
                  disabled={generate.isPending}
                >
                  {generate.isPending ? (
                    <>
                      <TestlyPulse /> Generating
                    </>
                  ) : (
                    <>
                      Generate <span aria-hidden>→</span>
                    </>
                  )}
                </Cta>
              </div>
            </div>

            <AnimatePresence>
              {generate.isPending ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 z-20 grid place-items-center bg-paper/92 backdrop-blur-md"
                >
                  <GenerationProgress
                    stage={stage}
                    chips={[exam, section, ...questionTypes.slice(0, 2), `${questionCount}`]}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </form>
      </Reveal>
    </div>
  );
}

interface ChipOption {
  id: string;
  label: string;
  hint?: string | undefined;
}

function ChipRow({
  label,
  options,
  selected,
  onSelect,
  error,
}: {
  label: string;
  options: ChipOption[];
  selected: string[];
  onSelect: (id: string) => void;
  error?: string | undefined;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                active
                  ? "border-indigo bg-indigo/10 text-indigo"
                  : "border-border text-muted-foreground hover:-translate-y-0.5 hover:border-indigo/40 hover:text-foreground",
              )}
            >
              {option.label}
              {option.hint ? (
                <span className="ml-1.5 text-[10px] opacity-70">{option.hint}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
