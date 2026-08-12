import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthField } from "@/components/auth/auth-layout";
import { Cta } from "@/components/site/cta";
import { Reveal } from "@/components/site/reveal";
import { TestlyPulse } from "@/components/site/testly-loader";
import { PageHeader, PanelCard } from "@/components/workspace/ui";
import { updateProfile } from "@/lib/auth/actions";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import { fieldErrors, profileSchema } from "@/lib/validation";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile, refreshProfile, isAdmin } = useAuth();

  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Seed the form once the profile arrives, then leave the user's edits alone.
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setOrganization(profile.organization ?? "");
  }, [profile]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;

    const parsed = profileSchema.safeParse({ fullName, organization });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSaving(true);

    try {
      await updateProfile(parsed.data);
      await refreshProfile();
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(toFriendlyMessage(error, "profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Settings" title="Your account." />

      <Reveal>
        <PanelCard title="Profile">
          <form className="space-y-4 p-5" onSubmit={onSubmit} noValidate>
            <AuthField
              label="Name"
              id="profile-name"
              placeholder="Ada Lovelace"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              error={errors["fullName"]}
              disabled={saving}
            />
            <AuthField
              label="Organization"
              id="profile-organization"
              placeholder="Bright Learning"
              autoComplete="organization"
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
              error={errors["organization"]}
              disabled={saving}
            />
            <div>
              <p className="eyebrow mb-2 text-muted-foreground">Email</p>
              <p className="flex h-11 items-center rounded-xl border border-border bg-muted/50 px-3.5 text-sm text-muted-foreground">
                {user?.email}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Your email is managed by your sign-in method and can't be changed here.
              </p>
            </div>
            <Cta type="submit" size="md" disabled={saving}>
              {saving ? (
                <>
                  <TestlyPulse /> Saving
                </>
              ) : (
                "Save changes"
              )}
            </Cta>
          </form>
        </PanelCard>
      </Reveal>

      <Reveal delay={0.06}>
        <PanelCard title="Access">
          <div className="space-y-3 p-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize">{profile?.role ?? "user"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Roles are set in the database and can't be changed from the app.
            </p>
            {isAdmin ? (
              <Cta size="sm" variant="outline" asChild>
                <Link to="/admin">Open admin panel</Link>
              </Cta>
            ) : null}
          </div>
        </PanelCard>
      </Reveal>

      <Reveal delay={0.1}>
        <PanelCard title="Password">
          <div className="space-y-3 p-5 text-sm">
            <p className="text-muted-foreground">
              Send yourself a reset link to choose a new password.
            </p>
            <Cta size="sm" variant="outline" asChild>
              <Link to="/forgot-password">Reset password</Link>
            </Cta>
          </div>
        </PanelCard>
      </Reveal>
    </div>
  );
}
