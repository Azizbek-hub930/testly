import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck } from "lucide-react";

import { Reveal } from "@/components/site/reveal";
import { PageHeader, PanelCard } from "@/components/workspace/ui";
import { useAuth } from "@/lib/auth/context";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { user, profile } = useAuth();
  const projectUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
  const projectRef = /^https:\/\/([a-z0-9]+)\.supabase\.co/i.exec(projectUrl)?.[1];

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Testly Admin" title="Settings." />

      <Reveal>
        <PanelCard title="Signed in as">
          <dl className="divide-y divide-hairline">
            <Row label="Name" value={profile?.full_name ?? "—"} />
            <Row label="Email" value={user?.email ?? "—"} />
            <Row label="Role" value={profile?.role ?? "user"} />
          </dl>
        </PanelCard>
      </Reveal>

      <Reveal delay={0.06}>
        <PanelCard title="Project">
          <dl className="divide-y divide-hairline">
            <Row label="Supabase project" value={projectRef ?? "Custom domain"} />
            <Row label="Storage bucket" value="sources (private)" />
          </dl>
          {projectRef ? (
            <div className="border-t border-hairline p-5">
              <a
                href={`https://supabase.com/dashboard/project/${projectRef}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo hover:underline"
              >
                Open Supabase dashboard <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : null}
        </PanelCard>
      </Reveal>

      <Reveal delay={0.1}>
        <PanelCard title="How access is enforced">
          <div className="space-y-4 p-5 text-sm text-muted-foreground">
            <p className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo" />
              <span>
                Every table has Row Level Security enabled. Hiding a link in the interface is never
                what keeps data private — the database refuses the query.
              </span>
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>The public can insert a waitlist entry and read nothing back.</li>
              <li>Only administrators can read, filter or annotate waitlist records.</li>
              <li>Users can reach only their own profile, documents, assessments and questions.</li>
              <li>
                <span className="font-mono text-xs">profiles.role</span> is not writable by any
                signed-in user; a trigger rejects self-promotion outright.
              </li>
              <li>
                Generated questions are written server-side with the service-role key, never by the
                browser.
              </li>
            </ul>
            <p>
              To appoint the first administrator, run{" "}
              <span className="font-mono text-xs">
                supabase/migrations/0004_admin_bootstrap.sql
              </span>{" "}
              in the SQL editor. After that, admins can promote others from the Users page.
            </p>
          </div>
        </PanelCard>
      </Reveal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-3.5">
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="min-w-0 max-w-[60%] break-words text-right text-sm capitalize">{value}</dd>
    </div>
  );
}
