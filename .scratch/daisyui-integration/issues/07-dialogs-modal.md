Status: done
Blocked by: 03

# Migrate dialogs to DaisyUI `modal`

## Goal

Replace the hand-rolled dialog styling in `src-ext/sass/components/_dialog.sass` with DaisyUI's `modal` classes, while keeping `a11y-dialog` as the behaviour layer.

## Scope

- Three dialog markup sites, all using the `.dialog` / `.dialog-overlay` / `.dialog-content` structure:
  - `src-ext/options.html` — the colour picker dialog (`#dlg_clvn`)
  - `src-ext/partials/changelog.html` — `#dlg_changelog` (also used by `blank.html`)
  - `src-ext/partials/support_me.html` — `#dlg_support`
- Map to DaisyUI: `.dialog` → `modal`, `.dialog-overlay` → `modal-backdrop`, `.dialog-content` → `modal-box`, footer button rows → `modal-action`.
- **Keep `a11y-dialog`.** It is instantiated in both `src-ext/js/options.js` (`initDialog()`) and `src-ext/js/blank.js`, and provides show/hide and focus trapping. Swapping it for native `<dialog>` is explicitly out of scope.
- Preserve every hook `a11y-dialog` depends on: the `data-a11y-dialog-hide` attribute on overlays and close buttons, `aria-hidden`, `aria-labelledby`, and the `.dialog[aria-hidden='true'] { display: none }` visibility contract. DaisyUI's `modal` normally controls visibility via `modal-open` or the `:has()` checkbox/`<dialog>` pattern — reconcile the two so `a11y-dialog` remains the single source of truth for open/closed state. Do not end up with two competing visibility mechanisms.
- Preserve the existing structural CSS that DaisyUI does not provide: `max-block-size: 80vh/80dvb`, `max-width: 42rem`, the `>section { overflow: auto }` scrolling body, and the `.dialog-sm` (320px) / `.dialog-lg` (unset) size variants.
- Keep the reduced-motion handling (`@media (prefers-reduced-motion: reduce)`) — DaisyUI's modal animates, and that must remain suppressible.
- The dialog's `border-radius` was recently standardised to `var(--radius)`; the DaisyUI equivalent should resolve to the same value via the theming bridge (ticket 02).

## Acceptance criteria

- All three dialogs open and close correctly — via their trigger, via the close button, via the overlay click, and via `Esc`.
- Focus is trapped inside an open dialog and returns to the trigger on close.
- The changelog dialog still auto-opens on a version change (`blank.js` compares stored `ntp_version` against `packageJSON.version`) and not otherwise.
- The colour picker dialog still hosts `vanilla-picker` correctly and applies the chosen colour on OK (`#cp_ok`).
- Long dialog content still scrolls within the dialog rather than the page.
- With `prefers-reduced-motion: reduce`, dialogs appear without animation.
- `_dialog.sass` is deleted (or reduced to only the structural rules DaisyUI lacks) and `_core.sass` updated.
- `npm run build-ext` succeeds; vitest failures unchanged.

## Notes

- Blocked by ticket 03 because dialog footers contain buttons; migrating dialogs first would mean restyling those buttons twice.
- `src-ext/sass/elements/_picker.sass` (third-party `vanilla-picker` overrides) is **not** in scope — leave it untouched.

## Comments

**Implemented.** All three dialogs (`#dlg_clvn`, `#dlg_changelog`, `#dlg_support`) migrated:
`.dialog`→`modal`, `.dialog-overlay`→`modal-backdrop`, `.dialog-content`→`modal-box`,
footers→`modal-action`. `a11y-dialog` is untouched and remains the behaviour layer.

`.dialog-sm`, `.dialog-lg` and `.dialog-close` had **zero markup usages** — dead CSS, deleted
rather than ported.

### Reconciling the two visibility systems

This was the whole difficulty, and it was worse than "add a class". DaisyUI gates a **set** of
properties on `[open]` / `:target` / `:popover-open` — none of which `a11y-dialog` sets on a
`<div>`. Everything below had to be re-derived from `aria-hidden` so there stays exactly one
source of truth:

| property | symptom when missed |
|---|---|
| `.modal` visibility/opacity/pointer-events | dialog stayed invisible |
| `.modal-box` **opacity** | box laid out at full size, painted fully transparent |
| `.modal-box` **background-color** | box translucent, page showing through |
| `.modal-backdrop` background | no dim behind the dialog |

Two traps worth recording:

1. **a11y-dialog *removes* `aria-hidden` on show** rather than setting it to `"false"`
   (`a11y-dialog.js:307`). A `[aria-hidden='false']` selector never matches; the rule must be
   `:not([aria-hidden='true'])`.
2. **DaisyUI ships no z-index on `.modal`** because it targets `<dialog>`, which the browser
   paints in the top layer. These are plain `<div>`s, so they stack normally and were painted
   over entirely by page content. Restored `z-index: 50`, the bespoke value, which keeps
   toasts (9999) above dialogs for ticket 10.

`!important` is used on those overrides. It is not laziness: DaisyUI ships `.modal` with a
`:not(#\#)` x4-x5 specificity hack (~4-5 ID selectors) that no selector we can reasonably
write outranks. This is the consequence of `postcss-cascade-layers` flattening `@layer`,
recorded in tickets 01/02 and still open for ticket 13.

### Latent NTP theming bug found and fixed

Chasing why buttons inside the changelog dialog looked wrong **only on `blank.html`** turned up
something bigger: `--color-base-200`, `--btn-bg` and `--border` were **all empty there**.

`blank.js` set `data-theme` only from its `onChange` handler, which fires on a *change*. On a
normal load the NTP `<body>` had **no `data-theme` attribute at all**. `options.js` sets it
eagerly at line 25; `blank.js` never did.

Consequences, both pre-existing:
- Every DaisyUI token is keyed to `[data-theme]`, so migrated components on the NTP were
  completely unstyled until something toggled the theme.
- Independently of DaisyUI: a user whose stored theme is **dark** got a **light** NTP on load,
  because `theme/dark.sass` is also keyed to `[data-theme="dark"]`.

Fixed by setting the attribute on load in `blank.js`, mirroring `options.js`. This retroactively
hardens ticket 02 — the bridge assumed an attribute that was not always present.

*Method note:* computed styles reported the dialog as `visibility: visible; opacity: 1` while it
was invisible on screen. Only looking at rendered pixels caught it. Worth not trusting
`getComputedStyle` alone for "is it visible".

### Verification — 21 checks, all passing

Per dialog: opens via trigger; closes via close button, backdrop click, and `Esc`; focus trapped
inside on open; focus returns to the trigger on close. Plus:

- Long content scrolls inside the dialog (`section` `overflow: auto`), body does not scroll.
- `max-block-size` 80vh honoured (425px of a 900px viewport) and `max-width` exactly 672px = 42rem.
- Colour picker dialog opens from a `.stt_clfrt` swatch, hosts `vanilla-picker`, `#cp_ok` present.
- `prefers-reduced-motion: reduce` → `animation-name: none`, `transition: none`.
- Changelog auto-opens on first load and **not** on the second, so the `ntp_version` comparison
  still gates it.

`npm run build-ext` succeeds; vitest unchanged at 87 passed / 6 pre-existing failures.
