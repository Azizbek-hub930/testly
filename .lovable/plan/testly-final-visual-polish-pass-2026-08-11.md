# Testly — Final Visual Polish Pass

Restore the Testly site from the uploaded archive, then run one focused polish pass: a real sticker system, a signature AI animation, cinematic scroll sequencing, mouse parallax, micro-interactions, and a guarantee that nothing ever clips or overflows. No new sections, no new features, no change to content structure.

## Step 0 — Restore the baseline

This project currently only holds the blank starter page; the Testly site lives in `test.zip`. Extract it into the project excluding git metadata, keep the existing `.git`, and install dependencies. The archive already ships Motion (`motion@13`), Tailwind v4 tokens (navy / indigo / paper / hairline), and the landing, auth, and dashboard routes — so the restore is the baseline, not a rebuild.

Routes restored: `/`, `/signin`, `/signup`, `/forgot-password`, `/dashboard`.

## 1. Sticker system (the signature)

Today stickers are ad-hoc `<Sticker>` calls with hand-typed `absolute -left-10 top-[300px]` offsets. Replace that with one small system:

- **`StickerLayer`** — an absolutely-positioned, `pointer-events-none`, non-clipping layer that owns a composition. Children are placed with normalized anchors (`side`, `x`, `y` as percentages) rather than pixel offsets, so positions scale with the container instead of escaping it.
- **`Sticker`** — gains `depth` (`back | mid | front`), `tilt`, `float` (amplitude + period), `visible` (`always | md+ | lg+`), and a paper variant (`note`, `chip`, `tab`, `label`, `torn`).
- **Sticker glyph set** (small inline SVGs, brand-consistent, no stock art): Testly T mark, hand arrows (curve / loop / short), hand underline that draws itself, checkmark, star, circle-scribble, question mark, highlighter swipe, tiny sparkline graph, document icon, paper clip, sparkle.
- **Content stickers** drawn from an authored catalogue — `SAT`, `IELTS`, `AI`, `Generate`, `Practice`, `Analyze`, `Question 01`, `27 Questions`, `40 Questions`, `Source → Questions`, `AI Ready ✓`, `Smart Practice`, `Reading`, `Writing`, `Difficulty: Medium`, `Assessment Ready`. Each placement is deliberate; a sticker with no reason to be there is deleted.

Paper depth stays premium: thin paper edge, two-stop soft shadow, faint top highlight, a barely-there grain, one slightly uneven corner. No cartoon drop shadows, no 3D transforms.

## 2. Never clip a sticker (the hard rule)

Current cause of clipping: hero and section wrappers use `overflow-hidden` while stickers sit at negative offsets (`-left-12`, `-right-10`) outside a `max-w-6xl px-5` container — between roughly 1024px and 1280px they fall under the clip edge.

The fix:

- A `--safe-gutter` token (40–80px desktop, tapering on smaller screens) defines a decoration-free band inside the viewport. Sticker layers are inset by it and can never place content outside it.
- Remove `overflow-hidden` from section wrappers that host stickers; clip only the wide background washes in their own `-z-10` layer.
- `overflow-x: clip` on the page root prevents horizontal scroll without clipping vertical shadows.
- Every sticker layer sits inside a container measured with a resize observer; placements resolve against real width, so shadows, logos, cards, and text stay fully visible.
- Breakpoint policy on each sticker: desktop full composition, tablet reduced count and scale, mobile only the essential few. Decorative ones drop out rather than shrink into unreadability.

## 3. Composition and depth

Each composition is arranged editorially, not scattered: a back layer (large faint paper, grid, glow), a mid layer (paper cards, notes), a front layer (small chips, glyphs, arrows). Rotations stay in the −5°…+4° range and are authored per sticker. Some stickers tuck behind cards, some overlap in front, creating real foreground/background reading order — a premium study desk, not confetti.

## 4. Motion

- **Float**: each decorative sticker drifts 4–8px vertically and ±1° with a long, desynchronized period. Amplitudes and delays are staggered so the page never pulses in unison.
- **Draw-in**: underlines, arrows, and connector lines animate `pathLength` on first view.
- **Sparkles**: slow opacity breathing, offset phases.
- **Mouse parallax** (desktop, pointer-fine only): spring-damped pointer offset applied per depth — background ~2px, paper cards ~6px, small stickers ~10px, central AI element ~1px. Disabled on touch and under reduced motion.
- **Scroll**: fade / slide-up / subtle scale / blur-to-sharp, always sequenced. `Reveal` and `RevealGroup` already exist and get extended with a `blur` option and per-child ordering so sections resolve in narrative order.
- All motion is `transform` + `opacity` + `filter` only, honors `prefers-reduced-motion`, and pauses off-screen.

## 5. Hero — the wow moment

Headline and CTAs stay exactly as they are. Around them, an intentional sticker ecosystem replaces the current four ad-hoc notes: `SAT · 27 QUESTIONS`, `IELTS · READING`, `ACADEMIC PAPER.pdf`, `AI ANALYZING…`, `✓ QUALITY CHECKED`, `QUESTION READY`, plus the T mark, a hand arrow, and a drawn underline. Their arrangement reads top-to-bottom as **source → AI → questions** within five seconds.

## 6. Signature AI animation

Rework `ai-engine.tsx` into one continuous, elegant nine-beat sequence (looping, scroll-triggered, pausable off-screen):

```text
 paper card  ->  lines highlight  ->  particles lift
      -> travel to the T  ->  T glows/pulses
      -> status labels: Analyzing / Structuring / Generating / Checking
      -> particles become QUESTION 01 / 02 / 03
      -> cards organize into a SAT / IELTS mock
      -> ✓ Assessment Ready
```

Implemented as a timeline of transform/opacity keyframes over a fixed set of DOM nodes (roughly 12–18 particles, not a canvas), so it stays cheap. It must never read as a spinner: each beat has its own easing and a short hold. Reduced motion collapses it to the final composed state.

## 7. Paper → AI → Questions section

Four stages — `01 SOURCE`, `02 ANALYZE`, `03 GENERATE`, `04 READY` — enter in sequence as the section scrolls in. A thin indigo connector draws itself between them with `pathLength`, and two or three small particles travel the line after it completes. Vertical on mobile, horizontal on desktop, same choreography.

## 8. Generator interaction

The existing generator UI keeps its controls (exam, section, difficulty, count). On **Generate →** it transitions into a designed processing state: T mark pulsing, and the status list `Analyzing source… / Extracting concepts… / Building questions… / Checking quality…` checking off one by one. Then `✓ 27 Questions Ready`, followed by question cards printing in one at a time (opacity + small rise + slight scale), each carrying a small T mark in the corner. Timing is authored, not fake-random; state is local to the component.

## 9. Micro-interactions

Buttons lift ~1px with a soft indigo glow and a 0.98 press; cards lift with shadow growth and a nudge to their attached sticker; inputs get a smooth focus ring and faint glow; dropdowns, tabs (sliding indicator), accordions (measured height), and checkboxes (drawn check) all get real transitions; upload shows animated progress; success plays a drawn checkmark. Standard durations: 150ms for hover, 250–400ms for state changes, 600–900ms for reveals.

## 10. Waitlist

Reads as part of the product, not a newsletter. Before: “Join the Testly early-access list.” After submit: the T appears, pulses once, particles converge into a drawn checkmark, then `✓ You're on the list.` with “We'll let you know when Testly is ready.” below. Client-side state only — no backend in this pass.

## 11. Auth pages

`signin`, `signup`, `forgot-password` share the existing auth layout, upgraded to match the landing page: dark navy panel with the T and a slow animated background, floating paper stickers confined to the safe gutter, and a form that stays minimal — email, password, Google, submit. Nothing added to the form itself.

## 12. Dashboard

Same tokens, motion primitives, and micro-interaction polish applied to `/dashboard`, with restraint: sequenced panel entrance, card hover, one or two stickers maximum. It stays a working surface, not a decorated one.

## 13. Background details

Warm paper-white stays. Layered underneath everything: paper grain, tiny dot field, fine hairline grid, one soft indigo glow, a few very faint lines — each masked and low-opacity enough to read only on close inspection. Backgrounds never compete with stickers.

## Discipline

Roughly 70% premium minimal AI product, 30% paper/sticker personality. No new sections, no extra CTAs, no glassmorphism, no gradient stacking, no stock imagery, no childish shapes. Anything that doesn't earn its place gets cut.

## Verification

- Sweep 360 / 414 / 768 / 1024 / 1280 / 1440 / 1920 widths and confirm zero horizontal overflow and zero clipped sticker, shadow, logo, or card.
- Confirm reduced-motion renders every section in a clean, complete static state.
- Confirm each route's `head()` metadata survives the restore.

## Technical notes

- Tailwind v4, tokens in `src/styles.css` (`@theme inline`); all new values added as tokens — no hardcoded colors in components.
- Motion for React (`motion/react`), already a dependency. Parallax via `useSpring`/`useTransform`; scroll sequencing via `whileInView` variants and `useScroll` where a timeline is needed.
- New shared modules: `src/components/site/sticker-system.tsx` (layer, sticker, placement), `src/components/site/sticker-glyphs.tsx` (SVG set), `src/hooks/use-pointer-parallax.ts`, `src/hooks/use-safe-bounds.ts`.
- Existing `paper.tsx` and `reveal.tsx` primitives are extended, not replaced, so every current usage keeps working.
