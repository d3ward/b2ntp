Status: resolved

# Add Tailwind CSS + DaisyUI to the extension build

## Goal

Get Tailwind v4 and DaisyUI compiling into the `src-ext` bundle, with zero visual change to the existing UI. This ticket is pure plumbing — no component is migrated here.

## Scope

- Add `tailwindcss`, `@tailwindcss/vite`, and `daisyui` as dependencies.
- Wire `@tailwindcss/vite` into `vite.ext.config.js` **only**. Do not touch `vite.config.js` (the `src-web` marketing site build).
- Create a new plain-CSS entry file under `src-ext` (e.g. `src-ext/css/tailwind.css`) containing the `@import "tailwindcss"` and `@plugin "daisyui"` directives. It must be a `.css` file, not `.sass` — Tailwind's at-rule processing and the Sass compiler do not compose in a single file.
- Import that CSS entry alongside the existing compiled Sass entries so both load: `blank.sass` is imported from `src-ext/js/blank.js`, `options.sass` from `src-ext/js/options.js`. Follow the same pattern for the new CSS entry.
- Confirm load order results in DaisyUI's base/reset not clobbering the existing hand-rolled styles in a way that visibly changes the UI. If DaisyUI's preflight fights the existing `base/_reset.sass`, resolve it here (scoping or selectively disabling preflight) rather than deferring to later tickets.

## Acceptance criteria

- `npm run build-ext` succeeds.
- `npm run dev-ext` serves both `blank.html` and `options.html` without console errors.
- Rendering both pages shows **no visible change** versus before this ticket (screenshot compare per the project's verification approach).
- A throwaway probe element with a DaisyUI class (e.g. `btn btn-primary`) and a Tailwind utility (e.g. `mt-4`) renders styled, proving the pipeline is live. Remove the probe before finishing.
- `npx vitest run` shows no new failures. Note: `panelHost.test.js` has 6 pre-existing failures unrelated to this work — those are expected and not caused by this ticket.

## Notes

- The extension is Manifest V3 (`src-ext/manifest.json`); keep everything build-time. No CDN or runtime-injected stylesheets.
- Bundle size for `blank.html` (the New Tab Page, loaded on every tab) should be watched here — record the before/after CSS size for `blank` in a comment on this ticket, since keeping the NTP lean is an explicit goal in the spec.

## Comments

**Implemented.** `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`, `daisyui@5.6.22`.
`@tailwindcss/vite` wired into `vite.ext.config.js` only; `vite.config.js` untouched
(`npm run build` verified still passing). Entry at `src-ext/css/tailwind.css`, imported
from `blank.js` and `options.js` alongside the Sass entries.

### Preflight / base resolution

Tailwind's preflight is deliberately **not** imported — only `tailwindcss/theme.css` and
`tailwindcss/utilities.css`. b2ntp's own `sass/base/_reset.sass` remains the reset;
importing preflight on top of it restyled every element. DaisyUI base is loaded with
`exclude: rootcolor, rootscrollgutter` for the same reason.

Everything Tailwind/DaisyUI emits lands in a CSS cascade layer while the compiled Sass is
unlayered, and unlayered always beats layered. So the bespoke Sass keeps winning until a
migration ticket deletes it — the sequencing in tickets 03-11 works without extra effort.

### Unanticipated: class-name collisions (scope added to this ticket)

The real threat to "no visible change" was not preflight but **class-name collisions**.
b2ntp already used 8 class names DaisyUI/Tailwind also emit. Because the layer rule above
only protects properties the bespoke rule *sets*, DaisyUI leaked every property the
bespoke rule *didn't* set — measured up to 5.9% pixel drift on the Widgets panel.

Resolved by renaming b2ntp's side (user picked this over prefixing DaisyUI, which would
have contradicted the class names written into tickets 02-13):

| was | now | sites | freed for |
|---|---|---|---|
| `.btn` | `.b2-btn` | 15 | ticket 03 |
| `.card` | `.b2-card` | 2 | — |
| `.grid` | `.b2-grid` | 4 | — |
| `.link` | `.b2-link` | 3 | — |
| `.toast` | `.b2-toast` | 2 | ticket 10 |
| `.toggle` | `.b2-toggle` | 4+ | ticket 05 |
| `.hidden` | `.b2-hidden` | 1 | — |
| `.block` | `.b2-block` | 3 | — |

Also removed three dead Tailwind-lookalike classes that had no rule behind them and would
have silently activated: `w-6`, `h-6` (`support_me.html`), `my-2` (`settings.html`).

Two collision sites were **outside** the HTML partials and are easy to miss when doing
this by grep — worth knowing for later tickets:
- `CHANGELOG.md` embeds raw HTML (`<a class="btn btn-p">`), inlined at build time by
  `htmlTransformPlugin`. Confirmed `src-web` does not consume the changelog.
- `js/settings/widgetSettings.js:60` builds the per-widget toggles with
  `className = 'toggle wdg-toggle'`. This one visibly broke the Layout tab toggles.

A collision check is now cheap to repeat — extract bare `.class` selectors from the built
`registry-*.css` and intersect against class tokens in markup, `className`/`classList`
calls, and JS `innerHTML` templates. Currently zero collisions across all three.

### Verification

Playwright + stubbed-`chrome` harness, 20 screenshots (7 settings sections + 2 widget
sub-tabs + NTP, x light/dark), pixel-diffed against a pre-change baseline.

**19 of 20 pixel-identical.** The remaining diff is `options_backup_dark` at 0.081%:
DaisyUI's stock themes emit `[data-theme=dark]{color-scheme:dark}`, which recolours the
native `<progress>` storage meter (`#size_progress`). Not styled by DaisyUI directly —
it's the UA picking up the colour scheme. Ticket 02 replaces those stock themes, so this
is resolved there rather than patched here. (Arguably the old state was the bug: b2ntp's
dark theme rendered native controls with light UA chrome.)

Probe (`btn btn-primary mt-4`) rendered styled in DaisyUI's stock blue with correct
spacing, confirming the pipeline is live; removed before finishing.

`npm run build-ext` succeeds, `npm run dev-ext` serves both pages with no console errors,
`npx vitest run` unchanged at 87 passed / 6 pre-existing `panelHost.test.js` failures.

### CSS bundle sizes (baseline for ticket 13)

| | before | after |
|---|---|---|
| `blank` own | 42,090 raw / 9,360 gz | 41,599 raw / 9,149 gz |
| `options` own | 37,620 raw / 8,540 gz | 37,138 raw / 8,332 gz |
| shared Tailwind/DaisyUI chunk | — | 77,633 raw / 8,991 gz |

**Note for ticket 13 / user story 18:** the Tailwind chunk is currently emitted as a
shared chunk that `blank.html` also links, so the NTP pays ~9 kB gzip it does not yet use.
Most of it is DaisyUI components generated because the extractor sees words like `card`,
`input`, `range`, `menu` in existing source, not because anything uses them. Revisit when
ticket 13 evaluates PurgeCSS and config splitting.

### Correction (found while doing ticket 02)

The cascade explanation above is **wrong** and is left in place only so the correction
makes sense. It claimed Tailwind/DaisyUI output stays in a cascade layer while the Sass is
unlayered, so bespoke Sass would keep winning until deleted.

In fact `postcss-preset-env({ stage: 2 })` pulls in **`postcss-cascade-layers`**, which
flattens every `@layer` into specificity hacks and strips the at-rule. The built CSS
contains no `@layer` at all, so layer order is not a mechanism available in this pipeline.

What actually decides the cascade is specificity, and DaisyUI ships component rules with a
`:not(#\#)` x4 hack (~4 ID selectors), which outranks essentially every bespoke b2ntp
selector. The real model is: **once an element gains a DaisyUI class, DaisyUI owns its
styling**, even against more-specific-looking bespoke rules.

This does not change any ticket-01 outcome — the renames and the verified screenshots
stand, and it is in fact a cleaner story for the per-component migration. But it has two
consequences worth carrying forward:

- Tickets **07** (dialog structural rules) and **11** (the nav cutout) call for bespoke CSS
  layered *on top of* DaisyUI. That will not work by default; those rules must match
  DaisyUI's specificity deliberately.
- Ticket **13** should decide whether `postcss-cascade-layers` belongs in the pipeline at
  all. The extension is Chrome MV3 and `@layer` has been natively supported since Chrome 99,
  so the polyfill looks like pure cost here — but `postcss.config.js` is shared with
  `src-web`, which is exactly ticket 13's scope.
