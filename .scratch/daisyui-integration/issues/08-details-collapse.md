Status: ready-for-agent
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
