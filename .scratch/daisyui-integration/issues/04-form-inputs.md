Status: ready-for-agent
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
