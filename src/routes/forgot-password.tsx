import { Link, createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { AuthError, AuthField, AuthLayout } from "@/components/auth/auth-layout";
import { SuccessCheck } from "@/components/landing/ai-engine";
import { Cta } from "@/components/site/cta";
import { TestlyPulse } from "@/components/site/testly-loader";
import { requestPasswordReset } from "@/lib/auth/actions";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import { fieldErrors, forgotPasswordSchema } from "@/lib/validation";

const TITLE = "Reset your Testly password";
const DESC = "Request a reset link for your Testly workspace account.";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: `${TITLE} — Testly` },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const { configured } = useAuth();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setFormError(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});

    if (!configured) {
      setFormError(toFriendlyMessage(new Error("Supabase is not configured"), "reset"));
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset(parsed.data.email);
      // Shown whether or not the address exists — confirming which emails are
      // registered would leak the user list.
      setSent(true);
    } catch (error) {
      setFormError(toFriendlyMessage(error, "reset"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We'll send a reset link to your work email."
      footer={
        <Link to="/signin" className="font-medium text-indigo hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-indigo/25 bg-indigo/6 p-6">
          <SuccessCheck />
          <div>
            <p className="text-sm font-semibold">Reset link sent.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{email}</span>,
              the link is on its way. Check your inbox for next steps.
            </p>
          </div>
        </div>
      ) : (
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
          <Cta type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <TestlyPulse /> Sending
              </>
            ) : (
              <>
                Send reset link <span aria-hidden>→</span>
              </>
            )}
          </Cta>
        </form>
      )}
    </AuthLayout>
  );
}
