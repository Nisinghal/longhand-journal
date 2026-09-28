# Longhand — Handoff Summary
Saved 2026-09-14, end of Claude Code session (subscription ending).

## What Longhand is
Private journaling + mood app. Expo (React Native) + TypeScript. Entries encrypted
on-device (expo-sqlite + expo-secure-store). AI calls go through a serverless proxy
so no API key ever ships in the client.

## What got built (in order)

1. **File tree + data model** — planned, not yet all scaffolded as real code at
   that point. SQL schema: `entries`, `reflections`, `weekly_summaries`,
   `safety_events`, `settings`. One entry per day (`day` column UNIQUE).
   Only entry **bodies** are encrypted — `day`, `valence`, `energy`, `word_count`
   stay plaintext so the timeline can paint a year without decrypting 365 rows.

2. **Mood color system, draft 1** (`design/mood-field.html`) — flat OKLCH swatch
   grid. Valence → hue (dawn arc: indigo→periwinkle→sage→wheat→clay, no red
   anywhere). Energy → chroma/lightness. Went through 3 tuning passes (too
   saturated → cyan/mint hue clash → dark mode contrast fixed).
   **Rejected by user**: "looks boring, not suiting the idea." Flat color-fill
   read as a dashboard, not a journal.

3. **Five drawn alternatives** (`design/marks.html`) — Bloom, Sprig, Stitch,
   Bleed, Scrawl. Same mood data, five different generative SVG mark systems.
   **Decision: Bloom.** Petal count/openness = energy, hue = valence (same dawn
   arc). Runner-up idea kept for later: Stitch's continuous weekly thread —
   agreed to combine later as a faint connecting stem under Bloom on the
   timeline (see Open Questions).

4. **Composer screen — built as real code**, typechecked clean (`npx tsc --noEmit`
   passed). Files:
   - `src/theme/oklch.ts` — OKLCH→hex conversion (RN has no native oklch())
   - `src/theme/mood.ts` — hue arc, mark/wash color functions, labels
   - `src/theme/marks/bloom.ts` — bloom geometry generator, deterministic by
     seed, 25 states (5 valence × 5 energy) buildable once via `buildBloomField()`
   - `src/theme/tokens.ts` — palette, spacing, type scale, motion springs
   - `src/lib/promptLibrary.ts` — 24 **placeholder** rotating prompts (flagged
     for user to rewrite)
   - `src/lib/dates.ts` — day/week keys, word count
   - `src/db/key.ts`, `crypto.ts`, `client.ts`, `entries.ts` — full encrypted
     storage layer, implemented (not just planned)
   - `src/components/Bloom.tsx` — SVG render component
   - `src/features/composer/MoodPicker.tsx` — drag pad, bloom grows under thumb,
     collapses to one line when keyboard is up
   - `app/(tabs)/today.tsx` — the Today screen (prompt, writing field, autosave
     at 800ms debounce, word count + "Saved on this device" whisper)
   - `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/index.tsx`,
     `app/(tabs)/timeline.tsx` (placeholder screen) — routing scaffold
   - `package.json`, `app.json`, `tsconfig.json`, `babel.config.js` — project
     config. **Note**: original font package versions (`^0.2.3`) didn't exist;
     corrected to `^0.4.1` for `@expo-google-fonts/*`. `npm install` succeeded
     (950 packages), typecheck passed clean.
   - `design/composer.html` — interactive HTML preview (drag-to-drag, theme
     toggle, keyboard-up simulation) for judging without running Expo.

## Key design decisions & reasoning

- **Two-axis mood model, not a 1–5 score.** Valence (hue) × Energy (drawn
  form). No red on the scale — nothing is meant to read as an alert/score.
- **Energy moved from color chroma → drawn form** (petal count/openness).
  Reasoning given: "nobody thinks 'my mood was a 3'; they think they couldn't
  open up today." Color-only encoding felt clinical/dashboard-like.
- **Mood picker IS the mark** — not a separate slider/faces UI. Drag pad,
  bloom opens live. Only 25 discrete states exist, so geometry is precomputed
  once (`buildBloomField()`) and indexed during drag — no runtime path math.
- **Encryption boundary**: field-level, not whole-row. XChaCha20-Poly1305,
  fresh 24-byte nonce per write, entry id bound as associated data. Explicitly
  keep plaintext: day, valence, energy, word_count — this is called out in the
  project CLAUDE.md as a boundary to preserve if the schema is touched later.
- **No AI key in client** — proxy pattern (Expo API route or Cloudflare
  Worker) planned; not yet built this session.
- **Composer writing area has a lot of empty paper at rest** — flagged by
  Claude as the one visual call worth a second look, not yet resolved.

## Artifacts (all saved locally, no action needed)

| File | Content |
|---|---|
| `longhand/design/mood-field.html` | Draft 1 color swatch system (superseded) |
| `longhand/design/marks.html` | Five mark alternatives comparison board |
| `longhand/design/composer.html` | Interactive Today-screen preview |

(Also published as Claude Artifacts during the session — links were session-
scoped; the local HTML files above are the durable copies.)

## Open questions / decisions NOT yet made

1. **Timeline visual** — not yet designed or built. Last idea on the table:
   lay Bloom marks along a faint connecting stem/line per week (borrowing
   Stitch's continuity) rather than a flat grid. Not committed, not built.
2. **App name** — using "Longhand" as working name; alternates floated:
   *Marginalia*, *Lull*. Centralized in `app.json` + would need a
   `src/constants.ts` (not yet created) — a two-line change when decided.
3. **24 rotating prompts are placeholder copy** — in `src/lib/promptLibrary.ts`,
   explicitly marked for the user to rewrite before shipping.
4. **Empty-paper density at rest on Today screen** — flagged, not resolved.
5. **AI reflection proxy** (Expo API route / Cloudflare Worker) — planned in
   architecture, not implemented yet. Needed before AI reflection or weekly
   summary features can work.
6. **Onboarding flow (3 steps)** — planned in original spec, not built.
7. **Paywall (RevenueCat, $4.99/mo, $29.99/yr, 7-day trial)** — planned in
   original spec, not built. Decision already made: history export stays free
   and unpaywalled even behind the 7-day gate.
8. **Safety/crisis screen** — architecture decided (client-side screen before
   any network call, static support card, no content logged to
   `safety_events`), not yet implemented in code.

## Immediate next action if resuming
Run the composer for real:
```bash
cd longhand && npm start
```
Or open `longhand/design/composer.html` directly in a browser to review the
mood-picker interaction without Expo running.

## Handoff note
Session ended due to subscription cancellation. Codebase is in a working,
typechecked state through the composer screen. Timeline, onboarding, paywall,
AI proxy, and safety screen are the remaining unbuilt pieces from the original
spec — all documented in "Open questions" above with enough detail to resume
cold.
