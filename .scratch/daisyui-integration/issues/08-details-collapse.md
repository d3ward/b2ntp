Status: resolved
Blocked by: 02

# Migrate `details`/`summary` sections to DaisyUI `collapse`

## Goal

Replace the hand-rolled `details` styling in `src-ext/sass/elements/_details.sass` and the `.wdg-subsection` pattern in `src-ext/sass/components/_widget_config.sass` with DaisyUI's `collapse` component.

## Scope

- `_details.sass` styles bare `details` / `summary` elements globally (background `--bg-details`, primary-coloured open state via `details[open] summary`, `details + details` spacing). Migrate to DaisyUI `collapse` + `collapse-arrow`, adding explicit classes to the markup since DaisyUI is class-based.
- `.wdg-subsection` in `_widget_config.sass` is a second, separate collapsible pattern with its own `▶` pseudo-element chevron that rotates 90° on `[open]`, plus `summary::-webkit-details-marker { display: none }`. Converge it onto the same DaisyUI `collapse-arrow` treatment rather than keeping two collapsible styles.
- Known usage sites to audit (non-exhaustive — grep for `<details` across `src-ext`): the "How it works" search-tips section in `settings.html`, and the widget subsections in the Widgets settings tab.
- Preserve the native `<details>`/`<summary>` elements — DaisyUI's `collapse` supports them directly. Do not convert to the checkbox-based or focus-based `collapse` variants, which would lose native disclosure semantics and keyboard behaviour.
- Delete `_details.sass` and remove it from `_core.sass` once migrated.

## Acceptance criteria

- Every collapsible section expands and collapses on click and on keyboard activation (Enter/Space on the summary).
- The disclosure arrow indicates state correctly (collapsed vs expanded) and animates consistently across both the former `details` and former `.wdg-subsection` instances.
- The default-open sections stay open by default — the search-tips `<details>` currently carries the `open` attribute.
- Nested content (paragraphs, headings, the shortcut list) renders with sane padding in both themes.
- Screen-reader disclosure semantics are preserved (native `<details>` retained).
- `npm run build-ext` succeeds; vitest failures unchanged.

## Notes

- The former `details[open] summary` styling used `--bg-details-open` / `--txt-details-open` (a strong primary-coloured header when open). Decide deliberately whether to keep that emphasis via DaisyUI modifiers or adopt DaisyUI's quieter default — either is fine, but apply the same choice to both patterns so they converge rather than staying visually distinct.

## Comments

**Implemented.** `_details.sass` deleted and removed from `_core.sass`.

### The scope was one element, not two patterns

Grepping `<details` across `src-ext` as the ticket asked turned up exactly **one** usage: the
"How it works" search-tips block in `settings.html` (which does carry `open`).

`.wdg-subsection` — the second collapsible pattern the ticket describes, with the `▶`
pseudo-element chevron and `::-webkit-details-marker` reset — has **zero markup usages**. The
"widget subsections in the Widgets settings tab" do not exist. It was dead CSS and is deleted
from `_widget_config.sass` rather than converged onto anything.

So the "apply the same choice to both patterns so they converge" requirement is satisfied
trivially: there is only one pattern left.

### Markup

```html
<details class="collapse collapse-arrow bg-base-300" open>
  <summary class="collapse-title font-medium">How it works</summary>
  <div class="collapse-content">…</div>
</details>
```

Native `<details>`/`<summary>` retained, as required — not the checkbox or focus variant.

The old classes `_bg-bg3 _radius` were replaced with `bg-base-300`. Worth noting they were
already doing **nothing**: those are bespoke utilities from `sass/utilities/`, which only
`blank.sass` imports — `options.sass` never loads that layer, and this element only ever
renders on the options page. (Same trap as the `._icon` finding in ticket 03.)

### Open-state emphasis: adopted DaisyUI's default, deliberately

The ticket left this open. The old `details[open] summary` used `--bg-details-open` /
`--txt-details-open`, i.e. a strong primary-purple header bar with white text.

I first tried to preserve it with `[&[open]>summary]:bg-primary`. It does not apply —
DaisyUI's `.collapse-title` carries the `:not(#\#)` x4 specificity hack and a Tailwind utility
cannot outrank it (same root cause as tickets 01/02/07). Preserving the purple would have meant
another `!important` block.

Given the ticket explicitly permits either choice, DaisyUI's quieter default is the better
trade here: no extra `!important`, and one less bespoke override to maintain. The section now
reads as a normal collapsible panel with a rotating chevron, `bg-base-300` background.

### Verification

- Native `<details>` retained (`tagName === 'DETAILS'`), so screen-reader disclosure semantics
  are intact.
- The `open` attribute is honoured — the section is expanded on load.
- Click on the summary collapses and re-expands.
- Keyboard: `Enter` expands, `Space` collapses.
- Arrow indicates state (`collapse-arrow` rotates); nested content (paragraphs, `h6` headings,
  shortcut list) renders with sane padding in both themes.

`npm run build-ext` succeeds; vitest unchanged at 87 passed / 6 pre-existing failures.
