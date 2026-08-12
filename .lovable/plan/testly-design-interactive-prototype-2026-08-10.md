# Testly — Design & Interactive Prototype

A premium AI-company landing experience plus supporting screens, built entirely as a visual/UX prototype. No backend, no real AI, no auth logic — every "action" is animated and simulated.

## Brand system

- Logo used as-is (navbar horizontal lockup, standalone T mark for favicon, loaders, AI engine, accents).
- Palette: deep navy primary, electric indigo accent, warm-white background, soft gray secondary. Purple used sparingly as "AI energy".
- Typography: Inter (display + body), large editorial headlines, generous whitespace.
- Tokens defined once in the global stylesheet with full light + dark values; dark mode ready throughout.

## Landing page (/) — section order

1. Sticky navbar — blur + border on scroll, hamburger on mobile
2. Hero — eyebrow, "Turn knowledge into better tests.", two CTAs
3. Interactive AI pipeline visual — Source → Research Agent → Assessment Agent → Quality Check → Test Ready, with the signature particle animation flowing through the T symbol
4. From source to assessment — three numbered steps with animated connector
5. AI agent visualization — dark section, three nodes, hover expands into an info card, particles travel the links
6. Interactive product preview — config panel (exam, section, question type, difficulty, count) → Generate → ~2s staged processing animation → "27 Questions Ready"
7. SAT / IELTS cards — hover lift, indigo border, T mark reveal; SAT and IELTS chip configurations
8. Question preview — passage, A–D choices, animated selection, ✓ Correct + explanation panel
9. Minimal pricing — Plus / Pro / Corporate
10. Early access waitlist — name, work email, organization, role; animated checkmark success state
11. FAQ accordion — smooth height, plus → X rotation
12. Final CTA — dark navy, glowing T
13. Footer — minimal, logo, links, social

## Additional screens

- `/signin`, `/signup`, `/forgot-password` — split-screen: brand panel with T mark and "Build better assessments with AI." / form panel with Google button.
- `/dashboard` — small visual preview only: sidebar (Overview, Sources, Assessments, AI Agents, Settings), Create Assessment CTA, recent assessments list, upload card with drag-drop styling and analyzing progress.

## Motion & interaction

- Scroll reveals: subtle fade + rise + slight scale, staggered cards. Restrained, not everywhere.
- Micro-interactions: button lift/press, card hover borders, input focus glow, nav active indicator, agent pulse, animated upload border, checkmark draw.
- Loading states all use the T mark with rotating/morphing motion and staged status text.
- Full `prefers-reduced-motion` support: motion collapses to opacity or none.

## Responsive

Mobile designed intentionally — vertical pipeline, stacked cards, full-width upload, large touch targets, readable question preview. Tablet and desktop tuned separately; desktop is the showcase.

## Technical notes

- TanStack Start routes: rewrite `src/routes/index.tsx` as the landing page; add auth and dashboard routes.
- Motion via `motion/react` for orchestration; SVG + CSS for particles and lines (no WebGL/3D).
- All state is local React state — form submits, generation, and question grading are simulated with timers.
- Logo uploaded as a CDN asset pointer; a square T-mark favicon added to `public/`.
- Per-route head metadata with unique titles/descriptions.
