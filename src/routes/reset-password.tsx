import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthError, AuthField, AuthLayout } from "@/components/auth/auth-layout";
import { Cta } from "@/components/site/cta";
import { TestlyLoader, TestlyPulse } from "@/components/site/testly-loader";
import { updatePassword } from "@/lib/auth/actions";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import { goTo } from "@/lib/navigation";
import { fieldErrors, resetPasswordSchema } from "@/lib/validation";

const TITLE = "Choose a new password";
const DESC = "Set a new password for your Testly account.";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: `${TITLE} — Testly` },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const router = useRouter();
  const { status } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setFormError(null);
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      await updatePassword(parsed.data.password);
      toast.success("Password updated.");
      goTo(router, "/dashboard", { replace: true });
    } catch (error) {
      setFormError(toFriendlyMessage(error, "reset"));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="New password"
      subtitle="Pick something you haven't used before."
      footer={
        <Link to="/signin" className="font-medium text-indigo hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      {status === "loading" ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <TestlyLoader label="Checking your link" size="sm" />
        </div>
      ) : status === "unauthenticated" ? (
        // Reaching this screen without a recovery session means the link was
        // already used, expired, or opened in a different browser.
        <div className="space-y-5">
          <AuthError message="This reset link has expired or was already used." />
          <Cta size="lg" className="w-full" asChild>
            <Link to="/forgot-password">
              Request a new link <span aria-hidden>→</span>
            </Link>
          </Cta>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {formError ? <AuthError message={formError} /> : null}
          <AuthField
            label="New password"
            id="new-password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors["password"]}
            disabled={submitting}
          />
          <AuthField
            label="Confirm password"
            id="confirm-password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={errors["confirmPassword"]}
            disabled={submitting}
          />
          <Cta type="submit" size="lg" variant="accent" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <TestlyPulse /> Updating
              </>
            ) : (
              <>
                Update password <span aria-hidden>→</span>
              </>
            )}
          </Cta>
        </form>
      )}
    </AuthLayout>
  );
}
