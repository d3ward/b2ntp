Status: resolved
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

## Comments

**Implemented.** `.wdg-tab-bar` / `.wdg-tab` styling removed from `_widget_config.sass`;
`.wdg-tab-panel` and its `[hidden] { display: none !important }` contract kept intact.

### Class strategy: styling classes added, JS hook kept

Rather than repoint the JS at `.tab`, the markup now carries **both**:

```html
<nav class="wdg-tab-bar tabs tabs-border">
  <button class="wdg-tab tab tab-active" data-tab="wdg-panel-layout">Layout</button>
  <button class="wdg-tab tab" data-tab="wdg-panel-weather">Weather</button>
```

`.wdg-tab` stays purely as the query hook (`document.querySelectorAll('.wdg-tab')` in
`initWidgetTabs()` is unchanged), while `tab`/`tabs` carry all the visual styling. This keeps
the JS↔markup contract stable and makes it obvious which class is structural and which is
cosmetic.

`tabs-border` was chosen over `tabs-lift` — it reproduces the existing bottom-border bar with
an active underline; `tabs-lift` is a folder-tab look the page never had.

The one JS change the ticket called for **was** made: `initWidgetTabs()` now toggles
`tab-active` instead of `active`, because `active` no longer has any styling attached. Panel
switching still works via the `hidden` attribute; DaisyUI's radio/`tab-content` pattern was not
adopted, per the ticket's preference.

### Verification

- Layout is the initially-active tab on first load of the Widgets section.
- Clicking Weather switches both the active tab and the panels; **exactly one** panel is
  visible at any time (asserted on computed `display`, not just the `hidden` property).
- Active tab visually distinct in both themes — active resolves to full-opacity base-content
  (`rgb(16,16,16)` light / `rgb(250,250,250)` dark) against inactive at 50% opacity.
- Navigating to another settings section and back leaves exactly one active tab and one visible
  panel.
- Keyboard: `Tab` reaches the buttons and the focus ring is visible (2px solid, `:focus-visible`
  confirmed true).

*Testing note:* programmatic `element.focus()` does not reliably set `:focus-visible` in
Chromium, so the focus assertion initially read as a failure. Real key navigation
(`Shift+Tab`) is required to test focus rings.

Not touched: the NTP tabs sidebar widget (`#tabs`, `components/_tabs.sass`), which is out of
scope and was recently restyled.

`npm run build-ext` succeeds; vitest unchanged at 87 passed / 6 pre-existing failures.
