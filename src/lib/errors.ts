/**
 * One place that turns any failure — Postgres, PostgREST, GoTrue, Storage or a
 * dropped connection — into a sentence a person can act on.
 *
 * Raw database errors never reach the UI: they leak schema details and read
 * like a stack trace. The original is logged to the console for developers.
 */

export type ErrorContext =
  | "waitlist"
  | "signin"
  | "signup"
  | "reset"
  | "upload"
  | "assessment"
  | "generation"
  | "admin"
  | "profile"
  | "generic";

const GENERIC: Record<ErrorContext, string> = {
  waitlist: "We couldn't add you to the list just now. Please try again.",
  signin: "We couldn't sign you in. Please try again.",
  signup: "We couldn't create your account. Please try again.",
  reset: "We couldn't send that reset link. Please try again.",
  upload: "That upload didn't finish. Please try again.",
  assessment: "We couldn't save this assessment. Please try again.",
  generation: "Generation didn't start. Please try again.",
  admin: "We couldn't load that data. Please try again.",
  profile: "We couldn't save your profile. Please try again.",
  generic: "Something went wrong. Please try again.",
};

interface LooseError {
  message?: unknown;
  code?: unknown;
  status?: unknown;
  name?: unknown;
  error_description?: unknown;
}

function read(error: unknown): LooseError {
  if (error && typeof error === "object") return error as LooseError;
  if (typeof error === "string") return { message: error };
  return {};
}

function messageOf(error: unknown): string {
  const e = read(error);
  if (typeof e.message === "string") return e.message;
  if (typeof e.error_description === "string") return e.error_description;
  return "";
}

function codeOf(error: unknown): string {
  const e = read(error);
  if (typeof e.code === "string") return e.code;
  if (typeof e.code === "number") return String(e.code);
  return "";
}

function statusOf(error: unknown): number | undefined {
  const e = read(error);
  return typeof e.status === "number" ? e.status : undefined;
}

/** The user's session is gone or no longer valid — they need to sign in again. */
export function isAuthExpiredError(error: unknown): boolean {
  const status = statusOf(error);
  const code = codeOf(error);
  const message = messageOf(error).toLowerCase();
  return (
    status === 401 ||
    code === "PGRST301" ||
    code === "refresh_token_not_found" ||
    message.includes("jwt expired") ||
    message.includes("invalid refresh token")
  );
}

/** A waitlist email that is already on the list. */
export function isDuplicateError(error: unknown): boolean {
  return codeOf(error) === "23505" || messageOf(error).includes("duplicate key value");
}

function isNetworkError(error: unknown): boolean {
  const message = messageOf(error).toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed") ||
    read(error).name === "AbortError"
  );
}

export function toFriendlyMessage(error: unknown, context: ErrorContext = "generic"): string {
  if (import.meta.env.DEV) console.error(`[testly:${context}]`, error);

  if (error instanceof Error && error.name === "SupabaseNotConfiguredError") {
    return "The backend isn't connected yet. Add your Supabase keys to continue.";
  }

  if (isNetworkError(error)) {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  const code = codeOf(error);
  const message = messageOf(error);
  const lower = message.toLowerCase();

  // --- Postgres / PostgREST -------------------------------------------------
  //
  // These run before the session-expired check on purpose. PostgREST answers a
  // privilege failure with HTTP 401 *and* SQLSTATE 42501 — a non-admin opening
  // an admin query gets exactly that. Testing the status first would tell them
  // their session had expired, sending them to re-authenticate over a problem
  // that signing in again cannot fix.
  if (code === "23505") {
    return context === "waitlist"
      ? "You're already on the Testly waitlist."
      : "That already exists.";
  }
  if (code === "23514") return "Some of those details aren't valid. Please check and try again.";
  if (code === "42501" || statusOf(error) === 403) {
    return "You don't have permission to do that.";
  }
  if (code === "PGRST116") return "We couldn't find that item.";

  if (isAuthExpiredError(error)) {
    return "Your session expired. Please sign in again.";
  }

  // --- Auth (GoTrue) --------------------------------------------------------
  if (lower.includes("invalid login credentials")) {
    return "That email and password don't match. Please try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email first — check your inbox for the link.";
  }
  if (lower.includes("user already registered") || code === "user_already_exists") {
    return "An account with that email already exists. Try signing in instead.";
  }
  if (lower.includes("password should be at least") || code === "weak_password") {
    return "Please choose a password with at least 8 characters.";
  }
  if (lower.includes("for security purposes") || code === "over_email_send_rate_limit") {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (statusOf(error) === 429 || code === "over_request_rate_limit") {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (lower.includes("provider is not enabled")) {
    return "Google sign-in isn't enabled for this project yet.";
  }
  if (lower.includes("email link is invalid") || lower.includes("token has expired")) {
    return "That link has expired. Please request a new one.";
  }

  // --- Storage --------------------------------------------------------------
  if (lower.includes("exceeded the maximum allowed size") || statusOf(error) === 413) {
    return "That file is larger than the 20 MB limit.";
  }
  if (lower.includes("mime type") && lower.includes("not supported")) {
    return "Only PDF files are supported right now.";
  }
  if (lower.includes("bucket not found")) {
    return "File storage isn't set up yet. Run the storage migration in Supabase.";
  }

  return GENERIC[context];
}
