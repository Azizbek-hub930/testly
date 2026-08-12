import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * False when the project has not been pointed at a Supabase instance yet. The
 * landing page still renders — every feature that needs a backend degrades to
 * an explanatory message instead of a crash.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).",
    );
    this.name = "SupabaseNotConfiguredError";
  }
}

let cached: SupabaseClient<Database> | null = null;

/**
 * The browser Supabase client. Holds the user session in localStorage and
 * refreshes it automatically.
 *
 * Call this from effects, event handlers and queries — never during a server
 * render, since there is no session to read there.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!url || !anonKey) throw new SupabaseNotConfiguredError();

  cached ??= createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Handled explicitly by /auth/callback so we control the redirect.
      detectSessionInUrl: false,
      flowType: "pkce",
      storageKey: "testly-auth",
    },
    global: {
      headers: { "x-application-name": "testly" },
    },
  });

  return cached;
}

/**
 * Origin used to build auth redirect links. Defaults to wherever the app is
 * actually running, so localhost, Vercel previews and production all work
 * without extra configuration.
 */
export function siteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
