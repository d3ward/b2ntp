# 04 — Settings renderer (schemaForm) on the options page

**What to build:** Each widget's settings UI on the options page is generated from its declarative
`settings` schema instead of being hand-built. Changing a control writes only the changed values
(sparse overrides); resetting a control back to its default removes the stored key. Full detail:
spec.md §5 and §2 (prototype: `prototype/06-panel-chrome.html` §C).

**Blocked by:** 01 — Config model + descriptor migration.

**Status:** ready-for-agent

Reference — field `type` → control (spec.md §5):

| `type`   | control                   | extra schema keys           |
|----------|---------------------------|-----------------------------|
| `bool`   | checkbox / DaisyUI toggle | —                           |
| `select` | `<select>`                | `options: [[value, label]]` |
| `text`   | text input                | `placeholder`               |
| `number` | number input              | `min`, `max`, `step`        |
| `range`  | slider                    | `min`, `max`, `step`        |

Every field also takes `label`, `default`, optional `hint`. Unknown `type` → `text`.

- [ ] `schemaForm.js` exposes `renderSettingsForm(schema, values, onChange)` that renders each
      field per the table; unknown types fall back to `text`.
- [ ] Existing widgets declare their `settings` schema (e.g. clock seconds/format, weather units)
      so today's per-widget options are reproduced through the schema.
- [ ] The options page renders each widget's controls via the renderer (replacing the hand-built
      markup for migrated widgets).
- [ ] `onChange` writes **sparse overrides** into `widgets.settings[id]`; setting a value back to
      its descriptor default deletes the key (and an emptied widget key is dropped).
- [ ] Renderer unit tests cover each field type + the sparse-write/delete behaviour.
