Status: resolved
Blocked by: 03, 04, 05, 06, 07, 08, 09, 10, 11

# Delete the bespoke utility Sass layer and convert markup to Tailwind utilities

## Goal

Remove b2ntp's private utility-class system now that Tailwind provides the same capability, and convert the markup that used it.

## Scope

Delete these files from `src-ext/sass/utilities/` and remove them from `src-ext/sass/_core.sass`:

`_alignment.sass`, `_background.sass`, `_border.sass`, `_display.sass`, `_general.sass`, `_margin.sass`, `_padding.sass`, `_position.sass`, `_spacer.sass`, `_text.sass`

The markup surface is small — an audit of `src-ext/**/*.html` found these bespoke utility classes actually in use:

| Class | Uses | Tailwind equivalent |
|---|---|---|
| `_2-col` | 6 | `grid grid-cols-2 gap-2` (verify gap against current) |
| `_ta-center` | 5 | `text-center` |
| `_d-flex` | 3 | `flex` |
| `_f-center` | 3 | `justify-center items-center` (confirm which axis the source rule sets) |
| `_p-1` | 2 | `p-4` (source uses `1rem`) |
| `_pt-4`, `_pt-2`, `_pb-1`, `_mt-2`, `_mt-1` | 1 each | `pt-*`, `pb-*`, `mt-*` per the source rem values |
| `_radius` | 1 | `rounded-[--radius]` or the bridged DaisyUI radius |
| `_bg-bg3`, `_bg3` | 1 each | background utility mapped to `--bg3` |
| `_max-500` | 1 | `max-w-[500px]` |
| `_shadowless` | 1 | `shadow-none` |
| `_ta-left` | 1 | `text-left` |
| `_brd-txt` | 1 | border-colour utility mapped to `--txt` |

Read each source rule before converting — map to the actual declared values, don't assume the Tailwind scale matches.

**Do not touch** (these matched a naive `_`-prefix grep but are component/ID names, not utilities): `stt_clfrt` (colour swatches, 54 uses), and the weather widget's `wth_*` classes (`_c`, `_d`, `_d1`, `_i`, `_t`, `_l`, `_s`, `_mm`, `_h`, `_w`, `_btm`).

Also out of scope: `src-ext/sass/utilities/` is shared with the `src-web` build via `_core.sass` — **verify whether `src-web` markup uses these utility classes before deleting.** If it does, either scope the deletion to the extension or migrate `src-web` markup too; `src-web` is otherwise out of scope for this effort, so surface the conflict rather than silently changing the marketing site.

## Acceptance criteria

- All ten utility Sass files are deleted and removed from `_core.sass`.
- No markup in `src-ext` references a deleted class (grep to confirm zero remaining matches).
- Every affected page/section renders identically to before, verified by screenshot across all settings sections and the NTP.
- `src-web` either still builds and renders correctly, or the conflict is documented and raised.
- `npm run build-ext` and `npm run build` both succeed; vitest failures unchanged.

## Notes

- Blocked by all component tickets because those migrations will themselves remove or rewrite markup carrying these classes — doing the cleanup first would mean converting classes that are about to be deleted anyway.

## Comments

**Implemented.** All ten `src-ext/sass/utilities/*.sass` files deleted. They were imported only
by `blank.sass` (not `_core.sass`), so those `@use` lines were the only removal needed —
`blank.sass` is now three lines.

### The ticket's two main premises were both wrong

**1. `src-web` does not share these files.** The ticket warned that `utilities/` is shared with
the `src-web` build via `_core.sass` and asked me to surface the conflict. In fact `src-web` has
its **own complete copy** at `src-web/sass/utilities/` (11 files), imported from
`src-web/sass/index.sass`. The two trees are fully independent, so deleting the extension's copy
cannot affect the marketing site. `npm run build` verified passing.

**2. Utilities were never loaded on the settings page.** Only `blank.sass` imported them;
`options.sass` never did. Since almost all the usages are in `settings.html`, which renders only
inside `options.html`, most of these classes **were already doing nothing**. (Same trap that bit
ticket 03's `._icon` and ticket 08's `._bg-bg3`.)

### Actual inventory vs the ticket's table

The table in this ticket did not match the code. Auditing every `_`-prefixed class in markup and
JS, mapping each to its defining rule:

**Genuinely dead — used in markup, defined nowhere.** Removed, no replacement needed:
`_d-flex` (3), `_aos-top`, `_ta-left`, `_p-1`, `_pt-4`, `_pb-1`, `_pt-2`, `_brd-txt`, `_icon`.

**Live, but defined outside `utilities/`** — the ticket assumed these were in the utility layer:

| class | actually defined in | converted to |
|---|---|---|
| `_2-col` (6) | `layout/grid.sass` | `grid grid-cols-2 gap-2` |
| `_ta-center` (5) | `components/_settings.sass` | `text-center` |
| `_f-center` (3) | `utilities/_general.sass` **and** `components/_settings.sass` | `flex items-center justify-center` |
| `_max-500` (1) | `components/_settings.sass` | `max-w-[500px] mx-auto` |
| `_txt` (1) | `utilities/_text.sass` | `text-[color:var(--txt)]` |

Each was converted from its **actual declared values**, not the ticket's guesses — e.g. `_2-col`
is `gap: 0.5rem`, so `gap-2`, and `_max-500` also carried `margin: auto`, hence `mx-auto`.

The `._f-center` rule in `_settings.sass` also served `#b_add, #b_add2, #b_save, #b_close`; only
the `._f-center` part of that selector list was removed so those IDs keep working.

Classes the ticket listed that no longer existed by this point (`_mt-2`, `_mt-1`, `_radius`,
`_bg-bg3`, `_bg3`, `_shadowless`) had already been removed by tickets 06/08 and the card work.

Confirmed zero `_`-prefixed classes remain in any `src-ext` markup.

### Removing a11y-dialog broke the marketing site

`npm uninstall a11y-dialog` (from ticket 07's rework) broke `npm run build`: **`src-web/js/themes.js`
imports it**. Since `src-web` is explicitly out of scope, the dependency is restored. It is not
bundled into the extension — the only trace in `dist-ext` is the dependency list inside the
inlined `package.json`, which `blank.js`/`options.js` pull in for `version`.

### Dead code found but NOT deleted

`src-ext/js/components/dialog.js` — a vendored copy of a11y-dialog, imported nowhere — is deleted,
since ticket 07's rework definitively obsoleted it.

Eight further component files are imported by nothing and appear to be **pre-existing** dead code
unrelated to this migration. Listing rather than deleting, since that is the maintainer's call:
`alert.js`, `embla_utils.js`, `gotop.js`, `modal.js`, `navbar.js`, `sidebar.js`,
`swipeManager.js`, `themeManager.js`. Note `gotop.js` being unimported means the `#gt-link`
button in `gotop.html` never gets its scroll handler.

Also still present and dead (verified in ticket 04): the `.double-slider` / `.slider-track` /
`#start-time::-webkit-slider-thumb` rules and `#timeFormat,#dateFormat,#auto-switch-type` in
`base/_ntp.sass` — settings-page selectors sitting in a `blank.sass`-only file — and
`#wt_status:checked~.b2-grid` in `_widget_config.sass`.

### Verification

- `npm run build-ext` and `npm run build` both succeed.
- All settings sections and the NTP screenshotted in both themes and reviewed. The NTP was also
  captured with the changelog dismissed (the harness always catches it open on a fresh profile),
  confirming wallpaper, clock, search bar and sidebars all render normally.
- vitest unchanged at 87 passed / 6 pre-existing failures.

### Correction (raised in code review)

The "Genuinely dead — used in markup, defined nowhere" list above is **wrong about the reason**.
`_ta-left`, `_p-1`, `_pt-4`, `_pb-1`, `_pt-2` and `_d-flex` *were* defined — generated by loops in
`utilities/_alignment.sass`, `_padding.sass` and `_display.sass` (e.g. `$sizes` contains
`"1"`,`"2"`,`"4"`). My per-class grep looked for literal `.` + name selectors and so missed
loop-generated ones.

The **outcome** stands: they were inert, because `options.sass` never imports `utilities/` and
those elements only render on the options page. So removing them changed nothing — verified by
screenshot. But the stated justification was wrong and is corrected here.

One consequence was real: rewriting those class lists left empty attributes (`<ul >`, `<p >`) and
double spaces in the markup. Cleaned up.
