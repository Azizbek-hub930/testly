import { passagesFor } from "@/lib/exams";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { AssessmentRow, QuestionRow } from "@/lib/supabase/types";
import type { AssessmentPayload } from "@/lib/validation";

/**
 * Assessments and their generated questions.
 *
 * Every query here relies on Row Level Security to scope rows to the signed-in
 * user; none of them filter by user id in application code, because a filter
 * you can forget is not a security boundary.
 */

export async function listAssessments(limit?: number): Promise<AssessmentRow[]> {
  let query = getSupabaseClient()
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getAssessment(id: string): Promise<AssessmentRow | null> {
  const { data, error } = await getSupabaseClient()
    .from("assessments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listQuestions(assessmentId: string): Promise<QuestionRow[]> {
  const { data, error } = await getSupabaseClient()
    .from("questions")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("question_number", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createAssessment(
  input: AssessmentPayload & { userId: string },
): Promise<AssessmentRow> {
  const passages = passagesFor(input.exam, input.section, input.questionCount);
  const primaryType = input.questionTypes.length === 1 ? input.questionTypes[0] : "Mixed";

  const { data, error } = await getSupabaseClient()
    .from("assessments")
    .insert({
      user_id: input.userId,
      document_id: input.documentId,
      title: input.title ?? `${input.exam} · ${input.section}`,
      exam: input.exam,
      section: input.section,
      question_type: primaryType ?? input.exam,
      difficulty: input.difficulty,
      question_count: input.questionCount,
      config: {
        question_types: input.questionTypes,
        ...(passages ? { passages } : {}),
      },
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function renameAssessment(id: string, title: string): Promise<void> {
  const { error } = await getSupabaseClient().from("assessments").update({ title }).eq("id", id);

  if (error) throw error;
}

export async function deleteAssessment(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from("assessments").delete().eq("id", id);
  if (error) throw error;
}

export interface DashboardCounts {
  assessments: number;
  ready: number;
  questions: number;
  documents: number;
}

/** Counts for the dashboard cards — head-only queries, no rows transferred. */
export async function fetchDashboardCounts(): Promise<DashboardCounts> {
  const supabase = getSupabaseClient();

  const [assessments, ready, documents] = await Promise.all([
    supabase.from("assessments").select("id", { count: "exact", head: true }),
    supabase.from("assessments").select("id", { count: "exact", head: true }).eq("status", "ready"),
    supabase.from("documents").select("id", { count: "exact", head: true }),
  ]);

  if (assessments.error) throw assessments.error;
  if (ready.error) throw ready.error;
  if (documents.error) throw documents.error;

  // Questions are scoped through their assessment by RLS, so a plain count is
  // already limited to this user's own output.
  const questions = await supabase.from("questions").select("id", { count: "exact", head: true });
  if (questions.error) throw questions.error;

  return {
    assessments: assessments.count ?? 0,
    ready: ready.count ?? 0,
    questions: questions.count ?? 0,
    documents: documents.count ?? 0,
  };
}
