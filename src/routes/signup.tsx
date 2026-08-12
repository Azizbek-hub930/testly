import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { AuthError, AuthField, AuthLayout, GoogleButton } from "@/components/auth/auth-layout";
import { SuccessCheck } from "@/components/landing/ai-engine";
import { Cta } from "@/components/site/cta";
import { TestlyPulse } from "@/components/site/testly-loader";
import { signInWithGoogle, signUpWithPassword } from "@/lib/auth/actions";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import { goTo, safeRedirect } from "@/lib/navigation";
import { fieldErrors, signUpSchema } from "@/lib/validation";

const TITLE = "Create your Testly account";
const DESC = "Start generating original SAT and IELTS practice material with Testly.";

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = search["redirect"];
    return typeof redirect === "string" ? { redirect } : {};
  },
  head: () => ({
    meta: [
      { title: `${TITLE} — Testly` },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const router = useRouter();
  const search = Route.useSearch();
  const { status, configured } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const destination = safeRedirect(search.redirect);

  useEffect(() => {
    if (status === "authenticated" && !confirmSent) {
      goTo(router, destination, { replace: true });
    }
  }, [status, router, destination, confirmSent]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setFormError(null);
    const parsed = signUpSchema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});

    if (!configured) {
      setFormError(toFriendlyMessage(new Error("Supabase is not configured"), "signup"));
      return;
    }

    setSubmitting(true);
    try {
      const { sessionReady } = await signUpWithPassword(parsed.data);
      if (sessionReady) {
        goTo(router, destination, { replace: true });
        return;
      }
      // Email confirmation is switched on for this project.
      setConfirmSent(true);
      setSubmitting(false);
    } catch (error) {
      setFormError(toFriendlyMessage(error, "signup"));
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    setFormError(null);
    if (!configured) {
      setFormError(toFriendlyMessage(new Error("Supabase is not configured"), "signup"));
      return;
    }
    setGoogleLoading(true);
    try {
      await signInWithGoogle(destination);
    } catch (error) {
      setFormError(toFriendlyMessage(error, "signup"));
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title={confirmSent ? "Check your email" : "Create account"}
      subtitle={
        confirmSent
          ? "One link stands between you and your workspace."
          : "Set up your workspace in under a minute."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link to="/signin" className="font-medium text-indigo hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {confirmSent ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-indigo/25 bg-indigo/6 p-6">
          <SuccessCheck />
          <div>
            <p className="text-sm font-semibold">Confirmation link sent.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We sent a link to <span className="font-medium text-foreground">{email}</span>. Open
              it to activate your Testly account.
            </p>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {formError ? <AuthError message={formError} /> : null}
          <AuthField
            label="Name"
            name="name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            error={errors["fullName"]}
            disabled={submitting}
          />
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors["password"]}
            disabled={submitting}
          />
          <Cta type="submit" size="lg" variant="accent" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <TestlyPulse /> Creating account
              </>
            ) : (
              <>
                Create Account <span aria-hidden>→</span>
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
          <p className="pt-1 text-xs text-muted-foreground">
            By creating an account you agree to our{" "}
            <Link to="/terms" className="text-indigo hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-indigo hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
