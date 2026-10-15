import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { AuthError, AuthField, AuthLayout, GoogleButton } from "@/components/auth/auth-layout";
import { Cta } from "@/components/site/cta";
import { TestlyPulse } from "@/components/site/testly-loader";
import { signInWithGoogle, signInWithPassword } from "@/lib/auth/actions";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import { goTo, safeRedirect } from "@/lib/navigation";
import { fieldErrors, signInSchema } from "@/lib/validation";

const TITLE = "Sign in to Testly";
const DESC = "Access your Testly workspace and generate SAT and IELTS assessments.";

export const Route = createFileRoute("/signin")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = search["redirect"];
    return typeof redirect === "string" ? { redirect } : {};
  },
  head: () => ({
    meta: [
      { title: `${TITLE} — AI assessment engine` },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const router = useRouter();
  const search = Route.useSearch();
  const { status, configured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const destination = safeRedirect(search.redirect);

  // Someone who is already signed in has no business on this screen.
  useEffect(() => {
    if (status === "authenticated") goTo(router, destination, { replace: true });
  }, [status, router, destination]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setFormError(null);
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});

    if (!configured) {
      setFormError(toFriendlyMessage(new Error("Supabase is not configured"), "signin"));
      return;
    }

    setSubmitting(true);
    try {
      await signInWithPassword(parsed.data);
      goTo(router, destination, { replace: true });
    } catch (error) {
      setFormError(toFriendlyMessage(error, "signin"));
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    setFormError(null);
    if (!configured) {
      setFormError(toFriendlyMessage(new Error("Supabase is not configured"), "signin"));
      return;
    }
    setGoogleLoading(true);
    try {
      // Leaves the page for Google's consent screen and returns to /auth/callback.
      await signInWithGoogle(destination);
    } catch (error) {
      setFormError(toFriendlyMessage(error, "signin"));
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Admin access to the Testly waitlist."
      footer={
        <Link to="/" className="font-medium text-indigo hover:underline">
          Back to Testly
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {formError ? <AuthError message={formError} /> : null}
        <AuthField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@center.edu"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors["email"]}
          disabled={submitting}
        />
        <AuthField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors["password"]}
          disabled={submitting}
          action={
            <Link to="/forgot-password" className="text-xs font-medium text-indigo hover:underline">
              Forgot?
            </Link>
          }
        />
        <Cta type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <TestlyPulse /> Signing in
            </>
          ) : (
            <>
              Sign In <span aria-hidden>→</span>
            </>
          )}
        </Cta>
        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleButton
          label="Continue with Google"
          onClick={onGoogle}
          loading={googleLoading}
          disabled={submitting}
        />
      </form>
    </AuthLayout>
  );
}
