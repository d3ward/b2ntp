# NTP Widgets Redesign

`wayfinder:map`

## Destination

A locked set of design **decisions + a spec** for a redesigned NTP "widgets" concept: a
unified model where every NTP surface (bookmarks, search, tabs, weather, clock, qnote) is a
**widget** placed in an **open slot/grid layout** with declared position, size, and pin state —
content scrolls while pinned widgets stay visible. The spec covers the widget contract, the
placement/layout engine, scroll/pin mechanics, config/persistence, mounting/lifecycle, and
responsive behavior, ready to hand to a separate build effort.

**Plan, don't do** — this map produces decisions and a spec, not the implementation.

> ✅ **Map complete — all 10 tickets resolved.** The consolidated deliverable is **[spec.md](spec.md)**
> (build-ready). The individual ticket files were removed after consolidation; their decisions live
> in the correspondingly-numbered `spec.md` sections, and this map keeps the one-line audit summary
> below. Prototypes (`prototype/`) and the two research findings (`research/`) survive as assets.

## Notes

- **Domain**: browser-extension New Tab Page (`src-ext/`). Current layout: `src-ext/blank.html`
  + `src-ext/sass/base/_ntp.sass` (`.workspace` flex row, two `aside` rails, `main` center).
  Widget system: `src-ext/js/widgets/{registry,panelHost}.js` + `src-ext/js/settings/state.js`
  (config today is per-side `{ order, panels: { collapsed } }`).
- **Constraints (enforce on every ticket)**: vanilla JS, no framework; preserve the independent
  `--c0..--c26` widget color layer (outside DaisyUI); responsive/mobile must work (rails are a
  fixed 20% width today).
- **Skills**: `/prototype` for layout/behavior tickets; `/grilling` + `/domain-modeling` for
  contract/model tickets; `/research` (subagent) for reading tickets. `daisyui:daisyui` is
  available, but widget chrome colors stay on `--c*`.
- Deliverable is a spec doc; **implementation is a follow-on effort**.

## Decisions so far

<!-- Ticket files were removed after consolidation into spec.md (this is their audit summary).
     Full detail lives in the correspondingly-numbered section of spec.md; prototypes and the
     two research findings survive as linked assets. -->

- **01 · Dashboard / widget-grid placement patterns** — v1 foundation = **CSS Grid named slots**
  + a keyboard-native config UX (~0 KB); no drag lib gives accessible arranging, so drag
  (SortableJS ~15 KB reorder, or Gridstack ~24 KB for resize) is **lazy / options-page only**.
  [research](research/01-dashboard-grid-patterns.md)
- **02 · CSS pinned-region + independent-scroll techniques** — surveyed a fixed-height app-shell
  with pinned shell cells + one scrolling content region; superseded by 03's whole-page-scroll
  choice. [research](research/02-css-pin-scroll-techniques.md)
- **03 · Core layout, scroll & pin model** — **Rails on whole-page scroll**: the *body* scrolls;
  rails + search are `sticky` (viewport-capped); bookmarks are the flowing content; a widget that
  overflows scrolls **internally**; CSS-Grid columns underneath. Strict app-shell + per-widget pin
  vocabulary **rejected**. [prototype](prototype/03-layout-shell.html)
- **04 · Unified widget contract / descriptor** — lean descriptor:
  `placement:{region:left|main|right, order}`, `scrolls` (the only self-behavior), and a
  **declarative `settings` schema** rendered generically. `collapsible`/`sticky`/`removable`
  left off → region/mounting/config concerns; `defaultSide` → `placement.region`.
- **05 · Config / persistence model** — one `widgets` object:
  `{ layout:{left, main:{header,body}, right}, settings:{id:overrides} }`. **`layout` owns
  region+order**; **settings sparse-merge** over descriptor defaults; seeded from descriptor
  `placement` on first run; stored in `settingsState`. *(Amended by 06: `main` is a `{header,
  body}` slot object, no `collapsed` key. **Reversed by 08:** every widget always lives in
  `layout` — no add-tray/removal; visibility is a reserved `enabled` key in `settings`, default
  true.)*
- **06 · Mounting & panel lifecycle** — **no host chrome at all**: panelHost renders card + body
  only, no header/icon/label/badge and no `chrome` field (label+icon become chooser metadata;
  widgets draw their own identity); **collapse dropped** (remove the widget instead); the schema→UI
  renderer is a **shared `widgets/schemaForm.js`** (options page in v1; NTP popover deferred; types
  bool/select/text/number/range, sparse writes); `main` pins an explicit **`layout.main.header`
  slot** — not index 0, not a hardcoded `search`. [prototype](prototype/06-panel-chrome.html)
- **07 · Bookmarks + search as main-region widgets** — split into **two widgets coupled only by a
  host `bus`** (`init({container, bus})`): search emits `query`/`nav`/`activate`, bookmarks owns
  `.selected` + navigation and publishes one `selection` back (for `aria-activedescendant` + form
  fallback). Bookmarks `scrolls:false` — **rides the page** (its height pins the rails). Both are
  **CORE** (search seeds `main.header`, bookmarks `main.body`): not removable/reorderable — a
  config/edit-mode constraint, not a host branch.
- **08 · Widget arrangement / editing UX** — **options page only** for v1 (NTP is a viewer; on-NTP
  edit mode + settings popover deferred). Arrange with **SortableJS (~15 KB, options-page bundle
  only)** drag across three region columns + `main` header/body, plus a **per-widget on/off toggle**
  (stored as reserved `settings[id].enabled`, slot preserved). Keyboard-native was **overruled** —
  a conscious a11y trade-off. CORE widgets have no toggle and can't leave `main`.
  [prototype](prototype/08-arrangement.html)
- **09 · Responsive / mobile reflow** — **one breakpoint (~48rem), 3-col → 1-col** (no mid layout).
  Stack order **main → left → right** (search/bookmarks lead, via CSS `order`). Mobile: **rails go
  static**; **search stays sticky by default** with a new `settings.search.mobileSticky` bool
  (default true) to make it static; **`scrolls:true` widgets release their cap and flow**. Regions
  concatenate, per-region order preserved. [prototype](prototype/09-responsive.html)
- **10 · `--c*` colour layer on the new widget chrome** — the independent `--c*` layer **drives the
  card chrome** (not DaisyUI): region bg `--c25`/**`--cMain`(new)**/`--c26`, card
  **`--cCard`+`--cBorder`(new, global)**, text `--c21`(repurposed), body accents `--c0..c20`.
  **Global cards + per-region background tints** (no per-widget chrome override). Sticky main header
  takes opaque `--cCard`. Chrome CSS moves to **native `css/widgets.css`** (Sass retiring); DaisyUI
  inside bodies/settings-form stays on **base tokens**, `--c*` out of the bridge.
  [prototype](prototype/10-c-chrome.html)

## Not yet specified

<!-- in-scope fog; graduates as the frontier advances -->

- *(empty — the way to the destination is clear; every decision is closed)*

<!-- Graduated out of the fog once the widget contract landed: config/persistence (05),
     mounting & lifecycle (06), bookmarks+search as widgets (07), arrangement/editing UX (08),
     responsive reflow (09). The bookmarks-overflow detail folded into ticket 07.
     Graduated once mounting landed: `--c*` chrome integration (10). -->

## Out of scope

- **Migrating existing users' saved config forward** — user confirmed not required; the new
  config model may reset. (If backward-compat becomes required, that's a fresh effort.)
- **The `src-web` marketing/demo site** — different codebase, separate layout.
- **Implementation / shipping the redesign** — this map's deliverable is the decision + spec;
  building it is a follow-on effort.
