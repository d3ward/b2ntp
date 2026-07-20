Status: done
Blocked by: 02

# Migrate text inputs, selects, textareas, and fieldsets to DaisyUI

## Goal

Replace the hand-rolled text-input / select / textarea / fieldset styling in `src-ext/sass/elements/_form.sass` with DaisyUI's `input`, `select`, `textarea`, and `fieldset` components.

## Scope

- The current Sass uses a broad element selector — `textarea, input:not([type=color]):not([type=file]):not([type=button]):not([type=range]):not([type=radio]):not([type=checkbox]), select` — so it styles inputs implicitly. DaisyUI is class-based: every affected control needs an explicit `input` / `select` / `textarea` class added in markup.
- Affected controls to audit and migrate across `src-ext/partials/settings.html` and `src-ext/options.html`, including at minimum: the weather location field (`#wt_loc`), the search-shortcuts textarea (`#sb_txt`), the date/time format selects (`#dateFormat`, `#timeFormat`), the wallpaper URL/value field (`#wllp_value`), and the auto-switch type select (`#auto-switch-type`).
- `input[type="range"]` is currently excluded from the bespoke input styling and unstyled — migrate the sliders (blur `#tg_r77`, darkness `#tg_r777`, dark-mode start/end `#start-time`, `#end-time`) to DaisyUI's `range` component.
- Port the focus treatment: the bespoke rule uses `border-color: var(--primary)` plus `box-shadow: 0 0 0 5px var(--primary-h)`. DaisyUI's focus ring differs — confirm the result is still clearly visible in both light and dark mode rather than accepting a weaker default.
- Preserve disabled/readonly styling behaviour (`&:disabled, &[readonly]`).
- The custom `select` dropdown arrow is currently drawn with three stacked `linear-gradient` backgrounds. Drop that entirely in favour of DaisyUI's built-in select styling.
- **Do not** touch `input[type="color"]` styling or `.stt_clfrt` — the colour swatches are handled in ticket 09's sibling concerns and have no DaisyUI equivalent (see Notes).
- Remove the migrated rules from `_form.sass`. The file also contains checkbox/radio/toggle rules (ticket 05) and `.group-radio` (ticket 06) — delete `_form.sass` entirely only once those tickets are also done; otherwise leave the not-yet-migrated parts in place.

## Acceptance criteria

- All text inputs, selects, textareas and range sliders in every settings section render correctly in both light and dark themes, verified by screenshot.
- Focus states are clearly visible on every migrated control in both themes.
- Editing and blurring the search-shortcuts textarea (`#sb_txt`) still parses and saves shortcuts — this control has a `blur` handler in `src-ext/js/options.js` and is easy to break by changing markup structure.
- The four range sliders still update their live value readouts and persist on input.
- `npm run build-ext` succeeds; vitest failures unchanged.

## Notes

- `.field`, `[class^="with-icon"]` and the `with-icon-left/right` helpers in `_form.sass` are layout helpers around inputs; convert to Tailwind utilities as part of this ticket if used, or delete if unused — verify before deciding.
- The colour swatch trigger (`.stt_clfrt`, 54 occurrences, drives `vanilla-picker`) stays bespoke — there is no DaisyUI component for an arbitrary-colour trigger swatch. Only its spacing/sizing may be adjusted to sit consistently next to migrated inputs.

## Comments

**Implemented.** Migrated rules removed from `_form.sass`, which now holds only
`input[type="color"]` (kept per ticket) plus the checkbox/radio/toggle `@supports` block
(ticket 05) and `.group-radio` (ticket 06).

### Controls migrated

| class added | controls |
|---|---|
| `input` | `#wt_loc` |
| `select` | `#auto-switch-type`, `#timeFormat`, `#dateFormat` |
| `textarea` | `#wllp_value`, `#sb_txt` |
| `range` | `#tg_r77`, `#tg_r777`, `#start-time`, `#end-time` |

The bespoke triple-`linear-gradient` select arrow is gone, replaced by DaisyUI's built-in
select styling.

**No `fieldset` exists in the markup** — the `fieldset` rule in `_form.sass` was dead and
was deleted rather than migrated. Same for `.field` and the `[class^="with-icon"]` helpers:
audited as the ticket asked and found to have **zero usages**, so deleted rather than
converted to Tailwind utilities.

### `#sb_input` deliberately NOT migrated

The NTP search bar matched the old generic input selector, but it is New Tab Page chrome and
explicitly out of scope for DaisyUI. Rather than give it an `input` class, the two properties
it was silently inheriting (`display: block`, `line-height: 1.25rem`) were made explicit in
`_search_bar.sass`. Verified: `blank.html` renders **pixel-identical** before and after this
ticket, so the NTP was genuinely untouched.

### The dual-range slider CSS was already dead

The ticket treats all four sliders as equivalent. They are not — `#start-time`/`#end-time`
have a bespoke dual-range implementation in `base/_ntp.sass` (overlapping absolute
positioning, `pointer-events` juggling, custom SVG thumbs, a `.slider-track` underlay).

That CSS never applied. `base/_ntp.sass` is imported **only by `blank.sass`**, while the
slider markup lives in `settings.html`, which only ever renders inside `options.html`.
Confirmed at runtime: all four sliders computed `appearance: auto`, `position: static`,
`pointer-events: auto` — fully native, unstyled.

So migrating all four to `range` is safe and a strict improvement; there was no working
dual-slider behaviour to regress. The dead `.double-slider` / `.slider-track` /
`#start-time::-webkit-slider-thumb` rules are still sitting in `base/_ntp.sass` — worth
sweeping in ticket 12, noted there.

### Border colour (deferred here from ticket 02)

Left as DaisyUI's derived border rather than forcing `--brd`. DaisyUI computes
`base-content @ 20%`, which resolves to ≈`#d5d6d7` in light against `--brd`'s `#d1d5db` —
visually equivalent. Overriding it would mean fighting DaisyUI's `:not(#\#)` x4 specificity
per component for no visible gain, so the mapping is dropped rather than carried further.

### Verification

- Focus visible on every migrated control in both themes: 2px solid, `rgb(16,16,16)` light /
  `rgb(250,250,250)` dark. This replaces the bespoke `border-color: --primary` +
  `box-shadow: 0 0 0 5px --primary-h` treatment; clearly visible, which is the criterion.
- Disabled preserved and verified in both themes: background moves base-100 → base-200
  (`#f9fafb`→`#f3f4f6` light, `#040404`→`#101010` dark) with `cursor: not-allowed`.
  `[readonly]` needed no porting — grep shows **no form control uses it**; the old rule was dead.
- `#sb_txt` blur handler intact — set a shortcut block, fired `blur`, confirmed
  `sb_data` persisted as `{placeholder, default, bang, g}`. This was the control the ticket
  flagged as easy to break.
- Range live readouts and persistence: blur slider → readout `7` and `body[style]` updated;
  `#start-time` → readout `21:00`.
- `npm run build-ext` succeeds; vitest unchanged at 87 passed / 6 pre-existing failures.
