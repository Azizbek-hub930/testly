import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/site/legal-page";

const TITLE = "Terms of Service — Testly";
const DESC = "The terms that apply to Testly early access.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" updated="August 2026">
      <LegalSection title="Early access">
        <p>
          Testly is in early access. Features may change, and availability is not guaranteed while
          we build. We will give notice before any change that would remove your data.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          You are responsible for keeping your password safe and for activity under your account.
          Tell us promptly if you believe someone else has access to it.
        </p>
      </LegalSection>

      <LegalSection title="Your content">
        <p>
          You keep ownership of the source material you upload. You give us permission to process it
          for the sole purpose of generating assessments for you.
        </p>
        <p>
          Only upload material you have the right to use. Do not upload copyrighted exam content you
          are not licensed to reproduce, or documents containing other people's personal
          information.
        </p>
      </LegalSection>

      <LegalSection title="Generated questions">
        <p>
          Questions produced by Testly are original material generated from your source. They are
          practice material: review them before using them with students. Testly is not affiliated
          with, endorsed by, or certified by the College Board, IELTS, the British Council, IDP
          Education or Cambridge Assessment English.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>
          Do not attempt to break, overload or gain unauthorized access to the service, and do not
          use it to produce misleading, harmful or unlawful material.
        </p>
      </LegalSection>

      <LegalSection title="Availability and liability">
        <p>
          During early access the service is provided as is, without warranties. To the extent
          permitted by law, we are not liable for indirect or consequential loss arising from your
          use of it.
        </p>
      </LegalSection>

      <LegalSection title="Ending access">
        <p>
          You can stop using Testly and delete your account at any time. We may suspend accounts
          that breach these terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
