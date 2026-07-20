Status: resolved
Blocked by: 02

# Migrate checkboxes, radios, and toggles to DaisyUI

## Goal

Replace the hand-rolled `@supports (-webkit-appearance: none)` checkbox/radio/toggle block in `src-ext/sass/elements/_form.sass` (roughly 130 lines of bespoke CSS) with DaisyUI's `checkbox`, `radio`, and `toggle` components.

## Scope

- Migrate `input[type="checkbox"]:not(.toggle)` → DaisyUI `checkbox`.
- Migrate `input[type="checkbox"].toggle` → DaisyUI `toggle`. Note b2ntp already uses the class name `toggle` on these inputs, which collides with DaisyUI's component name — verify the DaisyUI component takes over cleanly and the bespoke rules are fully removed, so the two systems don't both style the same element.
- Migrate `input[type="radio"]` → DaisyUI `radio`.
- Known toggle/checkbox call sites to verify (non-exhaustive; audit `settings.html` fully): `#sidebar-enabled` (Show Sidebar), `#timeSeconds`, `#auto-switch`, the per-widget enable toggles in the Layout tab (`.wdg-toggle`), and `#wt_status` (weather status).
- Preserve the `input + label` pairing styles — the bespoke CSS styles adjacent labels (`margin-left: .3rem`, `cursor: pointer`, disabled-label handling). DaisyUI expects a specific label/`fieldset-label` structure; adjust markup as needed while keeping every `for=`/`id=` association intact.
- **Excluded from this ticket:** `.group-radio` (the Grid Layout icon-card picker) — it also matches `input[type="radio"]` but is a distinct pattern handled in ticket 06. Its rule `& input { display: none }` deliberately hides the native radio. Make sure the changes here don't break that hiding before ticket 06 lands.

## Acceptance criteria

- Every checkbox, toggle, and radio in settings renders correctly in both light and dark themes, checked and unchecked, verified by screenshot.
- Toggling any setting still persists immediately — spot-check `#sidebar-enabled`, `#auto-switch`, and `#timeSeconds` by toggling, reloading, and confirming the state survives.
- The per-widget enable toggles in the Layout tab still enable/disable widgets on the NTP.
- Disabled controls still render as disabled and are not interactive.
- Keyboard interaction (Tab to focus, Space to toggle) works on all three control types.
- The `@supports` block is removed from `_form.sass`.
- `npm run build-ext` succeeds; vitest failures unchanged. `sidebarMigration.test.js` and `registry.test.js` cover widget-enable behaviour and must still pass.

## Notes

- The bespoke toggle is `38px` wide with an `11px` radius and a `.9rem` knob; DaisyUI's `toggle` differs in size. Check the toggles still align in the right-hand column of the settings rows (`.widget-sidebar-col > div` uses `justify-content: space-between`).

## Comments

**Implemented.** The ~130-line `@supports (-webkit-appearance: none)` block is removed from
`_form.sass`, which now contains only `input[type="color"]` and `.group-radio` (ticket 06).

### The actual inventory was smaller than the ticket assumed

Auditing `settings.html` fully, as the ticket asked, turned up a much narrower surface:

- **Toggles (4):** `#auto-switch`, `#sidebar-enabled`, `#timeSeconds` in markup, plus the
  per-widget `.wdg-toggle` built in `widgetSettings.js`. All migrated to
  `toggle toggle-primary`.
- **Plain checkboxes: none.** Every `input[type=checkbox]` in the codebase is a toggle. The
  `input[type="checkbox"]:not(.toggle)` half of the bespoke block was styling nothing.
- **Radios (3):** only `#t-style1/2/3`, all inside `.group-radio` and all `display: none`.
  So no radio migration was needed here — ticket 06 owns them.

`#wt_status`, listed in the ticket as a toggle to verify, **does not exist in the markup**.
The only reference is a dangling `#wt_status:checked~.b2-grid` selector in
`_widget_config.sass` — dead CSS. Left in place for ticket 12's sweep rather than removed
here, but flagged.

The class-name collision the ticket warned about was already resolved in ticket 01: b2ntp's
`toggle` was renamed to `b2-toggle` there, so DaisyUI's `toggle` was free and there was never
a window where both systems styled the same element. This ticket simply renames back.

### `toggle-primary`, not bare `toggle`

Bare `toggle` renders its checked state in base-content (black in light mode). The bespoke
toggle used `--active: var(--primary)`. Pixel-sampling the checked track confirms the
regression and the fix: `before` `rgb(128,52,213)`, bare `toggle` black, with
`toggle-primary` back to `rgb(128,52,213)` — b2ntp's purple. Using the bare component here
would have quietly dropped the brand accent the theming bridge exists to preserve.

### Verification

- `#t-style1/2/3` still compute `display: none` — removing the `@supports` block did not
  disturb `.group-radio`'s deliberate hiding, so ticket 06 starts from a clean base.
- Toggles render at 40x24 (bespoke was 38px wide) and still align in the right-hand column of
  the settings rows — checked visually against `.widget-sidebar-col > div`'s
  `justify-content: space-between` layout.
- Persistence: clicked `#timeSeconds` (false → true), reloaded, still true.
- Widget enable toggles still drive the sidebar: clicking a `.wdg-toggle` moved
  `sidebar_config.left.order` from `["tabs"]` to `[]`.
- Keyboard: Tab focus lands on the control (`document.activeElement` confirmed) and Space
  toggles it (false → true).
  *Testing note:* Playwright's `keyboard.press('Space')` does **not** emit the character —
  use `press(' ')`. Also, after a reload the page resets to the Theme section, so a control
  in another section is inside a `display: none` panel and will not receive key events. Both
  produced false negatives before I isolated them.
- Disabled toggles render distinctly (opacity 0.3, `cursor: not-allowed`).
- `sidebarMigration.test.js` and `registry.test.js` still pass.

`npm run build-ext` succeeds; vitest unchanged at 87 passed / 6 pre-existing failures.
