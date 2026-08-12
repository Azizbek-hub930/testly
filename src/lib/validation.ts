import { z } from "zod";

import { getSection, isValidQuestionType } from "@/lib/exams";

/**
 * Every user-supplied value is parsed here before it reaches Supabase.
 *
 * These schemas run in the browser for instant feedback, and again on the
 * server for anything sensitive — the database adds a third layer of CHECK
 * constraints, because client-side validation is a courtesy, not a control.
 */

export const WAITLIST_ROLES = [
  "Learning Center",
  "Tutor",
  "School",
  "Organization",
  "Student",
  "Other",
] as const;

export type WaitlistRole = (typeof WAITLIST_ROLES)[number];

const emailField = z
  .string()
  .trim()
  .min(1, "Please enter your email.")
  .max(254, "That email is too long.")
  .email("Please enter a valid email address.")
  .transform((value) => value.toLowerCase());

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters.`)
    .transform((value) => (value.length > 0 ? value : null));

// ---------------------------------------------------------------------------
// Waitlist
// ---------------------------------------------------------------------------

export const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120, "That name is too long."),
  email: emailField,
  organization: optionalText(160),
  role: z.enum(WAITLIST_ROLES, {
    errorMap: () => ({ message: "Please choose a role." }),
  }),
  source: z.string().trim().max(60).default("landing"),
});

export type WaitlistInput = z.input<typeof waitlistSchema>;
export type WaitlistPayload = z.output<typeof waitlistSchema>;

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

const passwordField = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Passwords can be at most 72 characters.");

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Please enter your password."),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name.").max(120, "That name is too long."),
  email: emailField,
  password: passwordField,
});

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Those passwords don't match.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: optionalText(120),
  organization: optionalText(160),
});

// ---------------------------------------------------------------------------
// Source documents
// ---------------------------------------------------------------------------

export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = ["application/pdf"] as const;

export function validateSourceFile(file: File): { ok: true } | { ok: false; message: string } {
  const isPdf =
    (ACCEPTED_FILE_TYPES as readonly string[]).includes(file.type) ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return { ok: false, message: "Only PDF files are supported right now." };
  }
  if (file.size === 0) {
    return { ok: false, message: "That file looks empty." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, message: "That file is larger than the 20 MB limit." };
  }
  return { ok: true };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export const assessmentSchema = z
  .object({
    documentId: z.string().uuid("Choose a source document first."),
    exam: z.enum(["SAT", "IELTS"]),
    section: z.string().min(1, "Choose a section."),
    questionTypes: z.array(z.string().min(1)).min(1, "Choose at least one question type."),
    difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
    questionCount: z
      .number({ invalid_type_error: "Choose how many questions to generate." })
      .int()
      .min(1, "Generate at least one question.")
      .max(60, "The maximum is 60 questions."),
    title: optionalText(160),
  })
  .superRefine((value, ctx) => {
    const section = getSection(value.exam, value.section);

    if (!section) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["section"],
        message: `${value.section} isn't a section of the ${value.exam}.`,
      });
      return;
    }

    if (!section.multiType && value.questionTypes.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questionTypes"],
        message: "Choose a single question type for this section.",
      });
    }

    for (const type of value.questionTypes) {
      if (!isValidQuestionType(value.exam, value.section, type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questionTypes"],
          message: `"${type}" isn't available for ${value.exam} ${value.section}.`,
        });
        break;
      }
    }

    if (!section.counts.some((count) => count.value === value.questionCount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questionCount"],
        message: `Choose one of the supported lengths: ${section.counts
          .map((count) => count.value)
          .join(", ")}.`,
      });
    }
  });

export type AssessmentInput = z.input<typeof assessmentSchema>;
export type AssessmentPayload = z.output<typeof assessmentSchema>;

/** First error message for a field, for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in result)) result[key] = issue.message;
  }
  return result;
}

/** Single sentence summarising a validation failure, for toasts. */
export function firstError(error: z.ZodError, fallback = "Please check the form."): string {
  return error.issues[0]?.message ?? fallback;
}
