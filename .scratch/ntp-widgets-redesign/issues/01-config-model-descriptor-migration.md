# 01 — Config model + descriptor migration

**What to build:** The NTP's widget configuration moves to a single `widgets` object and every
widget descriptor declares its own placement — with the left/right rails rendering from that new
model exactly as they do today. Nothing visibly changes; the data spine underneath does. This is
the foundation every other ticket sits on. Full detail: spec.md §2 and §6.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

Reference — stored shape (spec.md §6, greenfield; no migration from old config required):

```js
widgets = {
  layout:   { left: ['tabs','clock'], right: ['weather','qnote'] },   // main added in ticket 05
  settings: { clock: { showSeconds:false } },                          // sparse OVERRIDES only
}
```

Descriptor gains `placement` + `settings`, loses `defaultSide` (spec.md §2):
`placement: { region:'left'|'main'|'right', order:<n> }`.

- [ ] `settingsState` stores a `widgets` object (new storage key) replacing the per-side
      `sidebarConfig` `{ order, panels:{ collapsed } }` shape; old key no longer read.
- [ ] Descriptors in `registry.js` drop `defaultSide` and declare `placement.{region,order}`;
      `defaultSide:null` widgets (clock, qnote) get an assigned region in the seed.
- [ ] First-run seed builds `layout` from each descriptor's `placement`; a registry widget not yet
      in stored `layout` is merged into its `placement.region` on load.
- [ ] A resolver returns per-widget resolved settings via sparse merge
      (`{ ...descriptorDefaults, ...widgets.settings[id] }`); a widget renders iff it is in `layout`
      **and** `resolved[id].enabled !== false` (`enabled` is a reserved key, default `true`).
- [ ] Left and right rails mount from `widgets.layout` (order = array position); the NTP renders
      the same widgets in the same order as before this change.
- [ ] The `main` region (search + bookmarks) is untouched — still the existing hardcoded HTML.
- [ ] Unit tests for state/resolver/registry updated and green; the existing app runs unchanged.
