# 02 — Three-region grid + whole-page scroll & pin

**What to build:** The New Tab Page lays out as three columns (left rail · main · right rail) in a
CSS Grid, and the **whole page** scrolls rather than an inner container. As you scroll down a long
bookmark list, the rails and the search bar stay pinned at the top of the viewport, and the rails
never scroll past their own content. This fixes today's bug where `sticky` is trapped inside
`.workspace`. Full detail: spec.md §1 (prototype: `prototype/03-layout-shell.html`).

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `.workspace` is a CSS Grid, `grid-template-columns: <rail> minmax(0,1fr) <rail>`,
      `align-items: start`, over the existing left aside / main / right aside structure.
- [ ] The document body scrolls (no fixed-height `overflow:hidden` app-shell); the tall bookmark
      content is what drives the scroll.
- [ ] Left/right rails are `position: sticky`, capped to the viewport
      (`top`, `max-height: calc(100dvh - …)`, `overflow-y:auto`, `min-height:0`) and stay pinned the
      whole scroll.
- [ ] The main search bar is `position: sticky` and stays pinned while bookmarks flow beneath it.
- [ ] No per-widget `pin` vocabulary and no fixed-height shell are introduced (both rejected in §1).
- [ ] Verified by scrolling a long bookmark list: rails + search stay pinned, page scrolls, no
      nested scrollbar on `.workspace`.
