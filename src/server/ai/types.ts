import type { Difficulty, ExamKind, QuestionOption } from "@/lib/supabase/types";

/**
 * The contract between Testly and whichever model actually writes the
 * questions. UI code never imports a provider — it calls the service in
 * `index.ts`, which picks one from configuration.
 */

export interface SourceMaterial {
  documentId: string;
  title: string;
  /**
   * Extracted document text, when available. Null means the pipeline has the
   * file but has not extracted its text yet — a provider must decide whether it
   * can work without it rather than inventing content.
   */
  text: string | null;
}

export interface GenerationRequest {
  assessmentId: string;
  exam: ExamKind;
  section: string;
  questionTypes: string[];
  difficulty: Difficulty;
  questionCount: number;
  /** IELTS Reading only: how many passages the questions are spread across. */
  passages?: number | undefined;
  source: SourceMaterial;
}

export interface GeneratedQuestion {
  questionNumber: number;
  questionType: string;
  passage?: string | null;
  questionText: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation?: string | null;
  metadata?: Record<string, string | number | boolean>;
}

export interface GenerationResult {
  questions: GeneratedQuestion[];
  provider: string;
  model?: string | undefined;
  /** Whether the output came from the development generator rather than a model. */
  isMock: boolean;
  /** Anything quality control removed or repaired, surfaced to the user. */
  warnings: string[];
}

/**
 * Agent 2 in the long-term architecture: turns prepared material into exam
 * questions. Agent 1 (source research) will land beside this as a separate
 * interface once it exists; nothing in the app assumes a single-agent flow.
 */
export interface AssessmentProvider {
  id: string;
  label: string;
  isMock: boolean;
  model?: string | undefined;
  generateSATQuestions(request: GenerationRequest): Promise<GeneratedQuestion[]>;
  generateIELTSQuestions(request: GenerationRequest): Promise<GeneratedQuestion[]>;
}

export class ProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}
