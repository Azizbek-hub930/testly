import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/site/legal-page";

const TITLE = "Privacy Policy — Testly";
const DESC = "What Testly collects, why, and how to have it removed.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="August 2026">
      <LegalSection title="What we collect">
        <p>
          <strong className="text-foreground">Early access list.</strong> When you request early
          access we store your name, email address, organization, the role you selected, and the
          date you signed up.
        </p>
        <p>
          <strong className="text-foreground">Account.</strong> If you create an account we store
          your email address, your name, and optionally your organization.
        </p>
        <p>
          <strong className="text-foreground">Source material.</strong> Documents you upload are
          stored privately and are readable only by your own account.
        </p>
        <p>
          <strong className="text-foreground">Generated assessments.</strong> The assessments and
          questions produced from your source material, kept against your account.
        </p>
      </LegalSection>

      <LegalSection title="Why we collect it">
        <p>
          Early-access details let us contact you when access opens and understand which kinds of
          organizations are waiting. Account and document data exist to run the product for you. We
          do not sell personal information, and we do not use it for advertising.
        </p>
      </LegalSection>

      <LegalSection title="Who can see it">
        <p>
          Waitlist entries are visible only to Testly administrators. Your uploaded documents and
          generated questions are visible only to you — access rules are enforced by the database
          itself, not just by the interface.
        </p>
        <p>
          Data is stored with Supabase, our database and file-storage provider, and the site is
          served by Vercel.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          Waitlist entries are kept until early access ends or you ask us to remove yours. Account
          data and uploads are kept until you delete them or close your account.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can ask us to show, correct or delete the personal information we hold about you.
          Deleting your account removes your profile, uploads and generated assessments.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          If this policy changes materially we will update the date at the top of this page and,
          where we have your email address, tell you directly.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
