import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { serverEnv } from "@/server/env.server";
import type { ServiceDatabase } from "@/lib/supabase/types";

/**
 * Service-role Supabase client.
 *
 * This client bypasses Row Level Security, so every function that uses it must
 * establish who the caller is first (see `auth.server.ts`) and scope its own
 * queries accordingly. It exists for two jobs the browser cannot be trusted
 * with: writing generated questions, and letting an existing admin change
 * another user's role.
 */

let cached: SupabaseClient<ServiceDatabase> | null = null;

export class ServiceRoleUnavailableError extends Error {
  constructor() {
    super(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your server environment (see .env.example).",
    );
    this.name = "ServiceRoleUnavailableError";
  }
}

export function getServiceClient(): SupabaseClient<ServiceDatabase> {
  const url = serverEnv.supabaseUrl;
  const key = serverEnv.serviceRoleKey;
  if (!url || !key) throw new ServiceRoleUnavailableError();

  cached ??= createClient<ServiceDatabase>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "x-application-name": "testly-server" } },
  });

  return cached;
}
