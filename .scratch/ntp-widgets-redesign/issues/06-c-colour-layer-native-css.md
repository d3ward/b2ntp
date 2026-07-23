# 06 — `--c*` colour layer on the new chrome + native `css/widgets.css`

**What to build:** The user-editable `--c*` colour slots drive the new widget-card chrome
directly (independent of DaisyUI). Region backgrounds, card surface/border, and card text all read
`--c*` slots; the sticky main header stays opaque so content doesn't bleed through it. The chrome
CSS lives in a native stylesheet (Sass is being retired), and the options page exposes the new
slots. Full detail: spec.md §8 (prototype: `prototype/10-c-chrome.html`, column A).

**Blocked by:** 02 — Three-region grid + whole-page scroll & pin; 03 — Headerless panel host + drop
collapse.

**Status:** ready-for-agent

Reference — slot mapping (spec.md §8):

| chrome part             | slot                                  |
|-------------------------|---------------------------------------|
| left region background  | `--c25` (exists)                      |
| main region background  | `--cMain` (new)                       |
| right region background | `--c26` (exists; now "right region")  |
| card surface (global)   | `--cCard` (new)                       |
| card border (global)    | `--cBorder` (new)                     |
| card body text / icon   | `--c21` (repurposed)                  |
| in-body content accents | `--c0..--c20` (unchanged)             |

- [ ] New slots `--cMain`, `--cCard`, `--cBorder` defined (light/dark pairs, switched by
      `[data-theme]`); `--c21` repurposed as card body text/icon.
- [ ] Cards read `--cCard`/`--cBorder`/`--c21` globally; region backgrounds read
      `--c25`/`--cMain`/`--c26` per region. No per-widget chrome override.
- [ ] The sticky `main` header card has an opaque `--cCard` background (no bleed-through on scroll).
- [ ] Widget chrome CSS lives in a native `css/widgets.css`; the tabs-only header rules and the
      `--c25`/`--c26` sidebar-nav coupling in `_tabs.sass` / `aside_ntp.sass` are removed.
- [ ] DaisyUI components inside widget bodies and the settings form keep base tokens (via the
      existing bridge); `--c*` stays out of `_bridge.css`.
- [ ] The options colour section edits the new slots; light/dark both verified.
