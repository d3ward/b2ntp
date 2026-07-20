Status: ready-for-agent
Blocked by: 02

# Migrate the settings sidebar navigation to DaisyUI `menu`

## Goal

Restyle the settings page's left navigation (`#settings-panel aside`, styled in `src-ext/sass/layout/aside_ntp.sass`) onto DaisyUI's `menu` component, while **retaining the bespoke "connected tab" cutout visual** on the active item.

## Scope

- The nav lists the settings sections via `<a topage="#p-...">` links: Bookmarks, Background, Widgets, Search, Backup, About.
- Migrate the list structure and item spacing/hover to DaisyUI `menu` (vertical), with `menu-active` (or equivalent) for the current item.
- **Explicitly preserve as bespoke CSS layered on top of `menu`:** the signature curved-cutout active-item treatment. It is built from `:before`/`:after` pseudo-elements using `box-shadow: 7.5px ±7.5px 0 7.5px` with `border-*-radius: var(--radius-b)`, producing the "tab connected to the panel" look. This is a deliberate design signature, not incidental styling — do not flatten it into a plain DaisyUI active state.
- Preserve the collapse/expand behaviour: the aside is `width: 4rem` collapsed and `13.5rem` when `.active`, with a `.5s` transition, and `.a-title` labels that appear when expanded while `.a-icon` icons remain visible.
- **Preserve the JS contract** in `src-ext/js/components/pagesRoute.js`: it queries `[topage]` elements, toggles the `active` class on the link, and toggles `page-active` on the target `<section>`. If DaisyUI's active class differs from `active`, update `pagesRoute.js` so the class it toggles is the one actually styled.
- This nav uses the NTP colour slots `--c21` through `--c25` (shared with the NTP sidebar widget). Those slot values were recently corrected and **must not be changed** — the nav may keep consuming them, but do not redefine or re-point them here.

## Acceptance criteria

- Clicking each nav item navigates to the correct settings section; exactly one section is `page-active` at a time.
- The active item retains the curved cutout visual in both light and dark themes.
- Collapsed (4rem, icons only) and expanded (13.5rem, icons + labels) states both render correctly, and the transition between them is smooth.
- Hover states work on non-active items.
- Keyboard navigation reaches every nav item with a visible focus indicator.
- The `--c21`–`--c25` slot definitions in `theme/ntp.sass` are unchanged.
- `npm run build-ext` succeeds; vitest failures unchanged.

## Notes

- If the cutout pseudo-elements conflict with DaisyUI `menu`'s own padding/border-radius, prefer adjusting the bespoke layer over abandoning the effect. Losing this visual is a regression, not a simplification.
