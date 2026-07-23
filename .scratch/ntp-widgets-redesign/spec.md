# NTP Widgets Redesign — Specification

> **Status:** decisions locked; ready to hand to a build effort.
> **Source:** consolidated from the [wayfinder map](map.md) and its ten resolved decision tickets
> (01–10; the ticket files were removed after consolidation — this spec is their replacement).
> This spec folds every amendment and reversal into final state. Each section cites the ticket
> number that decided it, with the throwaway prototype linked for fidelity.
>
> **Scope:** this is a design spec, **not** an implementation. Building it is a separate effort.

## Goal

Every NTP surface (bookmarks, search, tabs, weather, clock, quick-note) is a **widget** placed in
one of three **regions** — `left`, `main`, `right`. The page scrolls as a whole; the rails and the
`main` search header stay pinned. A widget declares a lean descriptor; layout and per-widget
settings are user-editable and persisted. Vanilla JS, no framework. The independent user colour
layer (`--c0..--c26`) is preserved and drives widget chrome; DaisyUI stays for in-body content.

### Out of scope

- Migrating existing users' saved config forward (greenfield reset is acceptable).
- The `src-web` marketing/demo site (separate codebase).
- **Implementation** — this document is the deliverable.
- Deferred to a *later* effort (designed-around, not designed): an **on-NTP edit mode**, its
  toolbar entry button, and the NTP-side settings popover. v1 arranges widgets on the options page
  only.

---

## 1. Layout, scroll & pin model  · *tickets 01–03*

The **whole page scrolls** (the `<body>`), not an inner shell. Prototype:
[03-layout-shell.html](prototype/03-layout-shell.html).

- **Grid.** `.workspace` is a CSS Grid, three columns `left | main | right`
  (`grid-template-columns: <rail> minmax(0,1fr) <rail>`), `align-items: start`.
- **Rails (`left`/`right`) are `position: sticky`**, capped to the viewport
  (`top: <gap>; max-height: calc(100dvh - <gap>*2); overflow-y:auto; min-height:0`). Because the
  `main` content (bookmarks) makes the grid row tall, the sticky rails stay pinned the whole scroll.
- **`main` search header is `position: sticky`** (see §4); bookmarks are the flowing content.
- **A widget that overflows scrolls internally** only if it declares `scrolls: true` (§3).
- **Rejected:** the strict fixed-height app-shell (`height:100dvh; overflow:hidden`) and a
  per-widget `pin: fixed|sticky|scroll` vocabulary. Today's bug (sticky confined to `.workspace`)
  is fixed by moving the scroll to the body.

Foundations chosen in 01/02: **CSS Grid named columns** (~0 KB) for placement; a fixed-height
scrolling content region with sticky shell cells for pinning. Drag arranging is a library, loaded
lazily and options-page-only (§6).

---

## 2. Widget descriptor (the contract)  · *ticket 04*

Every widget is a plain vanilla-JS object in `src-ext/js/widgets/registry.js`:

```js
{
  id, label, icon,                         // label + icon are CHOOSER METADATA only (see §5)
  init({ container, bus, ...deps }),        // mount into container; `bus` per §4
  placement: { region: 'left'|'main'|'right', order: <n> },   // first-run seed only (§6)
  scrolls: <bool>,                          // content scrolls INSIDE the widget when tall
  settings: {                               // declarative schema; rendered generically (§5)
    <key>: { type, default, label, hint?, ...typeExtras },
  },
}
```

- **Placement = `region` + `order`.** Three regions; `main` is first-class (hosts search +
  bookmarks). **No** free x/y, **no** resize engine — the "open grid" ambition was dropped for the
  Rails model.
- **`scrolls` is the only self-behaviour field.**
- **`settings` is a declarative schema**, rendered to UI generically (§5).
- **Deliberately not contract fields:** `chrome` (host renders no header — §5), `collapsible`
  (collapse dropped — §5), `sticky` (a `main` region rule — §4), `removable`/`enabled` (config —
  §6).
- **Migration:** today's `{ id, label, icon, init, defaultSide }` → `defaultSide` becomes
  `placement.region` (+ `order`); `defaultSide:null` (clock, qnote) gets an assigned region in the
  seed.

---

## 3. Mounting & panel host  · *ticket 06*

`src-ext/js/widgets/panelHost.js` renders **card + body only — no chrome**. Prototype:
[06-panel-chrome.html](prototype/06-panel-chrome.html).

- **No host-rendered header.** No icon, title, badge, or affordance row on any card. `descriptor.label`
  / `icon` are used by the options page and add flows (§5/§6), never painted on the NTP by the host.
  A widget that wants its own title draws it inside its `container`.
- **Collapse dropped.** No chevron, no `panel-collapsed`, no persisted collapsed state. "I don't
  want this now" = toggle the widget off (§6).
- **`init` signature:** `init({ container, bus, ...deps })`. `container` is the card body; `bus` is
  the per-page query bus (§4). (No `badge` dep — a widget renders its own count inside `container`.)
- **Mount shape** (config resolved once at mount, no per-panel `settingsState` reads):

  ```js
  createWidgetPanel(descriptor, resolvedSettings, deps)   // card + body
  mountRegion(regionEl, ids, widgetMap, deps)             // 'left' | 'right': flat ordered list
  mountMain(mainEl, { header, body }, widgetMap, deps)    // pins the header widget sticky
  ```
- Old chrome CSS (`.widget-panel-header`/`-icon`/`-label`/`-chevron`, the tabs-only rules in
  `_tabs.sass`) is deleted.

---

## 4. `main` region, search ↔ bookmarks, and the query bus  · *tickets 04, 06, 07*

`layout.main` is **`{ header: <id|null>, body: [<id>, …] }`** — not a flat array. The **header
widget** is mounted `position: sticky` (the punted-from-contract "sticky" behaviour, now an explicit
slot, not a per-widget flag and not a hardcoded id). Prototype pin behaviour:
[03-layout-shell.html](prototype/03-layout-shell.html).

**Search and bookmarks are two separate widgets** coupled *only* through a host-provided **query
bus** — neither reads the other's DOM. `panelHost` hands every widget the bus via `init`.

- Search occupies `main.header` by default (sticky); bookmarks lives in `main.body`
  (`scrolls:false`, rides the page — its height is what pins the rails, §1).
- **Bus messages:**
  - `bus.emit('query', text)` — search on every input; bookmarks re-renders.
  - `bus.emit('nav', 'up'|'down'|'left'|'right')` / `bus.emit('activate')` — search forwards arrow
    keys + Enter as **intent**; bookmarks owns `.selected` and navigates itself on `activate`
    (`window.location` / `chrome.tabs.update`).
  - `bus.emit('selection', { id, url } | null)` — the **only** reverse traffic: bookmarks publishes
    its active item so search can set `aria-activedescendant` and a `<form>` action/name fallback
    for a mid-type Enter.
- Each widget degrades alone: search-only → plain web-search submit; bookmarks-only → static grid.
- **No general "results protocol"** — revisit only if a second consumer appears.
- **Search + bookmarks are CORE** — not removable, not reorderable out of `main` (a config/edit-mode
  constraint; the host still treats them uniformly). §6 enforces it.

**Code mapping** — split today's `src-ext/js/blank/bookmarks.js` along its existing fault line:
`<form id="action">` + `#sb_input` + `sb_data`/bangs + query parsing + keynav → **search widget**
(emitting bus intents instead of mutating `#bookmarks`); `BookmarkStore` + `BookmarkRenderer` +
tab-click delegation + `.selected` + activation → **bookmarks widget**. The `main` toolbar
(clock/date span + `#open-options`) is region chrome, part of neither widget.

---

## 5. Settings renderer  · *ticket 06*

A generic **schema → UI** renderer, `src-ext/js/widgets/schemaForm.js`, shared. In v1 it is called
from the options page only (`settings/widgetSettings.js` expands each widget row); the NTP edit-mode
popover that would also use it is deferred (out of scope). Prototype §C:
[06-panel-chrome.html](prototype/06-panel-chrome.html).

`renderSettingsForm(schema, values, onChange)` walks `descriptor.settings`:

| `type`   | control                   | extra schema keys            |
|----------|---------------------------|------------------------------|
| `bool`   | checkbox / DaisyUI toggle | —                            |
| `select` | `<select>`                | `options: [[value, label]]`  |
| `text`   | text input                | `placeholder`                |
| `number` | number input              | `min`, `max`, `step`         |
| `range`  | slider                    | `min`, `max`, `step`         |

Every field also takes `label`, `default`, optional `hint`. Unknown `type` → `text`. The renderer
writes **sparse overrides**: setting a value back to its descriptor default **deletes** the key (§6).

---

## 6. Config, persistence & arrangement  · *tickets 05, 08*

### Stored shape

One `widgets` object in `settingsState` / localStorage (`src-ext/js/settings/state.js`), replacing
the old per-side `{ order, panels:{ collapsed } }`:

```js
widgets = {
  layout: {
    left:  ['tabs','clock'],
    main:  { header: 'search', body: ['bookmarks', …] },
    right: ['weather','qnote'],
  },
  settings: {                       // sparse OVERRIDES only
    clock:   { showSeconds: false },
    weather: { units: 'F' },
    search:  { mobileSticky: false },   // §7
    qnote:   { enabled: false },        // visibility, see below
  },
}
```

### Resolution rules

- **Every registry widget always lives in `layout`.** Seeded from each descriptor's
  `placement.{region,order}` on first run (greenfield); any *new* registry widget is merged into its
  `placement.region` (enabled) on load. **There is no add-tray and no removal.**
- **Visibility is a reserved `enabled` key** in the sparse settings (default `true`). A widget
  renders iff `id ∈ layout` **and** `resolved[id].enabled !== false`. `enabled` is reserved — a
  widget's own `settings` schema must not use that key.
- **Placement** = a widget's position in its region array; `main` = header then body. Per-widget
  `order` is region-local (never a global index).
- **Settings sparse-merge:** `resolved[id] = { ...descriptorDefaults, ...widgets.settings[id] }`;
  unset keys fall through to descriptor defaults; a widget with no overrides omits its key.
- **Storage:** extend `settingsState`; migration from old config not required.

> This is the final rule. It **reverses** ticket 05's original "membership = list presence /
> add-tray / no enabled flag" — superseded by ticket 08.

### Arrangement UX (options page only)  · *ticket 08*

Prototype: [08-arrangement.html](prototype/08-arrangement.html) (note: it still shows a now-removed
add-tray — the rules above supersede it).

- **Home:** the options page `#p-widgets` section, extended from two columns to the three regions.
  The NTP is a pure viewer.
- **Drag = placement.** **SortableJS (~15 KB)**, loaded on the **options page only (zero NTP bundle
  cost)**. The three region columns are Sortable lists sharing a group; widgets drag within a region
  (reorder) and between regions. `main` shows its header slot (holds CORE search; not a drop target
  for others) above its body list. Replaces today's hand-rolled HTML5 drag.
- **Toggle = visibility.** A per-widget on/off toggle sets `settings[id].enabled`; **off keeps the
  widget's slot** (greyed in editor, not rendered on NTP). **CORE widgets (search, bookmarks) have
  no toggle** and cannot be dragged out of `main`.
- **Per-widget gear** opens the `schemaForm.js` form (§5) inline.
- **Not keyboard-native** — drag was chosen over an accessible picker as a deliberate a11y
  trade-off (research 01's finding stands, and was overruled).

---

## 7. Responsive / mobile reflow  · *ticket 09*

Prototype: [09-responsive.html](prototype/09-responsive.html).

- **One breakpoint at ~48rem, `3-col → 1-col`.** No intermediate 2-column layout, no container
  queries. Tablets ≥48rem keep the three-column grid.
- **Stack order: `main → left → right`** (search + bookmarks lead). `main` is the middle DOM child,
  so this uses CSS `order` (main 1, left 2, right 3). *a11y note: visual order diverges from DOM/tab
  order on mobile — accepted given the drag-not-keyboard stance (§6).*
- **Mobile sticky:**
  - **Rails go `static`** (sticky + `max-height` cap removed); rail widgets flow.
  - **`main` search header stays sticky by default**, with a per-widget setting
    `settings.search.mobileSticky` (`bool`, default `true`) to make it `static` and reclaim the
    space. This is the only pinned element left on mobile.
- **`scrolls:true` widgets release their inner cap and flow full-height on mobile** (a capped scroll
  box in a narrow column is a trap). Desktop keeps the inner scroll. Bookmarks is `scrolls:false`
  regardless.
- **Region degradation:** regions concatenate in stack order, each region's widgets in their
  existing order (`main` = header then body); disabled widgets omitted on every layout.

---

## 8. Colour: the `--c*` layer on widget chrome  · *ticket 10*

The user-editable `--c0..--c26` slots (light/dark pairs, switched by `[data-theme]`) stay
**independent of DaisyUI** and **drive the widget card chrome directly**. Prototype:
[10-c-chrome.html](prototype/10-c-chrome.html) (column A is the chosen mapping).

**Slot mapping:**

| chrome part                | slot                                         |
|----------------------------|----------------------------------------------|
| left region background     | `--c25` *(exists)*                           |
| main region background     | `--cMain` *(new)*                            |
| right region background    | `--c26` *(exists; now "right region", not "right rail")* |
| card surface (global)      | `--cCard` *(new)*                            |
| card border (global)       | `--cBorder` *(new)*                          |
| card body text / icon      | `--c21` *(repurposed from the removed header colour)* |
| in-body content accents    | `--c0..--c20` *(unchanged — bookmarks palette, etc.)* |

- **Granularity: global cards + per-region background tints.** Card surface/border/text are one
  global set (one options section, coherent look); region backgrounds stay per-region
  (`--c25`/`--cMain`/`--c26`). **No per-widget chrome override** — a widget recolours only its own
  *body content* via `--c0..--c20`.
- **The sticky `main` header takes an opaque `--cCard`** so scrolling body content doesn't bleed
  through under it.
- **CSS location: native `css/widgets.css`** (Sass is being retired repo-wide); the tabs-only header
  rules and the `--c25/26` sidebar-nav coupling in `_tabs.sass`/`aside_ntp.sass` are removed.
- **DaisyUI coexistence:** the `--c*` chrome stops at the card edge. Widget bodies and the settings
  form render normal DaisyUI components on **base tokens via the existing bridge** — not recoloured
  by `--c*`. `--c*` stays out of `_bridge.css`, as it documents. No new bridge entries.

---

## Appendix — decision index

Ticket files are gone; this maps each decision to its spec section and surviving asset.

| # | Decision | Spec § | Asset |
|---|----------|--------|-------|
| 01 | CSS Grid named slots; drag lazy / options-page only | §1, §6 | [research](research/01-dashboard-grid-patterns.md) |
| 02 | Pinned-region / independent-scroll survey (superseded by 03) | §1 | [research](research/02-css-pin-scroll-techniques.md) |
| 03 | Rails on whole-page scroll; body scrolls, rails+search sticky | §1 | [prototype](prototype/03-layout-shell.html) |
| 04 | Lean descriptor: `placement`+`scrolls`+declarative `settings` | §2 | — |
| 05 | `widgets = { layout, settings }`; sparse overrides *(rule reversed by 08)* | §6 | — |
| 06 | Headerless cards; collapse dropped; shared `schemaForm.js`; `main.header` slot | §3–§5 | [prototype](prototype/06-panel-chrome.html) |
| 07 | Search + bookmarks as two widgets on a query bus; both CORE | §4 | — |
| 08 | Options-page-only; SortableJS drag + `enabled` toggle | §6 | [prototype](prototype/08-arrangement.html) |
| 09 | One breakpoint, main-first stack, `mobileSticky` setting | §7 | [prototype](prototype/09-responsive.html) |
| 10 | `--c*` drives chrome; global cards + per-region tints; native CSS | §8 | [prototype](prototype/10-c-chrome.html) |
