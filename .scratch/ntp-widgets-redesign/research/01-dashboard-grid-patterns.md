# Research: Dashboard / widget-grid placement patterns & libraries

Decision consolidated into [`../spec.md`](../spec.md) §1/§6 (ticket 01; ticket file removed).
Date: 2026-07-23

## Question

For an open-placement NTP where "everything is a widget in a grid/slots," survey proven patterns
and small **vanilla-JS** libraries for a user-arrangeable widget grid. Weigh against hard
constraints: vanilla JS only (no React/Vue/Svelte), must run in a Chrome + Firefox extension NTP,
tight CSS/JS budget (loads on every new tab).

## TL;DR recommendation

**Build the layout on CSS Grid named slots (`grid-template-areas` presets) as the foundation — it
is zero-JS, responsive-by-media-query, and the most accessible option — and treat *arrangement* as
a separate, optional layer.**

- For the **v1 editing UX**, prefer a **slot-picker / config-panel** model over free drag: it is
  keyboard-native for free, costs ~0 KB, and maps cleanly onto declared `{position, size, pin}`
  from the map's widget contract.
- If free **drag-to-reorder** is required, add **SortableJS** (~15 KB gzip, zero-dep, actively
  maintained) — the smallest turnkey option, but reorder-only (no resize) and you must add keyboard
  support yourself.
- If true **free-form drag + resize dashboard** is a hard product requirement, **Gridstack.js**
  (~24 KB gzip, zero-dep, actively maintained, MIT) is the strongest turnkey engine — but it owns
  the DOM/CSS and ships no keyboard a11y.
- **Avoid Muuri** (effectively unmaintained since 2020) and **avoid the raw native HTML Drag-and-Drop
  API as the primary mechanism** (keyboard/a11y dead-end; the ARIA drag attributes are deprecated).

None of the drag libraries give keyboard-accessible arranging for free — a11y is on us regardless,
which is the single strongest argument for the CSS-Grid + slot-picker foundation.

## Shortlist comparison

| Option | Placement / resize / DnD model | Framework dep | Bundle (gzip) | Keyboard / a11y arrange | Maintenance | Fit for budget-tight vanilla extension NTP |
|---|---|---|---|---|---|---|
| **CSS Grid + `grid-template-areas` presets** | Named slots; layout declared in CSS, swap presets per breakpoint. No drag/resize on its own — needs a JS layer to *change* placement. | None (native CSS) | **0 KB** | Best: DOM order = reading order; arranging via a form/picker is fully keyboard-native | N/A (web platform) | **Best fit.** Zero cost, responsive reflow for free, aligns with declared position/size/pin contract |
| **SortableJS** | Drag-to-reorder within lists/grids. Reorder only — **no resize, no free x/y placement** | None; vanilla, zero-dep | **~15 KB** (min+gzip); ~45 KB min | None built in; must add ARIA + keyboard yourself | Active (v1.15.7, Feb 2026; MIT) | Good if you only need drag-reorder of slots; smallest turnkey DnD |
| **Gridstack.js** | Full free-form grid engine: drag, resize, collision/packing, multi-column responsive, serialize/restore layout | None; TS core, vanilla usable, zero-dep (jQuery/lodash removed long ago) | **~24 KB** (min+gzip); ~87 KB min | No keyboard/ARIA support in docs | Active (v13.1.0, Jul 2026; MIT) | Viable if free drag+resize is a must; heaviest, owns DOM/CSS, a11y is on you |
| **Muuri** | Drag-drop + sort + filter + physics-based animated layout. **No built-in resize** | None; vanilla, zero-dep | **~23 KB** (min+gzip); ~84 KB min | None; drag-handle model has known a11y gaps (issue #323) | **Effectively unmaintained** (v0.9.5, last publish ~2020) | **Avoid.** Similar cost to Gridstack but stale and no resize |
| **Native HTML Drag-and-Drop API** | Browser `draggable` + drag events. You hand-build placement/resize logic on top | None (web platform) | **0 KB** | Poor: `dataTransfer` can't be reproduced from keyboard; ARIA `aria-grabbed`/`aria-dropeffect` are **deprecated** | N/A | Only as a low-level primitive; not a primary arrange mechanism |

## Detail & source notes

### CSS Grid + `grid-template-areas`
- Pure CSS placement primitive: name grid regions and assign each widget to a slot; provide a
  different `grid-template-areas` string per media query to reflow on narrow screens. This is the
  natural home for the map's "open slot/grid layout with declared position, size, pin."
- It only *describes* a layout; changing placement at runtime still needs a small JS layer (write
  the widget's slot/size into config, re-render the grid). That layer can be a config panel or a
  drag library — the point is the layout engine itself is free and accessible.
- MDN: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_template_areas>

### SortableJS
- Zero-dependency, vanilla, no framework required; MIT. Latest v1.15.7 (Feb 2026) — actively
  maintained (31k+ stars, regular releases).
- Scope is **reorder only** — no resize and no free 2D placement; it moves elements between/within
  lists. Good match for "rearrange widgets between fixed slots," not for free-canvas dashboards.
- No built-in keyboard a11y; you'd add ARIA + key handlers.
- Size: gzip 15,115 B / min 45,421 B / 0 deps (Bundlephobia API).
- Repo: <https://github.com/SortableJS/Sortable> · npm: <https://www.npmjs.com/package/sortablejs>

### Gridstack.js
- Zero-dependency TypeScript core, usable as plain vanilla JS; ships optional React/Angular/Vue
  wrappers you don't need. MIT. Latest v13.1.0 (Jul 2026) — actively maintained.
- Full dashboard engine: drag, resize handles, collision/float packing, responsive column counts,
  and `save()`/`load()` layout serialization — the most feature-complete "arrange + resize" option.
  Uses native mouse/touch events (moved off the HTML5 DnD API in v3+).
- No keyboard accessibility or ARIA mentioned in docs — arranging is pointer/touch only.
- It takes ownership of grid DOM structure and injects its own CSS, which competes with a bespoke
  `grid-template-areas` layout and the `--c*` chrome layer; integration cost is real.
- Size: gzip 23,735 B / min 87,068 B / 0 deps (Bundlephobia API). A display-only `gridstack-static`
  build exists if editing is gated.
- Repo: <https://github.com/gridstack/gridstack.js/> · site: <https://gridstackjs.com/>

### Muuri
- Zero-dependency vanilla, MIT, drag/sort/filter with animated physics-y layout. **No built-in
  resize.** Latest v0.9.5, last published ~5 years ago; Snyk flags it as low-attention / possibly
  discontinued despite ~43k weekly downloads. Known drag-handle a11y limitation (issue #323).
- Size: gzip 23,075 B / min 83,530 B / 0 deps (Bundlephobia API).
- Not recommended: same weight class as Gridstack but stale and missing resize.
- Repo: <https://github.com/haltu/muuri> · issue: <https://github.com/haltu/muuri/issues/323>

### Native HTML Drag-and-Drop API
- Zero bytes, works in Chrome/Firefox extension NTPs. But it is a low-level primitive: you build
  placement/resize/persistence yourself, and it is a genuine accessibility problem — the drag event
  can fire from the keyboard but the `dataTransfer` object cannot be reproduced, so keyboard-only
  users can't complete a drag. The ARIA attributes meant to patch this (`aria-grabbed`,
  `aria-dropeffect`) are **deprecated** per MDN, which explicitly notes "ARIA does not enable
  accessible functionality." Any accessible arrange flow must be built as an alternative (keyboard
  commands / picker), not layered onto native DnD.
- MDN: <https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API>
- MDN (deprecation): <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-grabbed>

## Implications for tickets 03 (layout/placement prototype) & editing UX

1. **Layout engine = CSS Grid named slots + per-breakpoint `grid-template-areas` presets.** Free,
   responsive, keyboard-friendly, and it directly expresses the declared `{position, size, pin}`
   contract from the map. Pin = keep the slot in a fixed (e.g. sticky) region while content scrolls.
2. **Editing UX v1 = slot-picker / config-panel**, not free drag. Keyboard a11y for free, ~0 KB,
   and it sidesteps every drag library's accessibility gap. Prototype this first.
3. **If drag is wanted later:** add SortableJS (~15 KB) for slot-to-slot reorder, or Gridstack
   (~24 KB) only if free-form resize on a canvas becomes a hard requirement — and budget separately
   for the keyboard-accessible alternative path either way.
4. Keep any drag layer **lazy/behind an "edit mode"** so the common new-tab render pays 0 KB for it.
