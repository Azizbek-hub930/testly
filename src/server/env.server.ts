/**
 * Server-side configuration.
 *
 * Nothing in this module is bundled for the browser: it is imported only from
 * `*.server.ts` files, which TanStack Start strips from the client build.
 * Values with a `VITE_` prefix are public by definition; everything else here
 * is a secret and must never be re-exported to a component.
 */

function readEnv(key: string): string | undefined {
  // `process.env` on Node and Vercel; nitro's unenv shim elsewhere.
  const raw = typeof process === "undefined" ? undefined : process.env?.[key];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const serverEnv = {
  /** Same project URL the browser uses — public, and safe to read either way. */
  get supabaseUrl(): string | undefined {
    return (
      import.meta.env.VITE_SUPABASE_URL?.trim() ||
      readEnv("VITE_SUPABASE_URL") ||
      readEnv("SUPABASE_URL")
    );
  },

  /** Bypasses Row Level Security. Server only, always. */
  get serviceRoleKey(): string | undefined {
    return readEnv("SUPABASE_SERVICE_ROLE_KEY");
  },

  get aiProvider(): string {
    return readEnv("AI_PROVIDER") ?? "mock";
  },

  get anthropicApiKey(): string | undefined {
    return readEnv("ANTHROPIC_API_KEY");
  },

  get anthropicModel(): string {
    return readEnv("ANTHROPIC_MODEL") ?? "claude-sonnet-5";
  },
};

export function hasServiceRole(): boolean {
  return Boolean(serverEnv.supabaseUrl && serverEnv.serviceRoleKey);
}
