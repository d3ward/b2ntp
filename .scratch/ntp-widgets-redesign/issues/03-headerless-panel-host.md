# 03 — Headerless panel host + drop collapse

**What to build:** Widgets render as bare cards — surface + body, no host-drawn header, icon,
title, or collapse chevron. The panel host stops owning chrome; a widget that wants a title or a
count (like tabs) draws it inside its own body. Collapsing a panel is gone entirely. Full detail:
spec.md §3 (prototype: `prototype/06-panel-chrome.html`).

**Blocked by:** 01 — Config model + descriptor migration.

**Status:** ready-for-agent

Reference — mount shape (spec.md §3; config resolved once at mount, no per-panel state reads):

```js
createWidgetPanel(descriptor, resolvedSettings, deps)   // card + body only
mountRegion(regionEl, ids, widgetMap, deps)             // 'left' | 'right': flat ordered list
mountMain(mainEl, { header, body }, widgetMap, deps)    // header widget pinned sticky (ticket 05)
```

- [ ] `panelHost` renders each widget as card + body only — no header row, icon, label, badge, or
      chevron.
- [ ] Collapse is removed: no chevron, no `panel-collapsed` class, no persisted collapsed state.
- [ ] `init` receives `{ container, ...deps }` (the `bus` dep arrives in ticket 05); the `badge`
      dep is gone — tabs renders its own count inside `container`.
- [ ] `mountRegion` mounts a flat ordered id-list into a rail; `mountMain` accepts the `{header,
      body}` shape (may be a stub until ticket 05 supplies real main widgets).
- [ ] Old chrome CSS is deleted: `.widget-panel-header` / `-icon` / `-label` / `-chevron` and the
      tabs-only header rules.
- [ ] `panelHost` tests updated; rails render as headerless cards, tabs still shows its count.
