import type { Difficulty, ExamKind } from "@/lib/supabase/types";

/**
 * The exam catalogue. The generator form, the validation schema and the
 * generation service all read from here, so adding a section or a question
 * type is a one-file change.
 */

export interface QuestionTypeOption {
  id: string;
  label: string;
  hint?: string;
}

export interface CountOption {
  value: number;
  label: string;
  hint?: string;
  /** IELTS Reading is built in passages of ~13 questions. */
  passages?: number;
}

export interface SectionConfig {
  id: string;
  label: string;
  questionTypes: QuestionTypeOption[];
  counts: CountOption[];
  /** Multiple question types may be combined in one assessment. */
  multiType: boolean;
}

export interface ExamConfig {
  id: ExamKind;
  label: string;
  blurb: string;
  sections: SectionConfig[];
}

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "mixed", label: "Mixed" },
];

const SAT: ExamConfig = {
  id: "SAT",
  label: "SAT",
  blurb: "Digital SAT · Reading and Writing, Math",
  sections: [
    {
      id: "Reading and Writing",
      label: "Reading and Writing",
      multiType: false,
      questionTypes: [
        { id: "Information and Ideas", label: "Information and Ideas" },
        { id: "Craft and Structure", label: "Craft and Structure" },
        { id: "Expression of Ideas", label: "Expression of Ideas" },
        { id: "Standard English Conventions", label: "Standard English Conventions" },
      ],
      counts: [
        { value: 13, label: "13", hint: "Quick set" },
        { value: 27, label: "27", hint: "One module" },
        { value: 54, label: "54", hint: "Full section" },
      ],
    },
    {
      id: "Math",
      label: "Math",
      multiType: false,
      questionTypes: [
        { id: "Algebra", label: "Algebra" },
        { id: "Advanced Math", label: "Advanced Math" },
        { id: "Problem-Solving and Data Analysis", label: "Problem-Solving and Data Analysis" },
        { id: "Geometry and Trigonometry", label: "Geometry and Trigonometry" },
      ],
      counts: [
        { value: 11, label: "11", hint: "Quick set" },
        { value: 22, label: "22", hint: "One module" },
        { value: 44, label: "44", hint: "Full section" },
      ],
    },
  ],
};

const IELTS: ExamConfig = {
  id: "IELTS",
  label: "IELTS",
  blurb: "IELTS Academic · Reading",
  sections: [
    {
      id: "Reading",
      label: "Reading",
      multiType: true,
      questionTypes: [
        { id: "Multiple Choice", label: "Multiple Choice" },
        { id: "True / False / Not Given", label: "True / False / Not Given" },
        { id: "Matching Headings", label: "Matching Headings" },
        { id: "Matching Information", label: "Matching Information" },
        { id: "Sentence Completion", label: "Sentence Completion" },
        { id: "Summary Completion", label: "Summary Completion" },
      ],
      counts: [
        { value: 13, label: "13", hint: "1 passage", passages: 1 },
        { value: 27, label: "27", hint: "2 passages", passages: 2 },
        { value: 40, label: "40", hint: "3 passages", passages: 3 },
      ],
    },
  ],
};

export const EXAMS: Record<ExamKind, ExamConfig> = { SAT, IELTS };
export const EXAM_LIST: ExamConfig[] = [SAT, IELTS];

export function getExam(exam: string): ExamConfig | undefined {
  return exam === "SAT" || exam === "IELTS" ? EXAMS[exam] : undefined;
}

export function getSection(exam: string, section: string): SectionConfig | undefined {
  return getExam(exam)?.sections.find((s) => s.id === section);
}

export function isValidQuestionType(exam: string, section: string, type: string): boolean {
  return getSection(exam, section)?.questionTypes.some((t) => t.id === type) ?? false;
}

/** How many passages a given IELTS question count implies. */
export function passagesFor(exam: string, section: string, count: number): number | undefined {
  return getSection(exam, section)?.counts.find((c) => c.value === count)?.passages;
}

export function defaultsFor(exam: ExamKind) {
  const config = EXAMS[exam];
  const section = config.sections[0];
  if (!section) throw new Error(`Exam ${exam} has no sections configured`);
  const firstType = section.questionTypes[0];
  const preset = section.counts[Math.min(1, section.counts.length - 1)] ?? section.counts[0];
  return {
    section: section.id,
    questionTypes: firstType ? [firstType.id] : [],
    questionCount: preset?.value ?? 13,
  };
}

/** How a stored assessment describes itself in a list. */
export function describeAssessment(input: {
  exam: string;
  section: string;
  question_count: number;
}): string {
  return `${input.exam} · ${input.section} · ${input.question_count} questions`;
}
