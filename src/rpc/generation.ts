import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { passagesFor } from "@/lib/exams";
import type { Difficulty, ExamKind, Json } from "@/lib/supabase/types";
import { generateAssessment } from "@/server/ai";
import { UnauthorizedError, requireUser } from "@/server/auth.server";
import { getServiceClient, ServiceRoleUnavailableError } from "@/server/supabase.server";

/**
 * Runs a generation for one assessment.
 *
 * Server-side because it holds the provider key, writes to a table the client
 * cannot write to, and must not trust the browser about which assessment it
 * owns. Ownership is re-checked against the caller's verified user id even
 * though the service-role client bypasses Row Level Security.
 */

const inputSchema = z.object({
  accessToken: z.string().min(10),
  assessmentId: z.string().uuid(),
});

export type GenerationOutcome =
  | { ok: true; questionCount: number; isMock: boolean; provider: string; warnings: string[] }
  | { ok: false; message: string };

export const startGeneration = createServerFn({ method: "POST" })
  .validator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<GenerationOutcome> => {
    let assessmentId: string | null = null;

    try {
      const user = await requireUser(data.accessToken);
      const supabase = getServiceClient();

      const { data: assessment, error: loadError } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", data.assessmentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (loadError) throw loadError;
      if (!assessment) return { ok: false, message: "We couldn't find that assessment." };

      if (assessment.status === "processing") {
        return { ok: false, message: "This assessment is already being generated." };
      }
      if (!assessment.document_id) {
        return { ok: false, message: "Attach a source document before generating." };
      }

      assessmentId = assessment.id;

      const { data: document, error: documentError } = await supabase
        .from("documents")
        .select("id, file_name, extracted_text, user_id")
        .eq("id", assessment.document_id)
        .maybeSingle();

      if (documentError) throw documentError;
      if (!document || document.user_id !== user.id) {
        return { ok: false, message: "That source document is no longer available." };
      }

      await supabase
        .from("assessments")
        .update({ status: "processing", error_message: null })
        .eq("id", assessment.id);

      const config = (assessment.config ?? {}) as Record<string, unknown>;
      const configuredTypes = Array.isArray(config["question_types"])
        ? (config["question_types"] as unknown[]).filter(
            (value): value is string => typeof value === "string",
          )
        : [];

      const result = await generateAssessment({
        assessmentId: assessment.id,
        exam: assessment.exam as ExamKind,
        section: assessment.section,
        questionTypes: configuredTypes.length > 0 ? configuredTypes : [assessment.question_type],
        difficulty: assessment.difficulty as Difficulty,
        questionCount: assessment.question_count,
        passages: passagesFor(assessment.exam, assessment.section, assessment.question_count),
        source: {
          documentId: document.id,
          title: document.file_name,
          text: document.extracted_text,
        },
      });

      // A re-run replaces the previous output rather than appending to it.
      await supabase.from("questions").delete().eq("assessment_id", assessment.id);

      const { error: insertError } = await supabase.from("questions").insert(
        result.questions.map((question) => ({
          assessment_id: assessment.id,
          question_number: question.questionNumber,
          question_type: question.questionType,
          passage: question.passage ?? null,
          question_text: question.questionText,
          // Stored as jsonb; the row type is intentionally loose about shape.
          options: question.options as unknown as Json,
          correct_answer: question.correctAnswer,
          explanation: question.explanation ?? null,
          metadata: {
            ...(question.metadata ?? {}),
            provider: result.provider,
            ...(result.model ? { model: result.model } : {}),
          },
        })),
      );

      if (insertError) throw insertError;

      await supabase
        .from("assessments")
        .update({
          status: "ready",
          error_message: null,
          config: {
            ...config,
            generated_at: new Date().toISOString(),
            provider: result.provider,
            is_mock: result.isMock,
            warnings: result.warnings,
          },
        })
        .eq("id", assessment.id);

      return {
        ok: true,
        questionCount: result.questions.length,
        isMock: result.isMock,
        provider: result.provider,
        warnings: result.warnings,
      };
    } catch (error) {
      console.error("[testly:generation]", error);

      if (error instanceof UnauthorizedError) {
        return { ok: false, message: error.message };
      }
      if (error instanceof ServiceRoleUnavailableError) {
        return {
          ok: false,
          message: "Generation isn't configured on the server yet (missing service-role key).",
        };
      }

      if (assessmentId) {
        try {
          await getServiceClient()
            .from("assessments")
            .update({
              status: "failed",
              error_message: "Generation failed. Please try again.",
            })
            .eq("id", assessmentId);
        } catch (updateError) {
          console.error("[testly:generation] could not mark assessment failed", updateError);
        }
      }

      return { ok: false, message: "Generation failed. Please try again." };
    }
  });
