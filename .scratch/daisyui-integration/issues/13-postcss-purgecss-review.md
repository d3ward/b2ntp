Status: ready-for-agent
Blocked by: 12

# Re-evaluate PurgeCSS in the PostCSS pipeline

## Goal

Decide whether `@fullhuman/postcss-purgecss` is still earning its place now that Tailwind v4 generates classes on demand, and make sure it is not silently stripping DaisyUI classes.

## Scope

- Current `postcss.config.js` (repo root, shared by **both** the `src-web` and `src-ext` builds) runs `postcss-preset-env` (stage 2) and `purgecss` with:
  - content globs: `./src-web/**/*.{html,js}` and `./src-ext/**/*.{html,js}`
  - `defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []`
- Assess:
  1. **Is PurgeCSS still needed for `src-ext`?** Tailwind v4 only emits classes it finds, so PurgeCSS may now be redundant dead weight on the extension build.
  2. **Is it dangerous?** Any DaisyUI/Tailwind class assembled dynamically in JS rather than written literally in markup is at risk of being purged. Audit for dynamic class construction — `src-ext/js/components/toast.js` composes type classes at runtime, and `src-ext/js/widgets/panelHost.js` builds widget panel markup in JS. Confirm these survive a production build.
  3. **Should the config be split?** `src-web` is out of scope for this migration but shares this config. Consider scoping Tailwind/DaisyUI processing to the extension build so the marketing site is unaffected.
- Decide and implement one of: keep as-is (documented why), scope PurgeCSS to `src-web` only, add a safelist for dynamically-composed classes, or remove PurgeCSS entirely.

## Acceptance criteria

- A production build (`npm run build-ext`, **not** the `--mode development` variant) renders both `blank.html` and `options.html` correctly — every migrated DaisyUI component styled, nothing visually missing versus the dev build.
- Toasts of all four types render correctly in a production build (highest-risk dynamic-class case).
- Widget panels built by `panelHost.js` render correctly in a production build.
- `npm run build` (`src-web`) still succeeds and the marketing site renders correctly.
- The decision and its rationale are recorded in this ticket's `## Comments`.
- Final CSS bundle sizes for `blank` and `options` are recorded, and compared against the baseline captured in ticket 01.

## Notes

- Run this **last**. Doing it before the component migrations are complete would test a moving target.
- The dev-mode build is more forgiving than production; a bug here will only show in a real `build-ext`. Verify against the production output specifically.
