Status: ready-for-agent
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
