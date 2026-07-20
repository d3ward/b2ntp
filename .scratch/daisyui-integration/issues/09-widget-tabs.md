Status: ready-for-agent
Blocked by: 02

# Migrate the widget settings sub-tabs to DaisyUI `tabs`

## Goal

Replace the hand-rolled `.wdg-tab-bar` / `.wdg-tab` styling in `src-ext/sass/components/_widget_config.sass` with DaisyUI's `tabs` component.

## Scope

- The Widgets settings section (`#p-widgets` in `src-ext/partials/settings.html`) has a sub-tab bar with two tabs: **Layout** (`data-tab="wdg-panel-layout"`) and **Weather** (`data-tab="wdg-panel-weather"`).
- Migrate `.wdg-tab-bar` → `tabs` (with `tabs-lift` or `tabs-bordered`, matching the current bottom-border-with-active-underline look), and `.wdg-tab` → `tab` with `tab-active` for the selected state.
- **Preserve the existing panel-switching JS contract** in `src-ext/js/options.js` (`initWidgetTabs()`): it reads `tab.dataset.tab`, toggles the `active` class on tab buttons, and shows/hides panels via the `hidden` attribute on `.wdg-tab-panel` elements. If DaisyUI's active class name (`tab-active`) differs from the current `active`, update the JS to match — do not leave the JS toggling a class that no longer has styling attached.
- Keep `.wdg-tab-panel[hidden] { display: none !important }` behaviour working; DaisyUI's radio/`tab-content` pattern is an alternative but would require rewriting the JS — prefer keeping the current `hidden`-attribute approach and using `tabs` purely for styling.

## Acceptance criteria

- Clicking **Layout** and **Weather** switches panels correctly; exactly one panel is visible at a time.
- The active tab is visually distinct in both light and dark themes.
- The initially-active tab (Layout) is correct on first load of the Widgets section.
- Tabs are keyboard-navigable and focus is visible.
- Deep-linking/navigating away to another settings section and back leaves the tabs in a sane state.
- `npm run build-ext` succeeds; vitest failures unchanged.

## Notes

- Do not confuse this control with the **tabs sidebar widget** on the New Tab Page (`#tabs`, styled in `src-ext/sass/components/_tabs.sass`). That is NTP widget chrome, is explicitly out of scope for the DaisyUI migration, and was recently restyled — leave it alone.
