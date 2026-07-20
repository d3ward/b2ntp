Status: done
Blocked by: 02

# Migrate buttons to DaisyUI `btn`

## Goal

Replace the hand-rolled button system in `src-ext/sass/elements/_button.sass` with DaisyUI's `btn` component and its colour modifiers.

## Scope

- Replace the bespoke colour variants with DaisyUI equivalents:
  - `.btn-p` → `btn-primary`
  - `.btn-red` (and the bare `[type="reset"]` styling) → `btn-error`
  - `.btn-green` → `btn-success`
  - `.btn-blue` → `btn-info`
  - `.btn-orange` → `btn-warning`
  - `.outline` → `btn-outline`
  - `.pill` → `btn-circle` / `rounded-full` as appropriate per usage
  - `.btn-transparent` / `._btn_t` → `btn-ghost`
  - `.btn-black` / `.btn-white` / `.btn-inverted` → `btn-neutral` or a Tailwind-utility equivalent, chosen per actual usage site
- The current Sass styles bare `button`, `input[type=button|submit|reset|file]`, and `.btn` **element-wide**. DaisyUI is class-based. Every `<button>` in `src-ext/options.html`, `src-ext/blank.html`, and `src-ext/partials/*.html` must therefore get an explicit `btn` class, or be deliberately excluded (see below).
- **Exclusions — do not blanket-apply `btn`:** several buttons are icon-only controls inside custom widgets that should not inherit `btn` sizing/min-width. Audit and handle individually: `.widget-chevron` and `.tab-close` (in `src-ext/sass/components/_tabs.sass`), and the theme-toggle icons. Give these `btn btn-ghost btn-xs`/`btn-square` only if it genuinely preserves their current compact appearance; otherwise leave them bespoke and note why.
- `input[type="file"]` and its `::file-selector-button` styling need explicit handling — DaisyUI's `file-input` component is the intended replacement; verify against the wallpaper upload control.
- Delete `.group-btn` from `_button.sass`. It is **dead CSS** — verified zero usages across all `src-ext` HTML and JS. Do not spend effort porting it to `join`.
- Delete `_button.sass` once all usages are migrated.

## Acceptance criteria

- Every button across `options.html`, `blank.html`, and the partials renders at correct size, colour, and hover/active state, verified by screenshot comparison of each settings section.
- Destructive actions keep their red/error styling — in particular the "Reset NTP settings" button (`#btn-res`, which carries a `confirm()` guard) must remain visually distinct as destructive.
- Icon-only controls (`.widget-chevron`, `.tab-close`) are unchanged in size and do not gain the `min-width: 100px` that the old `.btn` rule applied.
- Keyboard focus rings remain visible on all buttons.
- `_button.sass` is deleted and removed from `src-ext/sass/_core.sass`.
- `npm run build-ext` succeeds; vitest failures unchanged.

## Notes

- Current bespoke buttons are `height: 2.6rem`, `min-width: 100px`, `margin: .4rem`. DaisyUI's default `btn` sizing differs — expect to add sizing utilities at some call sites, and check the two-column button rows (`._2-col`, used for the wallpaper crop Cancel/Next and Cancel/Save&Apply pairs) still line up.

## Comments

**Implemented.** `src-ext/sass/elements/_button.sass` deleted and removed from `_core.sass`.
34 markup sites migrated across `options.html`, `blank.html` (via partials), `changelog.html`,
`gotop.html`, `settings.html`, and `support_me.html`.

### Mapping applied

| was | now | sites |
|---|---|---|
| `btn-p` | `btn btn-primary` | 9 |
| `btn-red` | `btn btn-error` | 2 |
| `b2-btn` (bare) | `btn` | 4 |
| bare `<button>` | `btn` added | 19 |

`.btn-green`/`.btn-blue`/`.btn-orange`/`.btn-black`/`.btn-white`/`.btn-inverted`/
`.btn-transparent`/`._btn_t`/`.pill`/`.outline` had **zero call sites** — they were deleted
with the file rather than mapped. `.group-btn` confirmed dead as the ticket stated and
deleted without porting to `join`.

### Deliberate exclusions

- **`.wdg-tab`** (Layout/Weather sub-tabs) — left alone for ticket 09. Verified `_widget_config.sass`
  styles them self-sufficiently (`background: none`, `border: none`, own padding), so deleting
  `_button.sass` did not strip them.
- **`.widget-chevron` / `.tab-close`** — created in JS (`panelHost.js`, `blank/tabs.js`), never
  touched by the markup migration. `_tabs.sass` gives both explicit `min-width`/`width`/`height`
  (1.4rem and 1rem), so they keep their compact size and did **not** inherit the old
  `min-width: 100px`. Left bespoke: `btn btn-ghost btn-square` would not have preserved them
  at that size.
- **`.theme-toggle`** — this is the header "Switch Theme" control, which has a text label, not
  an icon-only control. Given plain `btn`.

### `input[type="file"]`: the ticket's premise did not match the markup

The ticket called for DaisyUI's `file-input` component. That is not the right replacement here.
All three file inputs (`#wllp_file`, `#import-data`, `#import-theme`) are already
**visually hidden** (`opacity: 0; position: absolute; z-index: -1`) with a paired
`<label for=...>` acting as the visible button. The `::file-selector-button` rules in
`_button.sass` were therefore dead code styling an invisible element.

Correct migration was to put the button classes on the **labels** and leave the inputs
unstyled — done. `file-input` would have required un-hiding the native input and rebuilding
the control for no benefit.

### Two icon regressions caught and fixed

Deleting `_button.sass` removed its `> svg { height: 1.5rem; width: 1.5rem }` rule, which was
the only thing sizing icons that carry no explicit `width`/`height` attribute. Four svgs blew
up to full size — the two `.theme-toggle` icons (header text wrapped to two lines) and two in
`support_me.html`. Fixed with `size-6` (= 1.5rem, the exact old value).

Note `._icon` in `utilities/_general.sass` looks like it would have covered this, but
`options.sass` never imports the utilities layer — only `blank.sass` does. Worth remembering
for ticket 12.

One of these was **self-inflicted**: `support_me.html`'s close icon originally carried
`class="w-6 h-6"`, which I removed in ticket 01 as a dead Tailwind-lookalike. It was genuinely
dead then, but `w-6 h-6` is exactly 1.5rem — the author had pre-empted Tailwind. Restored as
`size-6`.

### Verification

- All settings sections screenshotted in both themes. Pixel diffs against the pre-migration
  baseline are large (4-7%) and **expected** — this is the first ticket that intentionally
  changes appearance. Reviewed by eye rather than by identity.
- Destructive "Reset NTP settings" (`#btn-res`) renders in `--red` (`btn-error`) and stays
  clearly distinct. Its `confirm()` guard is untouched.
- Two-column rows verified by measurement, not by eye: `#b_cc`/`#b_cr` both 352x40 at the same
  `top`, `#b_cc2`/`#b_sbgc` likewise. The crop panes are hidden by default, so this needed
  forcing them visible.
- Focus rings visible in both themes: 2px solid, `rgb(16,16,16)` light / `rgb(250,250,250)`
  dark. Note this is a **change** — the bespoke ring was `var(--focus)` (primary purple);
  DaisyUI uses base-content. Still clearly visible, which is the stated criterion, so accepted
  rather than overridden.
- `#gt-link` now carries both `btn` and `b2-hidden`. Confirmed the hide still works
  (`visibility: hidden; opacity: 0`) — it survives only because `_gotop_link.sass` uses
  visibility/opacity rather than `display`, which DaisyUI's `.btn` would have overridden.
- `CHANGELOG.md` needed migrating again (raw HTML inlined at build time) — it is outside
  `src-ext/` and is missed by any grep scoped to that directory.

`npm run build-ext` succeeds; vitest unchanged at 87 passed / 6 pre-existing failures.
CSS: `options` 37.1 -> 34.1 kB, `blank` 41.6 -> 38.5 kB (bespoke button CSS removed).
