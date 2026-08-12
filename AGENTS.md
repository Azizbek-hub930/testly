# Testly

AI-powered SAT and IELTS assessment generation.

See `README.md` for setup, the database schema in `supabase/migrations/`, and
`TESTING.md` for the verification checklist.

## Conventions

- The landing page design is frozen. Change landing components only to connect
  them to real functionality.
- Server-only code lives in `src/server/*.server.ts` and is blocked from the
  client bundle by import protection. Server functions callable from the browser
  go in `src/rpc/`.
- Never give a secret a `VITE_` prefix — that compiles it into the browser
  bundle. See `.env.example`.
- Row Level Security is the security boundary, not the UI. Any new table needs
  policies in a migration.
