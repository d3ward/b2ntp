Status: resolved
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

## Comments — revision: a11y-dialog replaced with native `<dialog>`

**Maintainer changed direction mid-implementation** (see `docs/daisyui/Modal.md`): use DaisyUI's
default modal rather than keeping `a11y-dialog`. This supersedes this ticket's "Keep
`a11y-dialog`" scope line and the spec's Out-of-Scope entry.

All three dialogs are now native `<dialog>` elements opened with `showModal()` — DaisyUI's
recommended method (Method 1 in the docs).

- `a11y-dialog` **removed from `package.json`**. `src-ext/js/components/dialog.js` was a
  vendored copy of it and is imported nowhere — left in place, flagged for ticket 12's sweep.
- `data-a11y-dialog-hide` → `<form method="dialog">` wrappers, which close the dialog natively.
- Backdrop → `<form method="dialog" class="modal-backdrop"><button>close</button></form>`,
  straight from the docs.
- `data-a11y-dialog-show` → `data-dialog-open`, wired by a 5-line `wireDialogOpeners()`.
- `background/settings.js`: `.on("hide")` → `addEventListener("close")`, `.hide()` → `.close()`,
  `.show()` → `.showModal()`. Three call sites.

**This deleted almost all the CSS this ticket originally needed.** Esc, focus trapping, focus
restore, inertness and top-layer painting now come from the platform, and DaisyUI's `.modal`
rules key off the `[open]` attribute `showModal()` sets. Every `!important` visibility,
opacity, backdrop and z-index override is gone; `_dialog.sass` is down to the structural rules
DaisyUI lacks.

One `!important` remains, on `max-width`. DaisyUI defaults `.modal-box` to 32rem and its docs
say to override with a `max-w-*` utility — **that does not work in this pipeline**. Verified:
adding `max-w-[42rem]` leaves the computed value at 512px, because `postcss-cascade-layers`
flattens `@layer` and leaves Tailwind utilities at low specificity against DaisyUI's
`:not(#\#)` hack (up to 10 deep on some rules). More evidence for ticket 13.

Also dropped a `.modal-backdrop > button` rule I had added — DaisyUI already stretches it
(`place-self: stretch stretch`), and mine fought its `z-index: -1`.

### Toasts and the top layer — a real consequence of this switch

A native `<dialog>` paints in the **top layer**, which no `z-index` can beat. So the ticket-10
requirement "toasts appear above open modals" broke the moment dialogs went native: verified
the toast rendered *underneath* the modal.

Fixed by promoting the toast container into the top layer too — `#nt1` is now
`popover="manual"`, and `toast.js` calls `showPopover()` when raising a toast and
`hidePopover()` once the last one is removed. Confirmed by screenshot that a toast now paints
above an open modal.

Two notes on that:
- The UA popover styles bring their own border/padding/background/margin. Only those are reset;
  resetting `inset`/`width`/`translate` as well knocked the container out of position, because
  `.toast-center` and `.toast-top` own those (with a **10-deep** specificity hack).
- `document.elementFromPoint()` at the toast's centre still reports the modal backdrop, so
  click-to-dismiss likely does not work *while a modal is open*. Auto-dismiss is unaffected,
  and toasts during an open modal are a corner case, but it is not fully fixed.

All 24 dialog checks re-run and pass against the native implementation, including Esc, close
button, backdrop click, focus trap, focus restore, 80vh/42rem, reduced motion, and the
changelog auto-open gate.

### Fix (raised in code review): initial focus landed on the backdrop

The backdrop `<form method="dialog">` was placed **before** `.modal-box`, whereas
`docs/daisyui/Modal.md` puts it after. Because `showModal()` focuses the first focusable
descendant, focus landed on the backdrop's hidden `close` button — so **pressing Enter on a
freshly-opened dialog dismissed it immediately**.

My original "focus is trapped inside" check passed straight through this: the backdrop button
*is* inside the dialog, so containment was satisfied while focus placement was wrong. Containment
is not the same assertion as correct initial focus.

Fixed twice over: the backdrop now follows `.modal-box` per the docs, and `.modal-box` carries
`tabindex="-1" autofocus` so focus starts on the container rather than on whichever control
happens to come first. Verified: focus lands on `.modal-box`, and Enter no longer closes the
dialog. All 21 dialog checks still pass.
