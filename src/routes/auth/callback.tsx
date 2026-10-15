import type { EmailOtpType } from "@supabase/supabase-js";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { TestlyLogo } from "@/components/brand/testly-mark";
import { Cta } from "@/components/site/cta";
import { TestlyLoader } from "@/components/site/testly-loader";
import { toFriendlyMessage } from "@/lib/errors";
import { goTo, safeRedirect } from "@/lib/navigation";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing you in — Testly" }] }),
  component: AuthCallback,
});

const OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

/**
 * Single landing point for every link Supabase sends back to the app: Google
 * OAuth, email confirmation and password recovery.
 *
 * Supabase can return the result three different ways depending on the flow and
 * the email template, so all three are handled here rather than scattered
 * across the auth screens.
 */
function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("The backend isn't connected yet.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      const supabase = getSupabaseClient();
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const next = safeRedirect(url.searchParams.get("next"), "/admin/waitlist");

      const provider =
        url.searchParams.get("error_description") ??
        hash.get("error_description") ??
        url.searchParams.get("error") ??
        hash.get("error");

      if (provider) {
        if (!cancelled) setError(toFriendlyMessage(new Error(provider), "signin"));
        return;
      }

      try {
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (code) {
          // PKCE: OAuth and the default recovery/confirmation links.
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash && type && OTP_TYPES.includes(type as EmailOtpType)) {
          // Email templates using {{ .TokenHash }}.
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          });
          if (otpError) throw otpError;
        } else if (accessToken && refreshToken) {
          // Older implicit-flow templates return tokens in the URL fragment.
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        } else {
          const { data } = await supabase.auth.getSession();
          if (!data.session) throw new Error("This sign-in link is missing its token.");
        }

        if (!cancelled) goTo(router, next, { replace: true });
      } catch (caught) {
        if (!cancelled) setError(toFriendlyMessage(caught, "signin"));
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center">
            <TestlyLogo />
          </div>
          <h1 className="display mt-8 text-2xl">That link didn't work.</h1>
          <p className="mt-3 text-sm text-muted-foreground">{error}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Cta asChild>
              <Link to="/signin">Back to sign in</Link>
            </Cta>
            <Cta variant="outline" asChild>
              <Link to="/forgot-password">Request a new link</Link>
            </Cta>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-5">
      <TestlyLoader label="Signing you in" />
    </div>
  );
}
