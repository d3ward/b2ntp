Status: resolved
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

## Comments

**Decision: split the config, drop the cascade-layers polyfill for the extension, keep PurgeCSS.**

The extension now carries its own PostCSS pipeline inline in `vite.ext.config.js`, overriding the
root `postcss.config.js`. That root config is **unchanged**, so `src-web` keeps exactly the
behaviour it had (`npm run build` verified passing).

### 1. The real finding was not PurgeCSS — it was `postcss-cascade-layers`

`postcss-preset-env({ stage: 2 })` silently pulls in **`postcss-cascade-layers`**, which rewrites
every `@layer` into specificity hacks and strips the at-rule. The built CSS contained **no
`@layer` at all**.

That single plugin is the root cause of nearly every ugly workaround in this migration. With
layers gone, DaisyUI's `:not(#\#)` specificity hack (4 deep on components, **10** on
`.toast-center`) outranked every bespoke selector, so overriding DaisyUI required `!important`
each time. It also broke DaisyUI's *documented* escape hatches — `max-w-[42rem]` on a
`.modal-box` computed to 512px, unchanged, because Tailwind utilities end up low-specificity too.

The extension is Chrome MV3 and `@layer` has been supported since Chrome 99, so the polyfill was
pure cost. Disabled via `features: { 'cascade-layers': false }`.

**Effect:** Tailwind/DaisyUI stay inside their layers, the compiled Sass is unlayered and
therefore wins by default — which is the cascade this codebase actually wants. `!important` count
across the migrated CSS dropped from **11 to 3**, and the three that remain are legitimate
(reduced-motion animation suppression, and the toast z-index that must beat DaisyUI's modal).

All six behaviour suites (grid layout, dialogs, collapse, tabs, toasts, nav) were re-run after
removing those overrides and still pass.

One visual consequence worth noting: the widget sub-tabs now render as DaisyUI intends. The
polyfill had been flattening DaisyUI's *own* internal layer structure, altering its internal
precedence, so some components were rendering differently from upstream.

### 2. Is PurgeCSS still needed for `src-ext`? Yes — kept

Tailwind v4's on-demand generation does not make it redundant, because **DaisyUI ships a
component's entire rule set as soon as any one of its classes is used**. Measured on the final
build: 91.5kB → 81.2kB raw, 12.7kB → 11.5kB gzip. That chunk is loaded by `blank.html` too, so it
comes out of the NTP's budget. Kept, scoped to `./src-ext/**` only.

Verified `@layer` survives purging.

### 3. Is it dangerous? Audited — one real risk, fixed at source

The content globs include `src-ext` **JS**, so class names written as literals in JS are seen. The
danger is only *composed* names. There was exactly one: `toast.js` built its type class at
runtime. Ticket 10 rewrote it to map to whole literal strings (`'alert-success'`) rather than
`'alert-' + type`, which fixes it at the source instead of papering over it with a safelist.

Verified in a **production** build (not `--mode development`): all four toast types render with
correct distinct colours in both themes.

`panelHost.js`-built widget panels **could not be verified** — they render zero `.widget-panel`
elements even with a valid `sidebar_config`. This is **pre-existing and unrelated to purging**:
it matches the 6 known `panelHost.test.js` failures, all of which are `createWidgetPanel` DOM
assertions. Flagged rather than claimed as passing.

### Final CSS sizes vs the ticket-01 baseline

| | before (ticket 01) | after |
|---|---|---|
| `blank` own | 42,090 raw / 9,360 gz | 28,952 / 6,750 |
| `options` own | 37,620 / 8,540 | 25,680 / 6,160 |
| shared Tailwind/DaisyUI chunk | — | 81,150 / 11,508 |

Both per-page stylesheets shrank by ~31% as bespoke Sass was deleted.

### Open issue: user story 18 is not satisfied

`blank.html` (the NTP, loaded on every new tab) links the shared chunk, so its total CSS went
**9.4kB → 18.3kB gzip — roughly double**. Story 18 asked that the NTP be unaffected by pulling in
Tailwind/DaisyUI.

The NTP genuinely uses only a small slice (the changelog `modal`, `card`, `btn`, and `toast`/
`alert`), so most of that chunk is for the settings page. Fixing it properly means splitting the
Tailwind entry into per-page CSS files so `blank` pulls only what it needs, which is a build
restructure beyond this ticket's scope. **Recommend a follow-up ticket.**
