import type { AssessmentProvider, GeneratedQuestion, GenerationRequest } from "@/server/ai/types";

/**
 * DEVELOPMENT GENERATOR — NOT AI OUTPUT.
 *
 * Produces correctly *shaped* questions so the pipeline, the database and the
 * UI state machine can be exercised without an AI provider configured. Every
 * question it returns is labelled `mock: true` in its metadata and the UI shows
 * a banner saying so. Nothing here reads the source document, because inventing
 * content from a document it never analysed is exactly the thing this must not
 * pretend to do.
 *
 * Delete nothing when adding a real provider — register the new one in
 * `index.ts` and this stays as the offline fallback.
 */

const LETTERS = ["A", "B", "C", "D"] as const;
const TFNG = ["True", "False", "Not Given"] as const;

/** Deterministic per assessment, so re-running a draft gives a stable preview. */
function seededPick<T>(items: readonly T[], seed: string, salt: number): T {
  let hash = salt;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
  }
  const index = Math.abs(hash) % items.length;
  return items[index] as T;
}

function placeholderPassage(title: string, index: number): string {
  return [
    `[Development placeholder — passage ${index + 1}]`,
    "",
    `A real passage would be written here from your source, "${title}". This build has no AI provider configured, so no source text was analysed and no passage was generated.`,
  ].join("\n");
}

function buildQuestion(
  request: GenerationRequest,
  questionNumber: number,
  questionType: string,
  passage: string | null,
): GeneratedQuestion {
  const seed = `${request.assessmentId}:${questionNumber}`;
  const isTfng = questionType === "True / False / Not Given";
  const isOpenFormat = questionType.includes("Completion") || questionType.includes("Matching");

  const options: { label: string; text: string }[] = isTfng
    ? TFNG.map((label) => ({ label, text: label }))
    : isOpenFormat
      ? []
      : LETTERS.map((label) => ({
          label,
          text: `Placeholder answer choice ${label}.`,
        }));

  const correctAnswer = isTfng
    ? seededPick(TFNG, seed, 7)
    : isOpenFormat
      ? "placeholder"
      : seededPick(LETTERS, seed, 13);

  return {
    questionNumber,
    questionType,
    passage,
    questionText: `Sample ${questionType} question ${questionNumber} for "${request.source.title}".`,
    options,
    correctAnswer,
    explanation:
      "Placeholder rationale. Configure an AI provider to generate real explanations from your source.",
    metadata: {
      mock: true,
      difficulty: request.difficulty,
      exam: request.exam,
      section: request.section,
    },
  };
}

function generate(request: GenerationRequest): GeneratedQuestion[] {
  const types = request.questionTypes.length > 0 ? request.questionTypes : ["Multiple Choice"];
  const passageCount = request.exam === "IELTS" ? Math.max(1, request.passages ?? 1) : 0;
  const perPassage = passageCount > 0 ? Math.ceil(request.questionCount / passageCount) : 0;

  return Array.from({ length: request.questionCount }, (_, index) => {
    const questionType = types[index % types.length] ?? "Multiple Choice";
    const passage =
      passageCount > 0
        ? placeholderPassage(request.source.title, Math.floor(index / perPassage))
        : null;
    return buildQuestion(request, index + 1, questionType, passage);
  });
}

export const mockProvider: AssessmentProvider = {
  id: "mock",
  label: "Development generator",
  isMock: true,
  generateSATQuestions: (request) => Promise.resolve(generate(request)),
  generateIELTSQuestions: (request) => Promise.resolve(generate(request)),
};
