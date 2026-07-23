# Research: CSS pinned-region + independent-scroll techniques

Decision consolidated into [`../spec.md`](../spec.md) §1 (ticket 02; ticket file removed).
Feeds: prototype ticket 03 (layout/scroll/pin).

## TL;DR recommendation

Stop scrolling `<body>`. Build a **fixed-height app-shell** whose root fills the viewport
(`height: 100dvh`) and does **not** scroll. Put pinned widgets in shell regions that are
outside the scroll flow; give the content region its own `overflow-y: auto` + `min-height: 0`.
Use `overscroll-behavior: contain` on the scroll region so the NTP never rubber-bands or scroll-chains.
This makes "pinned" the structural default and "scrolls away" an explicit opt-in — the inverse of
today's `body`-scroll + `position: sticky` rails, which is exactly why the search bar escapes.

This is why today's rails fail: `position: sticky` only holds an element **within its own
containing block**. The `aside` rails are children of `.workspace`, so once `.workspace`'s bottom
scrolls past, the sticky element has nowhere left to stick and leaves with it (see failure modes).

## Why today's setup breaks (root cause)

`_ntp.sass` today: `body { min-height: 100vh }` scrolls the whole document; `aside {
position: sticky; top: .5rem; align-self: flex-start }`. Two problems:

1. **Sticky is bounded by its containing block.** MDN: a sticky element "is positioned according
   to the normal flow of the document, and then offset relative to its *nearest scrolling ancestor*
   and containing block (nearest block-level ancestor)." The element can never travel outside that
   containing block. The rail's containing block is `.workspace`; when `.workspace` bottom passes
   the top threshold, the rail un-sticks and scrolls off. Classic "sticky stops halfway" bug.
   Source: https://developer.mozilla.org/en-US/docs/Web/CSS/position
2. **`overflow-x: hidden` on `html, body` silently creates a vertical scroll container.** Per the
   `overflow` computed-value rule, when one axis is not `visible`/`clip`, the *other* axis's
   `visible` computes to `auto`. So `overflow-x: hidden` ⇒ `overflow-y: auto`, i.e. body becomes a
   scroll container. This can also re-anchor sticky to an unexpected ancestor.
   Source: https://developer.mozilla.org/en-US/docs/Web/CSS/overflow (Formal definition → Computed value)

## Recommended pattern — fixed-shell + per-region scroll

```css
/* Root shell fills the viewport and never scrolls */
.ntp-shell {
  display: grid;
  grid-template-columns: 20% 1fr 20%;   /* left rail | content | right rail */
  grid-template-rows: auto 1fr;          /* pinned header row | body */
  grid-template-areas:
    "header header header"
    "left   content right";
  height: 100dvh;                        /* dynamic viewport unit; see gotchas */
  overflow: hidden;                      /* shell itself is inert */
}

/* Pinned regions: live in shell cells, so they simply never scroll */
.ntp-header { grid-area: header; }       /* e.g. search bar — always visible */
.ntp-left   { grid-area: left; }
.ntp-right  { grid-area: right; }

/* The ONE region that scrolls independently */
.ntp-content {
  grid-area: content;
  min-height: 0;                         /* CRITICAL — see gotcha #1 */
  overflow-y: auto;
  overscroll-behavior: contain;          /* no scroll-chaining / bounce */
}
```

- The pinned search bar/rails are structurally outside the scroll region, so they can't scroll
  away — no `position: sticky` fragility involved.
- Only `.ntp-content` scrolls; e.g. a long bookmarks widget gets its own scrollbar.
- A rail that should itself scroll internally (long widget list) becomes its own scroll region:
  `.ntp-left { min-height: 0; overflow-y: auto; overscroll-behavior: contain; }`.

## Expressing "pin vs scroll-with-content" per widget

Two composable mechanisms; pick per the layout engine's model:

**(a) Region placement (preferred for the shell above).** A widget's pin state = which shell
region it is mounted into. `pin: true` → a pinned shell cell (header/rail). `pin: false` → mounted
inside `.ntp-content`. Clean, no sticky edge-cases, maps directly to a `data-pin` config field.

**(b) `position: sticky` *inside* the scroll region (for "pin while its section is on screen").**
When a widget should scroll normally but stick to the top of the *content region* while in view,
give it sticky inside the scroll container — and note sticky is reliable here because the scroll
container (`.ntp-content`) is a real, taller-than-viewport scroll box:

```css
.ntp-content { position: relative; }         /* containing block for sticky */
.widget[data-pin="sticky"] {
  position: sticky;
  top: 0;                                     /* a non-auto inset is REQUIRED */
  z-index: 1;
}
```

MDN: "At least one inset property … needs to be set to a non-`auto` value … If both inset
properties for an axis are `auto`, on that axis `sticky` will behave as `relative`." Sticky also
"always creates a new stacking context." Source: MDN `position`.

Mapping to config: a single per-widget field, e.g. `pin: "fixed" | "sticky" | "scroll"`, drives
region placement (`fixed`) vs. in-content sticky (`sticky`) vs. plain flow (`scroll`).

## Viewport-unit choice for shell height

- `100vh` == `100lvh` (**large** viewport) today — sized as if mobile browser UI is *hidden*. On a
  phone with a retractable address bar this overflows when the UI expands. This is the classic
  `100vh` mobile bug.
- `100svh` = **small** viewport (UI expanded); stable, never overflows, but leaves a gap when UI
  retracts.
- `100dvh` = **dynamic**; resizes as the browser UI shows/hides — exact fit, but MDN warns it can
  "resize while a user is scrolling … lead to degradation of the user interface and cause a
  performance hit."
- **For an NTP:** desktop new-tab has no dynamic browser chrome, so `100dvh` ≈ `100vh` and the
  perf caveat is moot on desktop. Use `height: 100dvh` with `height: 100vh` as a harmless fallback
  order for correct mobile behavior. Source:
  https://developer.mozilla.org/en-US/docs/Web/CSS/length (viewport-percentage units)

## Gotchas checklist

1. **`min-height: 0` (or `min-block-size: 0`) on every scrollable flex/grid child.** Flex & grid
   items default to `min-height: auto`, which refuses to shrink below content size — so the
   *container* overflows and the child's `overflow-y: auto` produces no scrollbar. Setting
   `min-height: 0` lets the child shrink and scroll. Single most common cause of "overflow:auto
   does nothing inside grid/flex." Source:
   https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Mastering_wrapping_of_flex_items
2. **Sticky can't escape its containing block** (root cause above) — if you keep any sticky
   widget, ensure its scroll container is taller than the viewport region or it has no travel.
3. **`overflow-x: hidden` ⇒ `overflow-y: auto`.** Auditing the migration: the current
   `html, body { overflow-x: hidden }` turns body into a scroll container. In the fixed-shell model
   put clipping on `.ntp-shell { overflow: hidden }` instead and drop body-level overflow hacks,
   or you reintroduce a stray scroll container / sticky anchor.
4. **Sticky needs a non-`auto` inset** (`top`, `bottom`, …) or it degrades to `relative`.
5. **`overscroll-behavior: contain`** stops scroll-chaining AND disables pull-to-refresh / bounce
   inside that region — desirable for an NTP scroll pane, but be intentional. Note: "A scroll
   container that has no scrollable overflow … is always considered to be at its scroll boundary,"
   so `contain`/`none` on it still blocks chaining to ancestors. Source:
   https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior
6. **Sticky repaint perf/accessibility:** MDN suggests `will-change: transform` on sticky/fixed
   elements to layer-promote and cut repaint cost — apply sparingly.

## Browser support (Chrome + Firefox — this is an extension NTP)

| Feature | Chrome | Firefox | Notes |
|---|---|---|---|
| `position: sticky` | ✅ long-standing | ✅ long-standing | Baseline; safe. |
| `overflow` per-axis scroll containers | ✅ | ✅ | Baseline. |
| CSS Grid / Flex + `min-height:0` | ✅ | ✅ | Baseline. |
| `svh` / `lvh` / `dvh` | **108+** | **101+** | Firefox landed first (101); Chrome disabled-by-default 100–107, full at 108. Global ~92.5%. |
| `overscroll-behavior` | **65+** | **59+** | Long-standing in both target engines. (Safari only 16+, irrelevant here.) |

Sources: https://caniuse.com/viewport-unit-variants , https://caniuse.com/css-overscroll-behavior

Both extension targets (modern Chrome + Firefox) fully support the whole recommended stack. The
only version-sensitive piece, `dvh`, needs Chrome 108 / Firefox 101 — pair it with a `100vh`
fallback for very old builds; on desktop NTP the difference is negligible anyway.

## Prototype hints for ticket 03

- Root: `display: grid; height: 100dvh; overflow: hidden` app-shell; named areas for
  pinned rows/rails + one `1fr` content cell.
- Content cell + any internally-scrolling rail: `min-height: 0; overflow-y: auto;
  overscroll-behavior: contain`.
- Per-widget config field `pin: "fixed" | "sticky" | "scroll"` → region placement or in-content
  sticky (`top: 0`, non-auto inset).
- Verify: long bookmarks widget scrolls while search bar/rails stay put; resize the window to
  confirm the shell never produces a body-level scrollbar.
