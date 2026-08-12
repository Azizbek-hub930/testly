import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { SuccessCheck } from "@/components/landing/ai-engine";
import { Cta } from "@/components/site/cta";
import { Reveal } from "@/components/site/reveal";
import { TestlyPulse } from "@/components/site/testly-loader";
import { toFriendlyMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { fieldErrors, WAITLIST_ROLES, waitlistSchema } from "@/lib/validation";
import { joinWaitlist, type JoinResult } from "@/lib/waitlist";

const ROLES = WAITLIST_ROLES;

export function Waitlist() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<string>(ROLES[0]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<JoinResult | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setFormError(null);
    const parsed = waitlistSchema.safeParse({
      name,
      email,
      organization,
      role,
      source: "landing",
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const result = await joinWaitlist(parsed.data);
      setDone(result);
      toast.success(
        result === "joined"
          ? "You're on the Testly waitlist."
          : "You're already on the Testly waitlist.",
      );
    } catch (error) {
      const message = toFriendlyMessage(error, "waitlist");
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="early-access" className="scroll-mt-24 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-surface">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="border-b border-border p-8 sm:p-12 lg:border-b-0 lg:border-r">
              <Reveal>
                <p className="eyebrow text-indigo">Early access</p>
                <h2 className="display mt-5 text-3xl sm:text-[2.75rem]">
                  Be first to build
                  <br />
                  with Testly.
                </h2>
                <p className="mt-5 max-w-sm text-sm text-muted-foreground">
                  We're opening early access to learning centers, tutors, and educational
                  organizations.
                </p>
              </Reveal>
            </div>

            <div className="p-8 sm:p-12">
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex min-h-[320px] flex-col items-center justify-center text-center"
                  >
                    <SuccessCheck />
                    <p className="mt-5 text-lg font-semibold">
                      {done === "joined" ? "You're on the list." : "You're already on the list."}
                    </p>
                    <p className="mt-2 max-w-[30ch] text-sm text-muted-foreground">
                      {done === "joined"
                        ? "We'll reach out as soon as your access opens."
                        : "This email is already on the Testly waitlist. We'll be in touch."}
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={onSubmit}
                    noValidate
                    className="space-y-4"
                  >
                    {formError ? (
                      <div
                        role="alert"
                        className="rounded-xl border border-destructive/25 bg-destructive/8 px-3.5 py-3 text-sm text-destructive"
                      >
                        {formError}
                      </div>
                    ) : null}
                    <TextField
                      label="Name"
                      placeholder="Ada Lovelace"
                      autoComplete="name"
                      value={name}
                      onChange={setName}
                      error={errors["name"]}
                      disabled={submitting}
                    />
                    <TextField
                      label="Work email"
                      type="email"
                      placeholder="ada@center.edu"
                      autoComplete="email"
                      value={email}
                      onChange={setEmail}
                      error={errors["email"]}
                      disabled={submitting}
                    />
                    <TextField
                      label="Organization"
                      placeholder="Bright Learning"
                      autoComplete="organization"
                      value={organization}
                      onChange={setOrganization}
                      error={errors["organization"]}
                      disabled={submitting}
                    />
                    <div>
                      <label htmlFor="role" className="eyebrow mb-2 block text-muted-foreground">
                        Role
                      </label>
                      <select
                        id="role"
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                        disabled={submitting}
                        className="h-11 w-full appearance-none rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-shadow focus:border-indigo/50 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--indigo)_14%,transparent)] disabled:opacity-60"
                      >
                        {ROLES.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                      {errors["role"] ? (
                        <p className="mt-2 text-xs text-destructive">{errors["role"]}</p>
                      ) : null}
                    </div>
                    <Cta
                      type="submit"
                      variant="accent"
                      size="lg"
                      className="mt-2 w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <TestlyPulse /> Adding you
                        </>
                      ) : (
                        <>
                          Request Early Access <span aria-hidden>→</span>
                        </>
                      )}
                    </Cta>
                    <p className="pt-1 text-center text-xs text-muted-foreground">
                      We only use these details to contact you about early access.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TextField({
  label,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
  error,
  disabled,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  disabled?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-indigo/50 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--indigo)_14%,transparent)] disabled:opacity-60",
          error &&
            "border-destructive/60 focus:border-destructive/70 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--destructive)_12%,transparent)]",
        )}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
