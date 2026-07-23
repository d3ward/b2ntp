# 08 — Responsive / mobile reflow

**What to build:** On a narrow screen the three-column layout collapses to a single stacked column
with `main` (search + bookmarks) on top, then the left and right rail widgets. The rails stop being
sticky; the search bar stays pinned by default but can be made static via a setting; tall widgets
stop trapping scroll inside a little box. Full detail: spec.md §7 (prototype:
`prototype/09-responsive.html`).

**Blocked by:** 02 — Three-region grid + whole-page scroll & pin; 05 — Search + bookmarks as `main`
widgets + query bus.

**Status:** ready-for-agent

- [ ] One breakpoint at ~48rem: at wider widths the three-column grid stays; below it the layout is
      a single column (no intermediate 2-column layout, no container queries).
- [ ] Stacked order is `main → left → right` via CSS `order` (search + bookmarks lead).
- [ ] On mobile the rails are `static` (sticky + max-height cap removed) and flow in the column.
- [ ] The `main` search header stays `sticky` on mobile by default; a `settings.search.mobileSticky`
      bool (default `true`) makes it `static`. It is the only pinned element on mobile.
- [ ] `scrolls:true` widgets release their inner scroll cap and flow full-height on mobile; desktop
      keeps the inner scroll (bookmarks stays `scrolls:false` throughout).
- [ ] Regions concatenate in stack order, each region's widgets in their existing order (`main` =
      header then body); disabled widgets are omitted.
- [ ] Verified at narrow and wide widths; the `mobileSticky` setting flips the behaviour.
