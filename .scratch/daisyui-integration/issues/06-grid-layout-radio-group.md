Status: resolved
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

## Comments

**Implemented.** `.group-radio` is gone and **`_form.sass` is deleted** and removed from
`_core.sass`, as the ticket expected.

To get there, the `input[type="color"]` rules (kept deliberately in ticket 04 — no DaisyUI
equivalent for an arbitrary-colour trigger) were moved into `components/_settings.sass`,
where they sit next to the `.stt_clfrt` swatch rules they belong with. Without that move the
file could not have been deleted.

### Pattern chosen

`btn` + `peer-checked:` utilities rather than `join`/`join-item`. Both were sanctioned by the
ticket; `btn` won because `join` collapses the inter-card gap and shares borders, which loses
the three-separate-cards look. Structure per option:

```html
<div class="flex-1">
  <input class="peer sr-only" type="radio" name="t-style" id="t-style1" value="h" />
  <label for="t-style1" class="btn h-auto w-full flex-col gap-1 py-2 opacity-50 font-normal
                               peer-checked:opacity-100 peer-checked:btn-primary
                               peer-checked:border-primary">
```

Unnamed `peer` is safe here because `peer-checked:` compiles to a sibling combinator and each
wrapper holds exactly one input/label pair. The SVG diagrams keep their 40px height via `h-10`
(the old `.group-radio svg { height: 40px }`).

### Preserved exactly

`name="t-style"`, values `h`/`v3`/`v2`, IDs `t-style1`/`t-style2`/`t-style3`, `checked` on
`t-style2`, every `<label for="...">`, and the `input` listeners in
`blank/background/settings.js` — that file was **not modified**.

### `sr-only` instead of `display: none` — a small a11y improvement

The bespoke rule used `& input { display: none }`, which removes the radios from the tab order
entirely, so the Grid Layout picker was not keyboard-operable at all. `sr-only` hides them
visually while keeping them focusable and announced. Verified `#t-style1` now takes focus.

### Verification — all 15 regression guards hold

Scripted against the production build, driving the **labels** (not the inputs), since the
earlier bug was specifically about label clicks:

- Fresh profile with nothing saved → `t-style2` (v3, 3 columns) is checked, not 2 columns.
- Horizontal → `--grid-wrap: nowrap`, `--grid-width: 33.33%`.
- Vertical 2 Columns → `wrap` / `50%`. Vertical 3 Columns → `wrap` / `33.33%`.
- Every selection persists via `f_save_bdy()` (asserted against stored `ntp_bdy`).
- After reload, the saved layout is pre-checked — the `.trim()`-based read-back still
  survives custom-property serialisation whitespace.
- **Full round-trip:** after setting a layout in `options.html`, loading `blank.html` shows
  the matching computed `--grid-wrap`/`--grid-width`. This is the bug the ticket warned about
  (the setting never reaching the NTP) and it is verified end-to-end, not just in settings.
- Re-clicking an already-checked card leaves state intact.

*Testing note:* clicking `t-style2` on a fresh profile is a no-op, because it is already
checked and an already-checked radio fires no `input` event. That is correct behaviour, but it
initially read as two test failures — the test now moves selection away first.

Visually the three cards read as a cohesive group in both themes, selected card in `--primary`
with `--txt-on-p` text, unselected dimmed to 50%, diagrams legible.

`npm run build-ext` succeeds; vitest unchanged at 87 passed / 6 pre-existing failures.
