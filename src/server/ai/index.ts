import { serverEnv } from "@/server/env.server";
import { mockProvider } from "@/server/ai/mock-provider";
import type {
  AssessmentProvider,
  GeneratedQuestion,
  GenerationRequest,
  GenerationResult,
} from "@/server/ai/types";

/**
 * The generation service.
 *
 * Everything above this line in the stack (routes, components, server
 * functions) talks to these four functions and never to a provider directly,
 * so swapping the mock for a real model is a change to `resolveProvider` and
 * nothing else.
 */

const PROVIDERS: Record<string, AssessmentProvider> = {
  mock: mockProvider,
  // anthropic: anthropicProvider,   ← add here; see ./README.md
};

export function resolveProvider(): AssessmentProvider {
  const configured = serverEnv.aiProvider.toLowerCase();
  const provider = PROVIDERS[configured];

  if (!provider) {
    console.warn(
      `[testly:ai] AI_PROVIDER="${configured}" is not registered. Falling back to the development generator.`,
    );
    return mockProvider;
  }

  return provider;
}

export async function generateSATQuestions(
  request: GenerationRequest,
): Promise<GeneratedQuestion[]> {
  return resolveProvider().generateSATQuestions(request);
}

export async function generateIELTSQuestions(
  request: GenerationRequest,
): Promise<GeneratedQuestion[]> {
  return resolveProvider().generateIELTSQuestions(request);
}

/**
 * Quality control.
 *
 * Runs on whatever a provider returns, including a real model's output:
 * structure, answer validity, near-duplicates and count. Anything that fails is
 * dropped rather than repaired, and the reason is reported back to the user.
 */
export function validateQuestions(
  questions: GeneratedQuestion[],
  request: GenerationRequest,
): { questions: GeneratedQuestion[]; warnings: string[] } {
  const warnings: string[] = [];
  const kept: GeneratedQuestion[] = [];
  const seen: Set<string>[] = [];

  let malformed = 0;
  let invalidAnswer = 0;
  let duplicates = 0;

  for (const question of questions) {
    const text = question.questionText?.trim() ?? "";
    const answer = question.correctAnswer?.trim() ?? "";

    if (text.length === 0 || answer.length === 0 || question.questionType.trim().length === 0) {
      malformed += 1;
      continue;
    }

    // A multiple-choice answer has to name one of the choices offered.
    if (question.options.length > 0) {
      const labels = question.options.map((option) => option.label.trim().toLowerCase());
      if (!labels.includes(answer.toLowerCase())) {
        invalidAnswer += 1;
        continue;
      }
    }

    const fingerprint = tokenize(text);
    if (seen.some((existing) => jaccard(existing, fingerprint) >= 0.85)) {
      duplicates += 1;
      continue;
    }

    seen.push(fingerprint);
    kept.push({ ...question, questionText: text, correctAnswer: answer });
  }

  if (malformed > 0) warnings.push(`${malformed} incomplete question(s) were removed.`);
  if (invalidAnswer > 0) {
    warnings.push(
      `${invalidAnswer} question(s) had an answer that matched no choice and were removed.`,
    );
  }
  if (duplicates > 0) warnings.push(`${duplicates} near-duplicate question(s) were removed.`);

  const trimmed = kept.slice(0, request.questionCount);
  if (trimmed.length < request.questionCount) {
    warnings.push(
      `Produced ${trimmed.length} of the ${request.questionCount} questions requested.`,
    );
  }

  // Renumber so gaps left by removals never reach the database.
  return {
    questions: trimmed.map((question, index) => ({ ...question, questionNumber: index + 1 })),
    warnings,
  };
}

/**
 * Full pipeline for one assessment: pick the agent for the exam, generate, then
 * quality-check. Persisting the result is the caller's job.
 */
export async function generateAssessment(request: GenerationRequest): Promise<GenerationResult> {
  const provider = resolveProvider();

  const raw =
    request.exam === "SAT"
      ? await provider.generateSATQuestions(request)
      : await provider.generateIELTSQuestions(request);

  const { questions, warnings } = validateQuestions(raw, request);

  if (questions.length === 0) {
    throw new Error("The generator returned no usable questions.");
  }

  return {
    questions,
    provider: provider.id,
    model: provider.model,
    isMock: provider.isMock,
    warnings,
  };
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}
