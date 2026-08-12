# Testly — verification checklist

Work through this top to bottom. Each step says what to do and what you should
see. Anything that doesn't match, stop and note the step number.

Total time: ~20 minutes, most of it in Part B.

---

## Part A — Setup (once)

### A1. Install dependencies

```bash
npm install
```

**Expect:** completes. It will report 3 high-severity advisories in
`brace-expansion`, `js-yaml` and `nanoid` — these are build-time only (eslint,
vite, the TanStack build plugin), are not present in the deployed bundle, and
need attacker-controlled input to those libraries to trigger. Not a blocker.

> `npm install` regenerates `package-lock.json`. Delete it before committing —
> `bun.lock` is the lockfile Lovable and Vercel use.

### A2. Confirm the code is healthy

```bash
npm run typecheck
```
**Expect:** no output at all. That means 0 type errors.

```bash
npm run lint
```
**Expect:** `✖ 10 problems (0 errors, 10 warnings)`. Zero errors is the bar; the
10 warnings are pre-existing `react-refresh` notes in the shadcn UI files.

```bash
npm run build
```
**Expect:** ends with `You can preview this build using npx vite preview`.

### A3. Create your environment file

```bash
cp .env.example .env
```

Open `.env` and fill in, from Supabase → **Project Settings → API**:

- `VITE_SUPABASE_URL` — Project URL
- `VITE_SUPABASE_ANON_KEY` — the `anon` / publishable key
- `SUPABASE_SERVICE_ROLE_KEY` — the `service_role` key (optional; without it,
  generation and role changes are disabled and say so)

### A4. Run the database migrations

Supabase → **SQL Editor → New query**. Paste and run each file, in this order:

| # | File | Creates |
|---|---|---|
| 1 | `supabase/migrations/0001_core.sql` | profiles, waitlist, `is_admin()`, triggers, RLS, grants |
| 2 | `supabase/migrations/0002_product.sql` | documents, assessments, questions + RLS |
| 3 | `supabase/migrations/0003_storage.sql` | private `sources` bucket + policies |
| 4 | `supabase/migrations/0005_admin_stats.sql` | `waitlist_stats()` |

**Expect:** `Success. No rows returned` for each.

Leave `0004_admin_bootstrap.sql` for step B12 — it needs your account to exist.

If step 3 fails with *"must be owner of table objects"*, create the four
policies by hand in **Storage → Policies → sources** using the expressions from
that file. The bucket itself will already exist.

### A5. Register the auth redirect URL

Supabase → **Authentication → URL Configuration** → *Redirect URLs* → add:

```
http://localhost:8080/auth/callback
```

### A6. Start the app

```bash
npm run dev
```

**Expect:** a URL, normally http://localhost:8080. Use whatever it prints.

---

## Part B — Feature walkthrough

### Waitlist — the main early-access feature

| # | Do | Expect |
|---|---|---|
| B1 | Open `/` and click **Get Early Access** | Smooth scroll to the early-access form |
| B2 | Fill in name, a throwaway email, organization, role → **Request Early Access** | Button switches to a pulsing Testly T, then a success card: *"You're on the list."* |
| B3 | Supabase → **Table Editor → waitlist** | One row. Email lowercased, `source` = `landing`, `created_at` = now |
| B4 | Reload `/`, submit the **same email** again | *"You're already on the list."* — and still only **one** row in the table |
| B5 | Submit with email `abc` | Red inline error under the field; nothing sent to the database |
| B6 | Submit with the name field empty | Red inline error; nothing sent |

### Accounts

| # | Do | Expect |
|---|---|---|
| B7 | `/signup` → create the account for **azizbekboyxorozov2010@gmail.com** | Either lands on `/dashboard`, or shows *"Check your email"* if Confirm Email is on in Supabase |
| B8 | Supabase → **Table Editor → profiles** | A row for you, `role` = `user`, name filled in from signup |
| B9 | Click **Sign out** in the sidebar | Back on `/`, and the navbar shows *Sign In* again |
| B10 | `/signin` with the wrong password | *"That email and password don't match."* — no raw database text |
| B11 | `/signin` with the right password | Lands on `/dashboard` |

### Admin access — check the lockout BEFORE promoting yourself

| # | Do | Expect |
|---|---|---|
| B12 | While signed in as a normal user, type `/admin` in the address bar | **403 — "Admins only."** page. This is the important one |
| B13 | Run `supabase/migrations/0004_admin_bootstrap.sql` in the SQL editor | `Success`. It already contains your email |
| B14 | Sign out, sign back in, open `/admin` | The admin overview loads |

### Admin panel

| # | Do | Expect |
|---|---|---|
| B15 | `/admin` | Waitlist / Today / This week / Organizations cards show your real counts; the 30-day chart has a bar for today |
| B16 | `/admin/waitlist` | Your test signups in a table: Name, Email, Organization, Role, Joined, Source |
| B17 | Type part of a name into **Search** | List narrows as you type |
| B18 | Change the **Role** dropdown | Only matching rows remain |
| B19 | Change **Sort** to *Oldest first* | Order reverses |
| B20 | **Click a row** | Detail panel slides in with the full record |
| B21 | Type into **Internal notes** → **Save notes** → close → reopen the row | The note is still there |
| B22 | `/admin/users` | Your account listed with an **Admin** badge; the *Demote* button is disabled on your own row |
| B23 | `/admin/settings` | Your project ref, the `sources` bucket, and the access-control summary |

### Product flow

| # | Do | Expect |
|---|---|---|
| B24 | `/dashboard/sources` → drag a **text-based** PDF onto the dropzone | Progress bar climbs with real percentages, then flips to a moving bar labelled **Reading text**, then ✓ **Ready** |
| B24a | Supabase → **Table Editor → documents** → your row | `status` = `ready` and `extracted_text` contains the document's actual text |
| B24b | Upload a **scanned** PDF (a photo of a page, no text layer) | Status **failed**, with *"No selectable text found. This PDF looks like a scan…"* shown under the file name |
| B24c | `/dashboard/assessments/new` | The scanned PDF is **not** offered as a source — only `ready` documents are selectable |
| B25 | Supabase → **Storage → sources** | Your file, inside a folder named after your user id |
| B26 | Try uploading a `.png` or a file over 20 MB | Rejected with a clear message; nothing uploaded |
| B27 | `/dashboard/assessments/new` → press **Generate** with no source selected | Red error on the source list; no request made |
| B28 | Select your PDF, choose **IELTS** | The Questions chips become 13 / 27 / 40 with *1 passage* / *2 passages* / *3 passages* hints |
| B29 | Choose **SAT → Math** | Question types change to Algebra, Advanced Math, etc.; counts become 11 / 22 / 44 |
| B30 | Back to IELTS, 13 questions → **Generate** | Testly T takeover animation with staged labels, then you land on the assessment page |
| B31 | The assessment page | 13 questions, each with type, options, and the correct answer highlighted |
| B32 | Read the indigo banner | *"Development generator output"* — correct, no AI provider is connected yet |
| B33 | Toggle **Hide answers** / **Show answers** | Correct-answer highlighting and explanations appear and disappear |
| B34 | `/dashboard` | Assessments / Ready / Questions generated / Sources cards show real numbers |
| B35 | `/dashboard/assessments` | Your assessment listed with a **ready** status pill |
| B36 | `/dashboard/settings` → change your name → **Save changes** | *"Profile updated."*, and the sidebar name updates |

### Password reset

| # | Do | Expect |
|---|---|---|
| B37 | `/forgot-password` → your email → **Send reset link** | Confirmation card. Wording doesn't reveal whether the address exists |
| B38 | Open the link in the email | Lands on `/reset-password` with the password form — *not* the "expired" message |
| B39 | Set a new password | *"Password updated."* and you're signed in |
| B40 | Open `/reset-password` directly, with no link | *"This reset link has expired or was already used."* plus a button to request a new one |

### Mobile

| # | Do | Expect |
|---|---|---|
| B41 | Narrow the window to ~375px, scroll the whole landing page | **Nothing scrolls sideways** at any point |
| B42 | `/dashboard` at that width | Hamburger at top opens the nav; content is readable, no overflow |
| B43 | `/admin/waitlist` at that width | The table scrolls horizontally **inside its own card**, page does not |

---

## Part C — Prove the security holds

This is what separates "the link is hidden" from "the data is protected". Two
minutes, worth doing.

### C1. Can a stranger read your waitlist?

Open a **private/incognito window** on `http://localhost:8080` (signed out),
open the browser console, and run this with your own two values pasted in:

```js
const url = "PASTE_VITE_SUPABASE_URL";
const key = "PASTE_VITE_SUPABASE_ANON_KEY";
const r = await fetch(`${url}/rest/v1/waitlist?select=*`, { headers: { apikey: key } });
console.log(r.status, await r.json());
```

**Expect:** `200 []` — an empty array. The public can insert but never read.
If you see your signups here, the RLS policies didn't apply — stop and say so.

### C2. Can a normal user make themselves an admin?

Sign in as a **non-admin** account (make a second one if needed), then run:

```js
const url = "PASTE_VITE_SUPABASE_URL";
const key = "PASTE_VITE_SUPABASE_ANON_KEY";
const s = JSON.parse(localStorage.getItem("testly-auth"));
const r = await fetch(`${url}/rest/v1/profiles?id=eq.${s.user.id}`, {
  method: "PATCH",
  headers: { apikey: key, Authorization: `Bearer ${s.access_token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ role: "admin" }),
});
console.log(r.status, await r.text());
```

**Expect:** a **403** or a `42501` permission error. Then reload `/admin` as
that account and confirm you still get the 403 page.

### C3. Can a normal user read someone else's documents?

As the non-admin account:

```js
const url = "PASTE_VITE_SUPABASE_URL";
const key = "PASTE_VITE_SUPABASE_ANON_KEY";
const s = JSON.parse(localStorage.getItem("testly-auth"));
const r = await fetch(`${url}/rest/v1/documents?select=*`, {
  headers: { apikey: key, Authorization: `Bearer ${s.access_token}` },
});
console.log(await r.json());
```

**Expect:** `[]` — the admin account's uploaded PDF must not appear.

### C4. No secrets in the browser bundle

```bash
npm run build && grep -rl "service_role\|SUPABASE_SERVICE_ROLE_KEY\|ANTHROPIC_API_KEY" .output/public/ ; echo "^ nothing listed above = clean"
```

**Expect:** no file paths printed.

---

## Part D — Deployment readiness

| # | Do | Expect |
|---|---|---|
| D1 | `npm run build` then `npx vite preview` | The production build serves and behaves like dev |
| D2 | Push to GitHub, import into Vercel | Build succeeds; Nitro auto-detects Vercel |
| D3 | In Vercel, add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_PROVIDER=mock` | — |
| D4 | Supabase → Authentication → URL Configuration | Site URL = your production domain; add `https://your-domain.com/auth/callback` |
| D5 | Repeat B1–B4 on the live URL | Waitlist saves in production |

Full deployment detail is in `README.md` §8 and §9.

---

## What has already been verified, and what hasn't

**Verified by execution on this machine:**

- `typecheck` 0 errors, `lint` 0 errors, production build succeeds
- All 17 routes render server-side with no errors; unknown paths 404
- No horizontal overflow at 375px
- No service-role key, provider key or `service_role` string in the client bundle
- The `startGeneration` server function was invoked over HTTP and returned
  `{"ok":false,"message":"Generation isn't configured on the server yet …"}` —
  proving the RPC transport, the Zod validator, the handler, the server-only
  module imports and the friendly error mapping all work
- CSRF protection on server functions: same-origin call → 200, a call with
  `Origin: https://evil.example` → **403 Forbidden**
- `.insert()` in supabase-js sends no `return=representation`, so the anonymous
  waitlist insert never needs a SELECT policy — the duplicate-email path is sound

**Not yet verified — this is what Parts A–C above are for:**

- No SQL migration has ever been executed against a real Postgres
- No RLS policy has been exercised by a real request
- No account has been created, no session issued, no password reset link opened
- No file has been uploaded to a real Storage bucket
- Generation has never completed successfully (it has only been shown to fail
  correctly when unconfigured)

---

## Remaining scope

Nothing is knowingly unimplemented. The one thing still switched off by choice
is the AI provider: `AI_PROVIDER=mock`, so generation produces labelled
placeholder questions. Connecting a real model is now purely configuration —
implement `AssessmentProvider`, register it, set the key. See
`src/server/ai/README.md`.

PDF text extraction **is** implemented (see B24a–B24c above). Verified locally:
a generated single-page PDF round-tripped through the real extraction path and
returned all 6 of its source lines, 390 characters, 1 page. The parser is bundled
into the server function only — it is not in the browser bundle.
