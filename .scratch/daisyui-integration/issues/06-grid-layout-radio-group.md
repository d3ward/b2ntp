Status: ready-for-agent
Blocked by: 05

# Migrate the bookmarks Grid Layout picker (`.group-radio`) to DaisyUI

## Goal

Restyle the bookmarks Grid Layout picker — the icon-labelled radio card group offering Horizontal / Vertical 3 Columns / Vertical 2 Columns — onto DaisyUI, **without regressing the behavioural bugs recently fixed in this control**.

## Scope

- `.group-radio` has exactly **one** usage: `src-ext/partials/settings.html` (the Grid Layout picker). This is a contained, single-site migration.
- Current pattern: native radios are hidden (`& input { display: none }`) and the adjacent `<label>` — containing an inline SVG diagram plus a text caption — is styled as a selectable card via `input[type=radio]:checked ~ label`.
- Migrate to DaisyUI's radio-as-button-group pattern (`join` + `join-item`, or `btn` with `has-[:checked]` styling), preserving the icon-above-caption card layout. The SVG diagrams are meaningful UI (they illustrate each layout) and must be retained.
- **Preserve exactly**, as these carry recently-fixed behaviour:
  - Radio `name="t-style"` and the values `h`, `v2`, `v3`
  - The element IDs `t-style1` (h), `t-style2` (v3, the default), `t-style3` (v2)
  - Every `<label for="...">` association — the current fix depends on clicking labels toggling the underlying radios
  - The `input` event listeners in `src-ext/js/blank/background/settings.js`
- Remove `.group-radio` from `_form.sass`. With tickets 04 and 05 also complete, `_form.sass` should now be deletable — verify nothing remains and remove it from `src-ext/sass/_core.sass`.

## Acceptance criteria

Behavioural (regression guards — these encode bugs fixed in prior work, do not lose them):

- Selecting **Horizontal** sets `--grid-wrap: nowrap` and `--grid-width: 33.33%`; bookmarks render as a single non-wrapping row that overflows and scrolls horizontally on the NTP.
- Selecting **Vertical 2 Columns** sets `--grid-wrap: wrap` and `--grid-width: 50%`; bookmark sections render at ~50% width.
- Selecting **Vertical 3 Columns** sets `--grid-wrap: wrap` and `--grid-width: 33.33%`.
- Every selection **persists** — it must call `f_save_bdy()` so the choice survives a reload and reaches the real NTP page, not just the settings page's own `<body>`.
- On loading the settings page, the radio reflecting the currently-saved layout is pre-checked. On a fresh profile with nothing saved, **Vertical 3 Columns (`t-style2`, value `v3`) is checked** — not 2 columns.
- The state read-back must stay resilient to custom-property serialisation whitespace (the current fix uses `.trim()` on the `getComputedStyle().getPropertyValue()` result). Do not reintroduce a comparison against a leading-space string.

Visual:

- The three option cards render as a cohesive selectable group in both light and dark themes, with the selected card clearly distinguished.
- The layout diagrams (SVGs) remain legible at their current size.

Also: `npm run build-ext` succeeds; vitest failures unchanged.

## Notes

- Verify the full round-trip end-to-end, not just in the settings page: set a layout in `options.html`, then load `blank.html` and confirm the bookmarks actually render in that layout. The previous bug in this control was specifically that the setting never reached the NTP.
- Because DaisyUI's pattern may keep the native radio visible (rather than `display: none`), confirm clicking anywhere on a card still selects it and that an already-checked radio doesn't swallow the interaction — the earlier bug surfaced precisely because clicking an already-checked radio fires no `input` event.
