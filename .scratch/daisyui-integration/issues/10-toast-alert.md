Status: ready-for-agent
Blocked by: 02

# Migrate toasts to DaisyUI `toast` + `alert`

## Goal

Replace the hand-rolled toast styling in `src-ext/sass/elements/_toast.sass` with DaisyUI's `toast` positioning wrapper and `alert` status components, keeping the `toast()` factory's public behaviour identical.

## Scope

- `src-ext/js/components/toast.js` exports a `toast(options)` factory used by both `blank.js` and `options.js` (as `ntoast`). It builds elements with class `toast-item` plus a type class, and inlines its own status SVG icons.
- Map the type classes to DaisyUI: `success` → `alert-success`, `error` → `alert-error`, `warn` → `alert-warning`, `info` → `alert-info`. Note the bespoke `warn` variant currently references `--yellow`, which is **not defined** in `theme/light.sass` or `theme/dark.sass` — this is an existing latent bug; DaisyUI's `alert-warning` resolves it via the theming bridge (ticket 02, `--orange`).
- Wrap the toast container (`#nt1`) in DaisyUI's `toast` positioning classes. The current CSS positions it `fixed` at `top: 0`, full width, centred, `z-index: 9999` — preserve top-centre placement.
- **Do not change** `toast.js`'s function signature, timeout handling (`t.timeout`, default 3000ms; callers pass 2000ms), auto-close behaviour, or click-to-dismiss.
- The dismissal animation uses a `toast-out` class plus a 300ms `setTimeout` before `.remove()`, with `@keyframes toast-in`/`toast-out`. Keep the timing contract — if DaisyUI/Tailwind animations replace the keyframes, the JS's 300ms removal delay must still match the animation duration, or toasts will vanish abruptly or linger.
- DaisyUI's `alert` ships its own icon conventions; the existing inline SVGs in `toast.js` may be kept. Either way, icons must remain sized consistently (currently `20px`).
- Delete `_toast.sass` and remove it from `_core.sass`.

## Acceptance criteria

- Each toast type (success, error, warning, info) renders with correct, distinct colouring in both light and dark themes.
- The warning toast is now correctly coloured (it currently references an undefined `--yellow`).
- Toasts still auto-dismiss after their configured timeout and still dismiss on click.
- The exit animation still plays fully before the element is removed — no abrupt disappearance, no lingering ghost element.
- Multiple stacked toasts still stack without overlapping.
- Toasts appear above all other UI including open modals (verify against ticket 07's migrated dialogs).
- `npm run build-ext` succeeds; vitest failures unchanged.

## Notes

- Easy places to trigger each type for verification: "Sync Bookmarks" (success), the reset-settings flow (warn), and `f_save_bdy()`'s catch branch (error).
