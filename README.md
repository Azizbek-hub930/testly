# Testly

AI-powered assessment generation for the SAT and IELTS. Upload source material,
choose the exam shape, and Testly produces original practice questions.

This repository contains the marketing site, the authenticated workspace, and a
protected admin panel, backed by Supabase (Postgres, Auth, Storage) and deployed
to Vercel.

---

## Contents

1. [Local setup](#1-local-setup)
2. [Supabase setup](#2-supabase-setup)
3. [Environment variables](#3-environment-variables)
4. [Database migrations](#4-database-migrations)
5. [Storage setup](#5-storage-setup)
6. [Admin setup](#6-admin-setup)
7. [Before real users arrive](#7-before-real-users-arrive)
8. [Vercel deployment](#8-vercel-deployment)
9. [Production environment variables](#9-production-environment-variables)
10. [How it fits together](#10-how-it-fits-together)
11. [Security model](#11-security-model)
12. [Connecting a real AI provider](#12-connecting-a-real-ai-provider)

---

## 1. Local setup

Requires [Bun](https://bun.sh) (the lockfile is `bun.lock`). npm works too, but
it will create a second lockfile — delete `package-lock.json` before committing.

```bash
bun install
cp .env.example .env      # then fill in the Supabase values
bun run dev
```

The app runs at the URL printed by Vite — normally http://localhost:8080.

| Script | What it does |
| --- | --- |
| `bun run dev` | Dev server with HMR |
| `bun run build` | Production build into `.output/` |
| `bun run preview` | Serve the production build locally |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | ESLint + Prettier |

Without Supabase credentials the landing page still renders; anything that needs
a backend explains that it isn't connected instead of failing silently.

---

## 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. **Project Settings → API** — copy the *Project URL* and the *anon* key into
   your `.env` (see below).
3. **Authentication → Providers → Email** — leave enabled. Decide whether
   "Confirm email" is on; the signup screen handles both cases.
4. **Authentication → URL Configuration**:
   - *Site URL*: `http://localhost:8080` for development, your production
     domain once deployed.
   - *Redirect URLs*: add every origin the app runs on, with the callback path:
     ```
     http://localhost:8080/auth/callback
     https://your-domain.com/auth/callback
     https://*.vercel.app/auth/callback
     ```
     Sign-in, email confirmation and password resets all return through
     `/auth/callback`.
5. **Google sign-in (optional)** — *Authentication → Providers → Google*: enable
   it and paste your Google OAuth client ID and secret. In the Google Cloud
   console, the authorised redirect URI is
   `https://<project-ref>.supabase.co/auth/v1/callback`. Until you do this, the
   Google buttons return a clear "Google sign-in isn't enabled" message.

---

## 3. Environment variables

Copy `.env.example` to `.env` and fill it in. The full list lives there with
comments; the short version:

| Variable | Where | Required | Purpose |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | client + server | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | client + server | ✅ | Public anon key |
| `VITE_SITE_URL` | client | — | Forces one origin for auth redirects; defaults to the current origin |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | recommended | Generation and admin role changes |
| `AI_PROVIDER` | server only | — | `mock` (default) or a registered provider |
| `ANTHROPIC_API_KEY` | server only | — | Only when `AI_PROVIDER=anthropic` |

**Anything prefixed `VITE_` is compiled into the browser bundle and is public.**
The anon key is designed for that — Row Level Security is what protects the
data. The service-role key bypasses RLS entirely and must never carry a `VITE_`
prefix or be imported by a component.

Without `SUPABASE_SERVICE_ROLE_KEY`, everything still runs except question
generation and promoting users to admin, both of which say so plainly.

---

## 4. Database migrations

The schema lives in `supabase/migrations/`. Run the files **in order** — paste
each into the Supabase SQL editor (*SQL Editor → New query*) and run it, or use
`supabase db push` if you have the CLI linked.

| File | What it creates |
| --- | --- |
| `0001_core.sql` | `profiles`, `waitlist`, `is_admin()`, the role-escalation guard, the `auth.users` → `profiles` trigger, RLS policies, column grants |
| `0002_product.sql` | `documents`, `assessments`, `questions`, their RLS policies and grants |
| `0003_storage.sql` | The private `sources` bucket (policies are added in the dashboard — see `supabase/STORAGE_SETUP.md`) |
| `0004_admin_bootstrap.sql` | Appoints your first administrator (see §6) |
| `0005_admin_stats.sql` | `waitlist_stats()` for the admin overview |

Every file is idempotent, so re-running one is safe.

**Storage policies are not created by SQL.** On a managed project,
`storage.objects` is owned by `supabase_storage_admin`; PostgreSQL only lets a
table's owner create policies on it, and `postgres` may not assume that role.
`0003_storage.sql` therefore creates the bucket only, and the access policy is
created in the dashboard — see **`supabase/STORAGE_SETUP.md`**. That is
Supabase's supported route, not a workaround.

The TypeScript mirror of this schema is `src/lib/supabase/types.ts`. If you
change a migration, update that file in the same commit, or regenerate it:

```bash
supabase gen types typescript --project-id <project-ref> > src/lib/supabase/types.ts
```

---

## 5. Storage setup and PDF indexing

`0003_storage.sql` creates a **private** bucket called `sources`:

- 20 MB per file, `application/pdf` only (enforced by the bucket, and again by
  the `documents` table's CHECK constraints)
- Files are stored at `sources/<user-id>/<document-id>.pdf`
- Policies key off that first path segment, so a user can only read, write or
  delete inside their own folder

Downloads use short-lived signed URLs; nothing in the bucket is publicly
reachable. Uploads go through a signed upload URL so the progress bar reflects
real bytes transferred.

**Indexing.** Once the bytes are stored, the document moves `uploading` →
`processing` → `ready`: the `extractDocumentText` server function downloads the
file with the service-role key, parses it with `unpdf`, and writes the text to
`documents.extracted_text` (capped at 200,000 characters). The parser is bundled
into the server function only — it never reaches the browser.

A PDF with no text layer — a scan — is marked `failed` with *"No selectable text
found"* rather than accepted, so it is never offered as a source for generation.
With no service-role key configured, extraction is skipped and the document is
marked `ready` unindexed; the file stays usable.

---

## 6. Admin setup

There is no way to become an admin from inside the application. `profiles.role`
is not in the column grants handed to signed-in users, and a trigger rejects
self-promotion even if a grant were wrong. The only paths are a direct SQL
session or the service-role key.

**To appoint the first administrator:**

1. Sign up normally at `/signup` (or create the user in *Authentication →
   Users*).
2. Open `supabase/migrations/0004_admin_bootstrap.sql`, set `admin_email` to
   that address, and run it in the SQL editor.
3. Sign out and back in. `/admin` is now available.

The file currently names `azizbekboyxorozov2010@gmail.com`.

After that, an admin can promote or demote others from **/admin/users**. That
action runs server-side, re-checks the caller's role against the database, and
refuses to remove the last remaining administrator.

---

## 7. Before real users arrive

Two Supabase settings that can only be changed in the dashboard. Neither blocks
deployment, but the second one matters as soon as anyone other than you signs up.

**Email confirmation.** *Authentication → Providers → Email → "Confirm email".*
Leave it on for real users. Turning it off while testing makes signup instant and
avoids the email step entirely; the signup screen handles both settings.

**Custom SMTP — before inviting real users.** *Authentication → Emails → SMTP
Settings.* Supabase's built-in sender allows only a couple of messages per hour
and is documented as test-only, so **password reset is unreliable until you
connect a real provider**. Nothing in this codebase changes — Supabase sends the
mail, the app only asks it to.

What this does and doesn't require:

- **No payment.** Free tiers on Brevo, Resend, SendGrid and similar are far above
  what an early-access product sends. Check current limits before choosing.
- **No domain.** Most providers let you verify a single sender address — your own
  Gmail, for instance — instead of a whole domain. Sending from your own domain
  improves deliverability, but is not needed to make reset links work.
- **Not related to hosting.** Vercel supplies the site's web address
  (`*.vercel.app`, or a custom domain if you add one). It does not send email,
  and email cannot be sent from a `*.vercel.app` address, because sending needs
  DNS records on a domain you control.

With "Confirm email" off, signup needs no email at all — password reset is the
only feature waiting on this.

---

## 8. Vercel deployment

1. Push this repository to GitHub.
2. In Vercel, **Add New → Project** and import it. The framework is detected
   automatically; leave the build command as `bun run build` (or
   `npm run build`) and the output directory unset — Nitro writes `.output/`
   and Vercel picks it up.
3. Add the environment variables from §9 and deploy.
4. Back in Supabase → *Authentication → URL Configuration*, set the Site URL to
   your production domain and add `https://your-domain.com/auth/callback` (plus
   `https://*.vercel.app/auth/callback` if you want preview deployments to be
   able to sign in).

The build target is auto-detected: Nitro sees Vercel's environment and produces
a Vercel build automatically.
Nothing in `vite.config.ts` needs to change. To pin it explicitly from your own
CI, set `NITRO_PRESET=vercel`.

---

## 9. Production environment variables

In Vercel → *Settings → Environment Variables*:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
AI_PROVIDER=mock
```

Add `VITE_SITE_URL=https://your-domain.com` only if you want auth links to
always point at one canonical origin (leaving it unset lets preview deployments
work). Add `ANTHROPIC_API_KEY` when you connect a real provider.

Mark `SUPABASE_SERVICE_ROLE_KEY` and any provider key as available to
**Production** (and Preview if you use it) — never expose them to the client by
renaming them with a `VITE_` prefix.

---

## 10. How it fits together

```
src/
  routes/                 file-based routes (TanStack Start)
    index.tsx             landing page — design is frozen
    signin • signup • forgot-password • reset-password • auth/callback
    privacy • terms
    dashboard.tsx         authenticated shell (RequireAuth)
      dashboard/          overview, sources, assessments, settings
    admin.tsx             admin shell (RequireAdmin)
      admin/              overview, waitlist, users, settings
  components/
    landing/ site/ brand/ ui/     the approved design system
    auth/                 auth provider + route guards
    workspace/            sidebar shell, uploader, generation progress
  lib/
    api/                  typed data access (documents, assessments, admin)
    auth/                 session context and auth actions
    supabase/             browser client + database types
    exams.ts              SAT/IELTS catalogue — one place to add a section
    validation.ts         Zod schemas shared by forms and the server
    errors.ts             every failure → one human sentence
  rpc/                    server functions callable from the browser
  server/                 server-only: service-role client, env, AI service
supabase/migrations/      the database, in order
```

**Data flow.** The browser talks to Supabase directly with the anon key for
everything RLS can express. Two operations need more authority and therefore run
as server functions in `src/rpc/`: generating questions, and changing a user's
role. Both receive the caller's access token, verify it server-side, and only
then use the service-role client.

**Exam configuration.** `src/lib/exams.ts` defines both exams: SAT (Reading and
Writing, Math) and IELTS Reading with its 13/27/40-question shapes mapped to
1/2/3 passages. The generator form, the Zod schema and the generation service
all read from it, so adding a section or question type is a one-file change.

---

## 11. Security model

- **Row Level Security is on for every table.** Hiding a nav link is never what
  protects data; the database refuses the query.
- **Waitlist**: the public may `INSERT` and nothing else. There is no `SELECT`
  policy for anonymous users, so the list cannot be read back. Duplicate emails
  are caught by a unique constraint and answered with *"You're already on the
  Testly waitlist."*
- **Profiles**: readable by their owner and by admins. `role` is excluded from
  the update grant and protected by the `profiles_guard_role` trigger.
- **Documents, assessments, questions**: scoped to their owner. `questions` is
  insert-only for the service role — the browser can read and delete its own,
  never write them.
- **Admin panel**: `/admin` is guarded in the client *and* by the policies. A
  signed-in non-admin who navigates there gets a 403 page, and the same person
  calling the API directly gets an empty result or `42501`.
- **Validation** runs in three places: Zod in the browser, Zod again in server
  functions, and CHECK constraints in Postgres.
- **Error messages** are mapped through `src/lib/errors.ts` so raw database text
  never reaches a user.

---

## 12. Connecting a real AI provider

Generation ships with a clearly-labelled development generator. It produces
correctly shaped placeholder questions so the whole flow can be exercised, marks
every one `mock: true`, and the assessment page shows a banner saying the output
is not AI-generated. It reads nothing from the source document.

To connect a real model, see `src/server/ai/README.md`: implement
`AssessmentProvider`, register it in the `PROVIDERS` map, and set `AI_PROVIDER`
plus the provider key in the server environment. Quality control
(`validateQuestions`) already runs over whatever a provider returns — structure,
answer validity, near-duplicate removal and count — so a real model inherits it.

---

## Notes

- The landing page design is frozen. Landing components were modified only where
  they needed to become functional (the waitlist form, the navbar's signed-in
  state, footer legal links).
- `src/routes/privacy.tsx` and `src/routes/terms.tsx` are honest starting drafts
  describing what the app actually collects. Have them reviewed before launch.
