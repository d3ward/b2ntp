Status: done
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

## Comments

**Implemented.** The nav `<ul>` is now a DaisyUI `menu`; `layout/aside_ntp.sass` keeps only
the collapse/expand behaviour and the slot colours.

### The cutout was dropped, not preserved

This ticket insisted the curved-cutout active item was a design signature and that losing it
would be a regression. **The maintainer decided mid-implementation to drop it** ("we can skip
the cutout"), so the `:before`/`:after` `box-shadow` pseudo-elements are gone and DaisyUI's
`menu-active` carries the active state. This supersedes the ticket's "Explicitly preserve as
bespoke CSS" scope line.

### JS contract

`pagesRoute.js` now toggles **`menu-active`** rather than `active`, per the ticket's
instruction not to leave the JS toggling a class with no styling attached. All three touch
points updated (query, remove, add), and the initial `class="active"` in the markup moved to
`menu-active`.

Note `aside.active` — the *expanded* state of the sidebar itself — is a **different** class and
is deliberately untouched.

### Keyboard accessibility was broken before this ticket

The nav items are `<a topage="...">` with **no `href`**, which means they were never in the tab
order at all — the settings navigation could not be reached or operated by keyboard.

Fixed rather than papered over: each item gets `tabindex="0"` and `role="button"`, and
`pagesRoute.js` gains a `keydown` handler for Enter/Space (an `<a>` without `href` does not fire
`click` on Enter). A visible focus ring also had to be restored — DaisyUI's `menu` suppresses
the outline, so the reset's `*:focus-visible` rule never showed. Verified: Tab reaches the
items, the ring renders at `2px solid`, and Enter activates the focused item.

### Verification — 15 checks

- All seven sections route correctly; exactly one `section.page-active` and exactly one
  `[topage].menu-active` at any time.
- Active item visually distinct (`rgb(152,90,221)` = `--c23` vs transparent).
- Collapsed 64px / expanded 216px (4rem / 13.5rem), `.5s` transition preserved, icons stay
  visible when collapsed.
- `--c21`..`--c25` all still resolve; `theme/ntp.sass` untouched — the nav only consumes them.

The hover/active/focus rules need `!important` because DaisyUI's menu carries the `:not(#\#)`
specificity hack. Ticket 13 should reduce this.

`npm run build-ext` succeeds; vitest unchanged at 87 passed / 6 pre-existing failures.
