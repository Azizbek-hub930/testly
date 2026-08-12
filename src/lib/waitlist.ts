import { isDuplicateError } from "@/lib/errors";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { WaitlistPayload } from "@/lib/validation";

export type JoinResult = "joined" | "already-joined";

/**
 * Adds someone to the early-access list.
 *
 * The public may INSERT into `waitlist` and nothing else — no SELECT policy
 * exists for anon, so a visitor can never read the list back. Duplicate
 * addresses are caught by the unique constraint rather than a pre-flight
 * lookup, which would need read access and would race anyway.
 */
export async function joinWaitlist(input: WaitlistPayload): Promise<JoinResult> {
  const { error } = await getSupabaseClient().from("waitlist").insert({
    name: input.name,
    email: input.email,
    organization: input.organization,
    role: input.role,
    source: input.source,
  });

  if (error) {
    if (isDuplicateError(error)) return "already-joined";
    throw error;
  }

  return "joined";
}
