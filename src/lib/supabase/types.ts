/**
 * Database types for the Testly schema.
 *
 * Kept in step with `supabase/migrations/*.sql` by hand. If you change a
 * migration, change this file in the same commit — or regenerate it with:
 *
 *   supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProfileRole = "user" | "admin";
export type DocumentStatus = "uploading" | "processing" | "ready" | "failed";
export type AssessmentStatus = "draft" | "processing" | "ready" | "failed";
export type ExamKind = "SAT" | "IELTS";
export type Difficulty = "easy" | "medium" | "hard" | "mixed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          organization: string | null;
          role: ProfileRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          organization?: string | null;
          role?: ProfileRole;
          avatar_url?: string | null;
        };
        // `role` is intentionally absent: the column is not granted to the
        // `authenticated` role, and a trigger rejects self-promotion.
        Update: {
          full_name?: string | null;
          organization?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      waitlist: {
        Row: {
          id: string;
          name: string;
          email: string;
          organization: string | null;
          role: string | null;
          source: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          organization?: string | null;
          role?: string | null;
          source?: string;
        };
        Update: {
          name?: string;
          organization?: string | null;
          role?: string | null;
          source?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_size: number;
          file_type: string;
          storage_path: string;
          status: DocumentStatus;
          error_message: string | null;
          extracted_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_size: number;
          file_type: string;
          storage_path: string;
          status?: DocumentStatus;
        };
        Update: {
          file_name?: string;
          status?: DocumentStatus;
          error_message?: string | null;
        };
        Relationships: [];
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          document_id: string | null;
          title: string | null;
          exam: ExamKind;
          section: string;
          question_type: string;
          difficulty: Difficulty;
          question_count: number;
          status: AssessmentStatus;
          config: Json;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id?: string | null;
          title?: string | null;
          exam: ExamKind;
          section: string;
          question_type: string;
          difficulty?: Difficulty;
          question_count: number;
          config?: Json;
        };
        Update: {
          title?: string | null;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          assessment_id: string;
          question_number: number;
          question_type: string;
          passage: string | null;
          question_text: string;
          options: Json;
          correct_answer: string;
          explanation: string | null;
          metadata: Json;
          created_at: string;
        };
        // Written by the generation pipeline (service role) only.
        Insert: {
          assessment_id: string;
          question_number: number;
          question_type: string;
          passage?: string | null;
          question_text: string;
          options?: Json;
          correct_answer: string;
          explanation?: string | null;
          metadata?: Json;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { uid?: string };
        Returns: boolean;
      };
      waitlist_stats: {
        Args: Record<string, never>;
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/**
 * The same schema as seen by the service role.
 *
 * `Database` deliberately models what a *browser* may write — `profiles.role`
 * and `assessments.status` are absent because the column grants withhold them.
 * Server code holds the service-role key and legitimately writes those columns,
 * so it uses this widened view instead of casting at every call site.
 */
type WithFullUpdates<TTables> = {
  [K in keyof TTables]: TTables[K] extends { Row: infer TRow }
    ? Omit<TTables[K], "Update"> & { Update: Partial<TRow> }
    : TTables[K];
};

export interface ServiceDatabase {
  public: Omit<Database["public"], "Tables"> & {
    Tables: WithFullUpdates<Database["public"]["Tables"]>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type WaitlistEntry = Database["public"]["Tables"]["waitlist"]["Row"];
export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
export type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];
export type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];

/** Shape stored in `questions.options`. */
export interface QuestionOption {
  label: string;
  text: string;
}

export function parseOptions(value: Json): QuestionOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) return [];
    const label = entry["label"];
    const text = entry["text"];
    if (typeof label !== "string" || typeof text !== "string") return [];
    return [{ label, text }];
  });
}
