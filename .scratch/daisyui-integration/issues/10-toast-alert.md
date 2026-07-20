Status: resolved
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

## Comments

**Implemented.** `_toast.sass` deleted and removed from `_core.sass`. Container `#nt1` is now
`toast toast-top toast-center`; `toast.js` builds items as `alert` + a status colour class.
The factory's signature, `t.timeout` handling (default 3000, callers pass 2000), auto-close and
click-to-dismiss are unchanged.

Type mapping: `success`→`alert-success`, `error`→`alert-error`, `warn`→`alert-warning`,
`info`→`alert-info`.

### Two latent bugs fixed

1. **`warn` was invisible-ish.** It referenced `--yellow`, which is defined in neither
   `theme/light.sass` nor `theme/dark.sass`. Now resolves through the bridge to `--orange`
   (`rgb(255,133,27)`).
2. **The exit animation never played.** `toast.js` adds the class `toast-out`, but the Sass
   nested it as `&-item-out` under `.b2-toast`, compiling to `.b2-toast-item-out` — a selector
   that never matched anything. The 300ms `setTimeout` before `.remove()` was running against
   no animation at all, so toasts vanished abruptly. The keyframes now live in `tailwind.css`
   as a real `.toast-out` rule at exactly 300ms, matching the JS timeout.

### Class names are written as literals on purpose

`typeClass` in `toast.js` maps to whole class strings (`'alert-success'`) rather than composing
`'alert-' + type`. Composed names are invisible to Tailwind's extractor and would simply not be
generated. This is precisely the dynamic-class risk ticket 13 asks about — resolved at the
source rather than with a safelist.

### z-index needed stating explicitly

Toasts must sit above open dialogs. A `z-[9999]` utility on the container **did not work**:
Tailwind utilities are low-specificity once `postcss-cascade-layers` flattens the layers, while
DaisyUI's `.modal` carries its `:not(#\#)` hack and computes to `z-index: 999`. Stated as
`#nt1.toast { z-index: 9999 !important }` in `tailwind.css`.

The same investigation showed the `z-index: 50` I added to `.modal` in ticket 07 was **inert**
for the same reason — DaisyUI's own 999 is what was actually applying. That rule has been
removed rather than left as dead code, and ticket 07's note corrected.

### Verification

- All four types render distinct, correct colours in both themes (success green, error red,
  warning orange, info blue) with no transparent background.
- Container is `position: fixed`, top-centred (16px from top, horizontally centred).
- Toasts stack without overlapping (verified by comparing bounding rects pairwise).
- `toast-out` resolves to `animation: toast-out 0.3s`, matching the removal delay.
- Toasts stack above modals (9999 > 999).

`npm run build-ext` succeeds; vitest unchanged at 87 passed / 6 pre-existing failures.

## Comments — revision: aligned to DaisyUI's documented alert markup

Per `docs/daisyui/Toast.md` and `Alert.md`, the container/item split is already the documented
pattern (`toast toast-top toast-center` wrapping `alert alert-*`). The item markup is now
aligned too:

- `role="alert"` (was `role="status"` + `aria-live`), matching the docs.
- DaisyUI's documented stroke-based icons at `h-6 w-6 shrink-0 stroke-current`, so they inherit
  the alert's content colour, replacing the bespoke 20px fill icons.
- Message wrapped in a real `<span>`. The old code did `innerHTML = icon + message + '</span>'`
  — an unbalanced closing tag with no opening `<span>`. Now built with `textContent`, which also
  stops error strings (`ntoast.error(err.message)`) being interpreted as HTML.

`#nt1` additionally carries `popover="manual"` and `toast.js` promotes it into the top layer —
required now that dialogs are native `<dialog>`. Full rationale in ticket 07's revision note.
