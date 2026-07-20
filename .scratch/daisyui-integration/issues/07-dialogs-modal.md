Status: ready-for-agent
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
