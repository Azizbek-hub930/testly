import { getSupabaseClient, siteUrl } from "@/lib/supabase/client";

/**
 * Every call the app makes to Supabase Auth, in one place.
 *
 * Each function throws the raw Supabase error; callers pass it through
 * `toFriendlyMessage` so nothing internal reaches the screen.
 */

function callbackUrl(next: string): string {
  return `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signInWithPassword(input: { email: string; password: string }) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword(input);
  if (error) throw error;
  return data;
}

export interface SignUpResult {
  /** False when Supabase has "Confirm email" on and sent a verification link. */
  sessionReady: boolean;
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<SignUpResult> {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      // Copied into profiles by the on_auth_user_created trigger.
      data: { full_name: input.fullName },
      emailRedirectTo: callbackUrl("/dashboard"),
    },
  });
  if (error) throw error;
  return { sessionReady: Boolean(data.session) };
}

export async function signInWithGoogle(next = "/dashboard") {
  const { error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(next) },
  });
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl("/reset-password"),
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await getSupabaseClient().auth.updateUser({ password });
  if (error) throw error;
}

export async function updateProfile(input: {
  fullName: string | null;
  organization: string | null;
}) {
  const supabase = getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const id = userData.user?.id;
  if (!id) throw new Error("Not signed in");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: input.fullName, organization: input.organization })
    .eq("id", id);

  if (error) throw error;
}
