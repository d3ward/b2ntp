# 05 — Search + bookmarks as `main` widgets + query bus

**What to build:** Search and bookmarks stop being hardcoded HTML and become two real widgets in
the `main` region, coupled only through a host-provided **query bus** — neither touches the other's
DOM. Typing in search filters the bookmark grid; arrow keys move the bookmark selection; Enter
follows it; search still submits a web query when nothing is selected. The search bar sits in a
pinned `main.header` slot above the flowing bookmarks. Full detail: spec.md §4 (pin behaviour:
`prototype/03-layout-shell.html`).

**Blocked by:** 01 — Config model + descriptor migration; 02 — Three-region grid + whole-page
scroll & pin; 03 — Headerless panel host + drop collapse.

**Status:** ready-for-agent

Reference — the bus contract (spec.md §4):

```text
search  → bus.emit('query', text)                     bookmarks re-renders
search  → bus.emit('nav', 'up'|'down'|'left'|'right')  bookmarks moves .selected
search  → bus.emit('activate')                         bookmarks navigates (location / tabs.update)
bookmarks → bus.emit('selection', { id, url } | null)  search sets aria-activedescendant + <form> fallback
```

- [ ] `panelHost` provides a per-page query bus, passed to every widget as `init({ container, bus })`.
- [ ] `bookmarks.js` splits along its existing fault line into a **search** widget (form + input +
      `sb_data`/bangs + query parsing + keynav, emitting bus intents) and a **bookmarks** widget
      (`BookmarkStore` + `BookmarkRenderer` + tab-click delegation + `.selected` + activation).
- [ ] `layout.main` is `{ header, body }`; search seeds `main.header`, bookmarks seeds `main.body`;
      `mountMain` pins the header widget `sticky`.
- [ ] The hardcoded search/bookmarks markup is removed from `blank.html` `main`; the clock/date +
      open-options toolbar remains as region chrome (part of neither widget).
- [ ] Search and bookmarks are **CORE**: a shared `CORE` id set marks them not-removable and not
      movable out of `main` (enforced later in arrangement; the host treats them uniformly).
- [ ] Each degrades alone: search with bookmarks disabled → plain web-search submit; bookmarks with
      search disabled → static grid. `aria-activedescendant` is set from the `selection` message.
- [ ] Search/keynav/activation behaviour verified end-to-end; relevant tests updated.
