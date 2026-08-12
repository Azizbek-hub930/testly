import { getServiceClient } from "@/server/supabase.server";

/**
 * Who is calling a server function.
 *
 * The browser sends its Supabase access token in the request body; this module
 * verifies it against Supabase rather than trusting anything the client claims.
 * A user id that arrived as a plain parameter is never used for authorization.
 */

export class UnauthorizedError extends Error {
  constructor(message = "Your session expired. Please sign in again.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export interface CallerIdentity {
  id: string;
  email: string;
}

export async function requireUser(accessToken: string): Promise<CallerIdentity> {
  if (!accessToken || accessToken.length < 10) throw new UnauthorizedError();

  const { data, error } = await getServiceClient().auth.getUser(accessToken);
  if (error || !data.user) throw new UnauthorizedError();

  return { id: data.user.id, email: data.user.email ?? "" };
}

/**
 * Admin check, read fresh from the database on every call. A role revoked a
 * second ago is respected even if the caller's JWT still says otherwise.
 */
export async function requireAdmin(accessToken: string): Promise<CallerIdentity> {
  const user = await requireUser(accessToken);

  const { data, error } = await getServiceClient()
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new ForbiddenError();
  if (data?.role !== "admin") throw new ForbiddenError();

  return user;
}
