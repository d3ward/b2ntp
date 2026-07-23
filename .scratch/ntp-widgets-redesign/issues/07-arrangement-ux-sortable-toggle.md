# 07 — Arrangement UX: SortableJS drag + enabled toggle

**What to build:** On the options page, the user arranges widgets across the three regions by
dragging, and turns individual widgets on/off with a toggle. Dragging reorders within a region and
moves widgets between regions (and in/out of `main.body`); the toggle hides a widget while keeping
its slot; CORE widgets (search, bookmarks) can't be toggled off or dragged out of `main`. A
per-widget gear opens the schema-rendered settings form. Full detail: spec.md §6 (prototype:
`prototype/08-arrangement.html` — note it still shows a since-removed add-tray).

**Blocked by:** 04 — Settings renderer (schemaForm); 05 — Search + bookmarks as `main` widgets +
query bus.

**Status:** ready-for-agent

- [ ] The options `#p-widgets` section shows three region columns plus the `main` header/body split
      (replacing today's two-column left/right editor).
- [ ] SortableJS (~15 KB) is loaded **on the options page only** (zero NTP bundle cost); the region
      columns are Sortable lists sharing a group so widgets reorder within and move between regions.
- [ ] Drag writes back to `widgets.layout` (region membership + order; `main` header vs body).
- [ ] A per-widget on/off toggle sets `settings[id].enabled`; off greys the row and keeps the slot,
      and the widget stops rendering on the NTP.
- [ ] CORE widgets have no toggle and cannot be dragged out of `main` (nor can others drop into the
      `main.header` slot occupied by search).
- [ ] The per-widget gear opens the `renderSettingsForm` UI inline.
- [ ] Today's hand-rolled HTML5 drag reorder is removed.
