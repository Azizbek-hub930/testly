# Testly — Visual Redesign: "Paper meets AI"

A full visual/UX rework of the existing prototype. Same product ideas and sections, new visual identity: 80% premium minimal AI company, 20% educational paper/sticker personality. No backend work — everything stays simulated local state.

## Design language

- **Palette:** navy #0B1735 as structure and text, electric indigo as controlled AI energy (highlights, progress, links, interactive states), warm paper-white background, soft gray secondary. Purple never dominates a section.
- **Type:** Inter/Geist tight editorial headlines (short lines, heavy weight, tight leading), clean minimal body, a handwritten accent font used only inside decorative annotations.
- **Paper card system:** one reusable card style — warm white, thin border, soft shadow, slight rotation, moderate radius, tiny corner T mark. Used for documents, questions, config panels, stickers.
- **Sticker system:** a small reusable set (SAT, IELTS, "Question generated ✓", "Source → Question", "27 Q", handwritten arrow, underline draw). Sparse placement, slight rotations, 3–5 px float, subtle only.
- **Background:** faint paper grain, blueprint hairlines, tiny dots, soft radial indigo glows — visible only up close.

## Page structure (landing)

1. **Floating navbar** — rounded, blurred, thin border; Product / How It Works / SAT & IELTS / FAQ; Sign In + Get Early Access. Shrinks and gains shadow on scroll.
2. **Hero** — eyebrow "✦ AI ASSESSMENT ENGINE", headline "Turn source material into better tests." (indigo highlight), support line, two CTAs. Around it a sparse arranged-desk composition: logo sticker, Practice/Analyze/Improve loop, Source→Questions→Practice column, "Academic Paper.pdf · Analyzing…" doc card, SAT 27 Questions, IELTS Reading.
3. **Signature AI engine animation** — document highlights concepts → particles leave the page → travel to the pulsing T mark → reorganize → question cards emerge → ✓ Assessment ready. Looping, scroll-triggered, reduced-motion safe.
4. **From paper to practice** — PAPER → AI → QUESTIONS → TEST as four connected cards with an animated connector.
5. **How it works** — 3 steps (Upload / Generate / Practice), oversized numerals, small text, animated line.
6. **Create an assessment** (product section) — left drag-drop upload with fake progress → ✓ Ready; right config: Exam, Section, Question Type, Difficulty, Questions. Generate → full processing takeover: config chips fly into the T, staged status text (Analyzing source → Extracting concepts → Structuring assessment → Generating questions → Checking quality → ✓ Ready), then "27 Questions Ready".
7. **Question preview** — SAT · Reading & Writing, Question 01/27, passage, A–D selectable, ✓ Correct, explanation reveal.
8. **SAT & IELTS** — SAT chips (Reading & Writing + Math domains); IELTS question-format paper cards and selectable 13/27/40-question configurations; two oversized SAT and IELTS exam cards with lift/sticker/T-mark hover.
9. **AI agents** — dark navy band, three connected nodes (Research / Assessment / Quality) with T marks, status, particles along links; plus a quality-check animation where Question 08 passes ✓ structure, difficulty, type, similarity → APPROVED.
10. **Who it's for** — Learning Centers, Tutors, Schools, Educational Organizations; four cards, one tiny sticker each.
11. **Waitlist** — product-grade form (Name, Work Email, Organization, Role) → T-mark processing → ✓ You're on the list with restrained particle burst.
12. **Pricing** — minimal paper cards: Plus $99.90, Pro $349.90, Corporate custom.
13. **FAQ** — accordion, plus → X, smooth height.
14. **Final CTA** — dark navy, glowing large T, floating paper cards, "Your next test could start with one paper."
15. **Footer** — logo, Product / How It Works / SAT & IELTS / FAQ / Privacy / Terms, social.

## Other screens

- **Sign in / Create account / Forgot password** — split layout: dark navy brand panel with T mark and floating paper decorations, clean form panel with Google option. Signup adds Organization.
- **Dashboard preview** — polished, not enterprise: Overview / Sources / Assessments / AI Agents / Settings, Create Assessment CTA, recent assessments with Ready / Processing / Draft badges, elegant upload card.

## Motion

Motion for React throughout: scroll reveals, text reveals, card lift, magnetic buttons, parallax on stickers, particle flows, progress lines, checkmark draw, staged AI processing. Restraint is the rule — decorative motion stays under ~6 px and slow. Full `prefers-reduced-motion` collapse to opacity or none.

## Responsive & accessibility

Desktop is the showcase. Mobile is recomposed, not shrunk: stacked paper cards, decorations reduced to a few, AI animation kept but simplified, full-width generator, large touch targets, readable question text, clean menu. High contrast, visible focus rings, keyboard-operable accordion/tabs/answers.

## Technical notes

- Rework `src/styles.css` tokens (navy/indigo/paper), add paper-card, sticker, texture and annotation utilities; add the handwritten accent font via `<link>` in `__root.tsx`.
- New shared primitives: `PaperCard`, `Sticker`, `AnnotationArrow`, `TMarkEngine`, `SectionHeading`.
- Rewrite landing sections in `src/components/landing/*`, plus auth layout and dashboard polish; all state stays local and simulated.
- No fabricated logos, testimonials, statistics, or customer claims anywhere.
