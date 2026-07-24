import Sortable from 'sortablejs'
import { WIDGETS, CORE_WIDGET_IDS } from '../widgets/registry.js'
import { settingsState } from './state.js'
import { resolveWidgetSettings, setWidgetSettingOverride } from '../widgets/resolver.js'
import { renderSettingsForm } from '../widgets/schemaForm.js'

const DRAG_HANDLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>`

export function initWidgetSettings() {
  const leftListEl = document.getElementById('wdg-order-left')
  const rightListEl = document.getElementById('wdg-order-right')
  const mainHeaderListEl = document.getElementById('wdg-order-main-header')
  const mainBodyListEl = document.getElementById('wdg-order-main-body')

  if (!leftListEl || !rightListEl || !mainHeaderListEl || !mainBodyListEl) return

  function getCfg() {
    return settingsState.getWidgets()
  }

  function toggleWidget(widgetId, enabled) {
    const cfg = structuredClone(getCfg())
    cfg.settings[widgetId] = cfg.settings[widgetId] || {}
    if (enabled) delete cfg.settings[widgetId].enabled
    else cfg.settings[widgetId].enabled = false
    if (Object.keys(cfg.settings[widgetId]).length === 0) delete cfg.settings[widgetId]
    settingsState.setWidgets(cfg)
    render()
  }

  // Builds one widget row and appends it to listEl. CORE widgets (search,
  // bookmarks) get no toggle and no drag handle -- spec.md §6: not
  // removable, not movable out of `main`. Per-widget settings live in each
  // widget's own settings tab now (initWidgetDetailSettings below), not
  // inline here.
  function appendItem(listEl, id, { draggable }) {
    const descriptor = WIDGETS[id]
    if (!descriptor) return

    const cfg = getCfg()
    const resolved = resolveWidgetSettings(descriptor, cfg)
    const active = resolved.enabled !== false
    const isCore = CORE_WIDGET_IDS.has(id)

    const item = document.createElement('li')
    item.className = 'wdg-order-item' + (active ? ' wdg-active' : ' wdg-inactive')
    if (draggable) item.classList.add('wdg-draggable')
    item.dataset.id = id

    const handle = document.createElement('span')
    if (draggable) {
      handle.className = 'wdg-drag-handle'
      handle.innerHTML = DRAG_HANDLE_SVG
    } else {
      // Empty spacer: keeps icon/name aligned with draggable rows without
      // giving SortableJS's `handle` selector anything to grab.
      handle.className = 'wdg-drag-handle-spacer'
    }

    const icon = document.createElement('span')
    icon.className = 'wdg-item-icon'
    icon.innerHTML = descriptor.icon

    const name = document.createElement('span')
    name.className = 'wdg-item-name'
    name.textContent = descriptor.label

    item.append(handle, icon, name)

    if (!isCore) {
      const toggle = document.createElement('input')
      toggle.type = 'checkbox'
      toggle.className = 'toggle toggle-primary wdg-toggle'
      toggle.checked = active
      toggle.setAttribute('aria-label', `${active ? 'Disable' : 'Enable'} ${descriptor.label}`)
      toggle.addEventListener('change', () => toggleWidget(id, toggle.checked))
      item.appendChild(toggle)
    }

    listEl.appendChild(item)
  }

  function renderRail(listEl, region) {
    listEl.innerHTML = ''
    const ids = getCfg().layout[region] || []
    for (const id of ids) appendItem(listEl, id, { draggable: true })
  }

  function renderMain() {
    mainHeaderListEl.innerHTML = ''
    mainBodyListEl.innerHTML = ''
    const { header, body } = getCfg().layout.main || {}
    if (header) appendItem(mainHeaderListEl, header, { draggable: false })
    for (const id of body || []) appendItem(mainBodyListEl, id, { draggable: !CORE_WIDGET_IDS.has(id) })
  }

  function render() {
    renderRail(leftListEl, 'left')
    renderRail(rightListEl, 'right')
    renderMain()
  }

  function readOrder(listEl) {
    return [...listEl.querySelectorAll(':scope > .wdg-order-item')].map((el) => el.dataset.id)
  }

  function persistFromDom() {
    const cfg = structuredClone(getCfg())
    cfg.layout.left = readOrder(leftListEl)
    cfg.layout.right = readOrder(rightListEl)
    cfg.layout.main = { header: cfg.layout.main?.header ?? null, body: readOrder(mainBodyListEl) }
    settingsState.setWidgets(cfg)
    render()
  }

  // The three rail/body lists share a group so widgets drag between regions
  // as well as reorder within one. `main.header` deliberately gets no
  // Sortable instance at all -- an element outside the group can't accept a
  // drop, which is what keeps it a fixed, single-widget slot (spec.md §6).
  const sortableOptions = {
    group: 'wdg-regions',
    handle: '.wdg-drag-handle',
    ghostClass: 'dragging',
    animation: 150,
    onEnd: persistFromDom,
  }
  new Sortable(leftListEl, sortableOptions)
  new Sortable(rightListEl, sortableOptions)
  new Sortable(mainBodyListEl, sortableOptions)

  render()
}

// A generic settings panel for one widget's own declarative schema (§5),
// used by each widget's dedicated settings tab/page instead of the Layout
// arrangement list (which only handles placement + visibility). Works for
// any widget id, including ones outside the Widgets page entirely -- e.g.
// `search`'s panel lives on the Search settings page, next to the rest of
// the search bar's settings.
export function initWidgetDetailSettings(containerId, widgetId) {
  const containerEl = document.getElementById(containerId)
  const descriptor = WIDGETS[widgetId]
  if (!containerEl || !descriptor) return

  const schema = descriptor.settings || {}

  function render() {
    containerEl.innerHTML = ''
    if (Object.keys(schema).length === 0) {
      const empty = document.createElement('p')
      empty.className = 'schema-field-hint'
      empty.textContent = 'This widget has no settings yet.'
      containerEl.appendChild(empty)
      return
    }
    const resolved = resolveWidgetSettings(descriptor, settingsState.getWidgets())
    const form = renderSettingsForm(schema, resolved, (key, value) => {
      settingsState.setWidgets(setWidgetSettingOverride(descriptor, settingsState.getWidgets(), key, value))
    })
    containerEl.appendChild(form)
  }

  render()
}
