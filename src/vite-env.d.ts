/// <reference types="vite/client" />

/**
 * Public (browser-visible) configuration. Anything declared here is inlined
 * into the client bundle at build time — never add a secret to this list.
 * Server-only values live in `src/server/env.server.ts`.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Optional. Overrides `window.location.origin` for auth redirect links. */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
