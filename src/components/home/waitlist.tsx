import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { useState, type FormEvent, type MouseEventHandler, type ReactNode } from "react";
import { toast } from "sonner";

import { Button, EASE, Tick } from "@/components/home/ui";
import { toFriendlyMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import {
  fieldErrors,
  WAITLIST_EXAMS,
  WAITLIST_ROLES,
  WAITLIST_SIZE_QUESTION,
  waitlistSchema,
  type WaitlistRole,
} from "@/lib/validation";
import { joinWaitlist, type JoinResult } from "@/lib/waitlist";

/*
 * The waitlist lives on its own page (/waitlist). Every call to action on
 * the landing page links there, optionally pre-selecting the audience via
 * `?role=`. Submissions go to the Supabase `waitlist` table (insert-only for
 * the public; readable in /admin/waitlist), and the team then reaches out
 * to each applicant personally.
 */

/** Link to the waitlist page, optionally pre-selecting an audience. */
export function WaitlistLink({
  role,
  className,
  children,
  onClick,
}: {
  role?: WaitlistRole;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      to="/waitlist"
      search={role ? { role } : {}}
      className={className}
      {...(onClick ? { onClick } : {})}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */

const STEP_ONE_FIELDS = ["role", "name", "email", "phone"] as const;

export function WaitlistForm({ preset }: { preset: WaitlistRole | null }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRoleState] = useState<WaitlistRole | "">(preset ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [telegram, setTelegram] = useState("");
  const [organization, setOrganization] = useState("");
  const [city, setCity] = useState("");
  const [students, setStudents] = useState<string | null>(null);
  const [website, setWebsite] = useState("");

  // The size question differs per role, so a previous answer can't carry over.
  const setRole = (next: WaitlistRole) => {
    if (next !== role) setStudents(null);
    setRoleState(next);
  };
  const sizeQuestion = role ? WAITLIST_SIZE_QUESTION[role] : undefined;
  const isIndividual = role === "Private tutor" || role === "Other";
  const [exams, setExams] = useState<(typeof WAITLIST_EXAMS)[number][]>([]);
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<JoinResult | null>(null);

  const values = () => ({
    role,
    name,
    email,
    phone,
    telegram,
    organization,
    city,
    students: sizeQuestion ? students : null,
    website: role === "Web host startup" ? website : "",
    exams,
    message,
    source: "landing",
  });

  const next = () => {
    const parsed = waitlistSchema.safeParse(values());
    const errs = parsed.success ? {} : fieldErrors(parsed.error);
    const stepOne = Object.fromEntries(
      Object.entries(errs).filter(([k]) => (STEP_ONE_FIELDS as readonly string[]).includes(k)),
    );
    setErrors(stepOne);
    if (Object.keys(stepOne).length === 0) setStep(2);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step === 1) {
      next();
      return;
    }
    if (submitting) return;
    if (!isIndividual && !organization.trim()) {
      setErrors({ organization: "Please add the name so we know who to contact." });
      return;
    }
    const parsed = waitlistSchema.safeParse(values());
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      if (STEP_ONE_FIELDS.some((f) => errs[f])) setStep(1);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await joinWaitlist(parsed.data);
      setDone(result);
    } catch (error) {
      toast.error(toFriendlyMessage(error, "waitlist"));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExam = (exam: (typeof WAITLIST_EXAMS)[number]) =>
    setExams((list) => (list.includes(exam) ? list.filter((e) => e !== exam) : [...list, exam]));

  const orgLabel =
    role === "Private tutor"
      ? "Brand or teaching name (optional)"
      : role === "Web host startup"
        ? "Company / platform name"
        : role === "School or institution"
          ? "School or institution name"
          : role === "Learning center"
            ? "Center name"
            : "Organization (optional)";
  const examsLabel = isIndividual ? "Exams you teach" : "Exams you prepare students for";

  const steps = ["About you", "Your work"] as const;

  return (
    <div className="px-6 pb-8 pt-7 sm:px-10 sm:pb-10 sm:pt-9">
      {/* Stepper */}
      {!done && (
        <div className="flex items-center gap-3" aria-label={`Step ${step} of 2`}>
          {steps.map((label, i) => {
            const n = i + 1;
            const state = n < step ? "done" : n === step ? "active" : "todo";
            return (
              <div key={label} className="flex flex-1 items-center gap-3">
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold transition-colors duration-300",
                    state === "todo"
                      ? "border border-white/15 text-mist"
                      : "bg-[linear-gradient(180deg,#8f6dff,#6a45ea)] text-[#fff] shadow-[0_6px_18px_-6px_rgb(121_82_246/0.9)]",
                  )}
                >
                  {state === "done" ? <CheckIcon /> : n}
                </span>
                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    state === "todo" ? "text-mist/70" : "text-snow",
                  )}
                >
                  {label}
                </span>
                {i === 0 && (
                  <span className="relative ml-1 h-px flex-1 overflow-hidden bg-white/10">
                    <motion.span
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet to-violet-soft"
                      animate={{ width: step === 2 ? "100%" : "0%" }}
                      transition={{ duration: 0.45, ease: EASE }}
                    />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex min-h-[320px] flex-col items-center justify-center py-6 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
            >
              <Tick className="h-16 w-16 text-[#5ee0a0] drop-shadow-[0_0_24px_rgb(94_224_160/0.5)]" />
            </motion.span>
            <h2 className="font-display mt-6 text-[1.75rem] text-snow">
              {done === "joined" ? `Thank you, ${name.split(" ")[0]}!` : "You're already with us."}
            </h2>
            <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-mist">
              {done === "joined"
                ? "You're on the Testly waitlist. Our team will reach out to you personally about early-partner access."
                : "This email is already on the Testly waitlist — we'll be in touch personally."}
            </p>
            <Button variant="glass" className="mt-8" asChild>
              <Link to="/">Back to the homepage</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key={`step-${step}`}
            initial={{ opacity: 0, x: step === 1 ? -14 : 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === 1 ? -14 : 14 }}
            transition={{ duration: 0.28, ease: EASE }}
            onSubmit={submit}
            noValidate
            className="mt-8"
          >
            <h2 className="font-display text-[1.6rem] leading-tight text-snow sm:text-[1.9rem]">
              {step === 1 ? "Tell us about you." : "Tell us about your work."}
            </h2>
            <p className="mt-2 text-[15px] text-mist">
              {step === 1
                ? "So we know who's joining and how to reach you."
                : "A few details help us prepare the right setup for you."}
            </p>

            <div className="mt-7 space-y-5">
              {step === 1 ? (
                <>
                  <fieldset>
                    <legend className="mb-3 text-[13px] text-mist">I am a…</legend>
                    <div className="flex flex-wrap gap-2">
                      {WAITLIST_ROLES.map((r) => (
                        <Pill key={r} name="role" active={role === r} onSelect={() => setRole(r)}>
                          {r}
                        </Pill>
                      ))}
                    </div>
                    <FieldError message={errors["role"]} />
                  </fieldset>
                  <Field
                    id="wl-name"
                    label="Full name"
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                    error={errors["name"]}
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="wl-email"
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                      error={errors["email"]}
                    />
                    <Field
                      id="wl-phone"
                      label="Phone"
                      type="tel"
                      value={phone}
                      onChange={setPhone}
                      autoComplete="tel"
                      error={errors["phone"]}
                    />
                  </div>
                  <Field
                    id="wl-telegram"
                    label="Telegram (optional)"
                    value={telegram}
                    onChange={setTelegram}
                    placeholder="@username"
                    error={errors["telegram"]}
                  />
                </>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="wl-org"
                      label={orgLabel}
                      value={organization}
                      onChange={setOrganization}
                      autoComplete="organization"
                      error={errors["organization"]}
                    />
                    {role === "Web host startup" ? (
                      <Field
                        id="wl-website"
                        label="Website (optional)"
                        type="url"
                        value={website}
                        onChange={setWebsite}
                        autoComplete="url"
                        placeholder="yourplatform.uz"
                        error={errors["website"]}
                      />
                    ) : (
                      <Field
                        id="wl-city"
                        label="City (optional)"
                        value={city}
                        onChange={setCity}
                        autoComplete="address-level2"
                        placeholder="Tashkent"
                        error={errors["city"]}
                      />
                    )}
                  </div>
                  {sizeQuestion ? (
                    <fieldset>
                      <legend className="mb-3 text-[13px] text-mist">{sizeQuestion.label}</legend>
                      <div className="flex flex-wrap gap-2">
                        {sizeQuestion.options.map((r) => (
                          <Pill
                            key={r}
                            name="students"
                            active={students === r}
                            onSelect={() => setStudents(r)}
                          >
                            {r}
                          </Pill>
                        ))}
                      </div>
                    </fieldset>
                  ) : null}
                  <fieldset>
                    <legend className="mb-3 text-[13px] text-mist">{examsLabel}</legend>
                    <div className="flex flex-wrap gap-2">
                      {WAITLIST_EXAMS.map((ex) => (
                        <Pill
                          key={ex}
                          multi
                          active={exams.includes(ex)}
                          onSelect={() => toggleExam(ex)}
                        >
                          {ex}
                        </Pill>
                      ))}
                    </div>
                  </fieldset>
                  <Field
                    id="wl-message"
                    label="What should Testly help you with? (optional)"
                    value={message}
                    onChange={setMessage}
                    multiline
                    placeholder={
                      isIndividual
                        ? "e.g. practice sets for my SAT students"
                        : role === "Web host startup"
                          ? "e.g. fresh IELTS Reading content for our platform"
                          : "e.g. weekly IELTS Reading mocks for 6 groups"
                    }
                    error={errors["message"]}
                  />
                </>
              )}
            </div>

            <div className="mt-8 flex items-center gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="glass"
                  size="lg"
                  className="px-5"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
                {step === 1 ? (
                  <>
                    Continue <span aria-hidden>→</span>
                  </>
                ) : submitting ? (
                  "Sending…"
                ) : (
                  <>
                    Join the waitlist <span aria-hidden>→</span>
                  </>
                )}
              </Button>
            </div>
            <p className="mt-4 text-center text-xs text-mist/70">
              We only use these details to contact you about Testly.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M3.5 8.5l3 3 6-6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A text field with its label sitting inside the box, above the value. */
function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  multiline = false,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string | undefined;
  multiline?: boolean;
}) {
  const box = cn(
    "group relative rounded-2xl border bg-white/[0.03] transition-[border-color,background-color,box-shadow] duration-200 focus-within:border-violet-soft/70 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_0_4px_rgb(121_82_246/0.16)]",
    error ? "border-coral/60" : "border-white/10 hover:border-white/20",
  );
  const input =
    "w-full bg-transparent px-4 pb-3 pt-7 text-[15px] text-snow outline-none placeholder:text-mist/40";
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div>
      <div className={box}>
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-2.5 text-[12px] text-mist transition-colors group-focus-within:text-violet-soft"
        >
          {label}
        </label>
        {multiline ? (
          <textarea
            id={id}
            value={value}
            rows={3}
            maxLength={1000}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(input, "resize-none")}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            placeholder={placeholder}
            autoComplete={autoComplete}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(input, "h-[60px]")}
          />
        )}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id?: string; message?: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 pl-1 text-xs text-[#ffb4aa]">
      {message}
    </p>
  );
}

/** A rounded choice pill (radio or checkbox). */
function Pill({
  children,
  active,
  onSelect,
  name,
  multi = false,
}: {
  children: ReactNode;
  active: boolean;
  onSelect: () => void;
  name?: string;
  multi?: boolean;
}) {
  return (
    <label
      className={cn(
        "inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-[14px] transition-[background-color,border-color,color,box-shadow] duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-violet-soft",
        active
          ? "border-transparent bg-[linear-gradient(180deg,#8f6dff,#6a45ea)] text-[#fff] shadow-[0_8px_22px_-10px_rgb(121_82_246/0.95)]"
          : "border-white/10 bg-white/[0.03] text-snow/80 hover:border-white/25 hover:text-snow",
      )}
    >
      <input
        type={multi ? "checkbox" : "radio"}
        name={name}
        checked={active}
        onChange={onSelect}
        className="sr-only"
      />
      {active && <CheckIcon />}
      {children}
    </label>
  );
}
