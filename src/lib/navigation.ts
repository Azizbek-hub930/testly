import type { AnyRouter } from "@tanstack/react-router";

/** Same-origin absolute pathnames only — no scheme, no host, no query. */
const INTERNAL_PATH = /^\/(?!\/)[\w\-./~]*$/;

/**
 * Redirect targets arrive from the query string, so they are attacker-supplied.
 * Anything that isn't a plain in-app pathname (`//evil.example`, `https://…`,
 * `javascript:…`) falls back to a known-safe route.
 */
export function safeRedirect(value: unknown, fallback = "/admin/waitlist"): string {
  if (typeof value !== "string" || value.length === 0) return fallback;
  if (!INTERNAL_PATH.test(value)) return fallback;
  return value;
}

/**
 * Navigate to a path only known at runtime.
 *
 * TanStack Router types `to` as a union of the routes it generated, which a
 * string read from the URL can never satisfy. Values are validated by
 * `safeRedirect` before they get here; this is the single place that casts.
 */
export function goTo(
  router: AnyRouter,
  to: string,
  options?: { replace?: boolean; search?: Record<string, string> },
) {
  void router.navigate({
    to,
    replace: options?.replace ?? false,
    ...(options?.search ? { search: options.search } : {}),
  } as never);
}
