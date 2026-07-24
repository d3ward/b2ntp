import Sortable from 'sortablejs'
import { WIDGETS, CORE_WIDGET_IDS } from '../widgets/registry.js'
import { settingsState } from './state.js'
import { resolveWidgetSettings, setWidgetSettingOverride } from '../widgets/resolver.js'
import { renderSettingsForm } from '../widgets/schemaForm.js'

const DRAG_HANDLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>`
const GEAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/></svg>`

export function initWidgetSettings() {
  // Widgets whose settings row is currently expanded via the gear button.
  const openSettings = new Set()

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

  // Builds one widget row (and its settings row, if expanded) and appends
  // both to listEl. CORE widgets (search, bookmarks) get no toggle and no
  // drag handle -- spec.md §6: not removable, not movable out of `main`.
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

    // No gear for a disabled widget -- its settings aren't reachable until
    // it's re-enabled, so there's nothing for the gear to open.
    const hasSchema = Object.keys(descriptor.settings || {}).length > 0
    if (hasSchema && active) {
      const gear = document.createElement('button')
      gear.type = 'button'
      gear.className = 'wdg-gear-btn'
      gear.innerHTML = GEAR_SVG
      gear.setAttribute('aria-label', `${descriptor.label} settings`)
      gear.setAttribute('aria-expanded', String(openSettings.has(id)))
      gear.addEventListener('click', () => {
        if (openSettings.has(id)) openSettings.delete(id)
        else openSettings.add(id)
        render()
      })
      item.appendChild(gear)
    }

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

    if (hasSchema && active && openSettings.has(id)) {
      const row = document.createElement('li')
      row.className = 'wdg-settings-row'
      const form = renderSettingsForm(descriptor.settings, resolved, (key, value) => {
        settingsState.setWidgets(setWidgetSettingOverride(descriptor, getCfg(), key, value))
      })
      row.appendChild(form)
      listEl.appendChild(row)
    }
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

  // Settings rows are plain <li> siblings with no drag handle, so they never
  // initiate a drag -- but read the order back from `.wdg-order-item` only,
  // in case SortableJS repositions one as a side effect of a neighbour's drag.
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
    filter: '.wdg-settings-row',
    ghostClass: 'dragging',
    animation: 150,
    onEnd: persistFromDom,
  }
  new Sortable(leftListEl, sortableOptions)
  new Sortable(rightListEl, sortableOptions)
  new Sortable(mainBodyListEl, sortableOptions)

  render()
}
