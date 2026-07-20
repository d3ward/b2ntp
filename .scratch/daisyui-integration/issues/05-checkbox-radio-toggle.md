Status: ready-for-agent
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
