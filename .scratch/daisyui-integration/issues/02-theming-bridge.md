Status: resolved
Blocked by: 01

# Bridge DaisyUI theme tokens to b2ntp's existing custom properties

## Goal

Make DaisyUI components automatically adopt b2ntp's existing light/dark palette, so that migrated components are visually unified with the un-migrated ones throughout the rest of the migration — rather than shipping DaisyUI's default palette as a competing second theme.

## Scope

- Define DaisyUI themes using its CSS-first configuration (`@plugin "daisyui/theme"`) in the Tailwind CSS entry created in ticket 01. DaisyUI v5 has no `tailwind.config.js` JS theme config.
- Key the themes off the `[data-theme="light"]` / `[data-theme="dark"]` attribute that b2ntp **already** toggles on `<body>` (set in `src-ext/js/blank.js` and `src-ext/js/options.js`, driven by `settingsState.getNtpTheme()`). Do not introduce a second theme-switching mechanism.
- Alias DaisyUI's semantic tokens to the existing custom properties defined in `src-ext/sass/theme/light.sass` and `theme/dark.sass`:
  - `--color-primary` → `--primary`, and the primary content/foreground token → `--txt-on-p`
  - base/surface tokens → `--bg`, `--bg2`, `--bg3`
  - base content/text token → `--txt`
  - border token → `--brd`
  - semantic status tokens → the existing `--green`, `--red`, `--orange`, `--blue`
  - radius token → `--radius` (currently `.5rem`), so DaisyUI components inherit the corner rounding already standardised across the codebase
- **Do not** touch, alias, or absorb the `--c0`–`--c26` NTP widget colour-slot system (`src-ext/sass/theme/ntp.sass`). That is an independent theming layer for bookmarks / tabs sidebar / weather and is explicitly out of scope for DaisyUI's theme model.

## Acceptance criteria

- A probe DaisyUI `btn btn-primary` renders in b2ntp's purple (`--primary`), not DaisyUI's stock blue.
- Toggling light/dark in the app (`Ctrl+T`, or the theme toggle in settings) flips the probe component's colours in step with the rest of the UI, with no flash or separate transition.
- The `--c0`–`--c26` slot values are byte-for-byte unchanged; the NTP bookmarks/tabs/weather rendering is pixel-identical to before.
- `npm run build-ext` succeeds and existing vitest failures are unchanged (6 pre-existing in `panelHost.test.js`).

## Notes

- Recent work fixed the light-mode defaults for the tabs sidebar and weather widget slots so they follow the bookmarks palette. Do not regress those values while wiring the bridge.
- If a DaisyUI token has no clean b2ntp equivalent, prefer deriving it from an existing property (e.g. `color-mix`) over inventing a new hard-coded colour — inventing values here re-creates the exact palette-drift problem this bridge exists to prevent.

## Comments

**Implemented** in `src-ext/css/tailwind.css` via DaisyUI v5's CSS-first
`@plugin "daisyui/theme"`. Two themes, `light` (default) and `dark`, keyed off the
`[data-theme]` attribute b2ntp already toggles on `<body>` from
`settingsState.getNtpTheme()`. No second theme-switching mechanism was introduced;
`prefersdark` is `false` on both so the OS media query cannot fight the existing JS
auto-switch logic.

Also added `themes: false` to the `@plugin "daisyui"` block. Without it DaisyUI ships its
stock light/dark themes, which claim the same `[data-theme="light"]`/`[data-theme="dark"]`
selectors as the bridge and compete with it.

### Token mapping

| DaisyUI | b2ntp |
|---|---|
| `--color-primary` | `--primary` |
| `--color-primary-content` | `--txt-on-p` |
| `--color-base-100/200/300` | `--bg` / `--bg2` / `--bg3` |
| `--color-base-content` | `--txt` |
| `--color-info/success/warning/error` | `--blue` / `--green` / `--orange` / `--red` |
| `--color-*-content` (status) | `--txt-on-blue` / `-green` / `-orange` / `-red` |
| `--color-neutral` / `-content` | `--txt` / `--bg` (matches the old `.btn-inverted`) |
| `--radius-box`, `--radius-field` | `--radius` |

Nothing is hard-coded. `secondary`/`accent` have no b2ntp equivalent and are derived from
the existing primary ramp (`--primary-l`, `--primary-d`) rather than invented, per the
ticket's guidance. `--depth: 0` / `--noise: 0` to match b2ntp's flat look.

### Two deviations, both deliberate

1. **`--radius-selector` stays at DaisyUI's `1rem` default**, not `--radius`. It governs
   checkbox/toggle/badge only. b2ntp's bespoke toggle is a fully-rounded pill; `--radius`
   (.5rem) would square it off, which works against the ticket's actual goal of visual
   unity. `--radius` governs boxes and fields, which is where b2ntp standardised it.
2. **Border colour is not bridged.** DaisyUI v5 has no border-colour token — components
   derive borders from `base-content` and set it as `--input-color` *on the component
   itself*, so a `:root`-level alias to `--brd` is overridden and does nothing. I wrote one,
   confirmed it was inert, and removed it rather than ship dead CSS. Mapping `--brd` moves
   to ticket 04, where it can be verified against real inputs.

### Verification

- Probe `<div class="btn btn-primary">` computes `rgb(128, 52, 213)` = `#8034d5` =
  b2ntp's `--primary`, **not** DaisyUI stock blue. `btn-error` computes `#ff4132` = `--red`.
  Border radius resolves to 8px = `--radius`.
- `--color-base-100` tracks `--bg` in both themes and flips with the attribute
  (`#f9fafb` → `#040404`), so migrated components change in step with the rest of the UI.
- `--c0`..`--c26` verified unchanged at runtime in both themes; `theme/ntp.sass` and
  `settings/_colors.sass` are byte-for-byte identical to the pre-migration commit
  (`git diff a9ae737` empty). A runtime slot snapshot is now captured so later tickets can
  diff against it.
- Screenshot suite: **19 of 20 pixel-identical** to the pre-migration baseline.

### The one non-identical render — resolved, not regressed

`options_backup_dark` differs by 0.081%: the native `<progress>` storage meter
(`#size_progress`). Ticket 01 predicted this would disappear here. It did not, and that is
correct — the bridged dark theme sets `color-scheme: dark` deliberately.

Sampling the pixels shows why this is a fix rather than a regression: the bar was
`rgb(239,239,239)` (light UA chrome sitting on a dark background) and is now
`rgb(59,59,59)`. The pre-migration state was the anomaly.

### Note for ticket 13 (cascade layers)

While probing the bridge I found `postcss-cascade-layers` (via `postcss-preset-env` stage 2)
strips all `@layer` from the output. DaisyUI therefore wins on raw specificity via its
`:not(#\#)` x4 hack, not layer order. Full detail appended to ticket 01. This matters for
tickets 07 and 11, which need bespoke CSS to override DaisyUI.

`npm run build-ext` succeeds; vitest unchanged at 87 passed / 6 pre-existing failures.
