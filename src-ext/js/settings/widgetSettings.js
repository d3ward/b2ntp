import { WIDGETS } from '../widgets/registry.js'
import { settingsState } from './state.js'
import { resolveWidgetSettings, setWidgetSettingOverride } from '../widgets/resolver.js'
import { renderSettingsForm } from '../widgets/schemaForm.js'

const DRAG_HANDLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>`

export function initWidgetSettings() {
  const leftListEl = document.getElementById('wdg-order-left')
  const rightListEl = document.getElementById('wdg-order-right')

  if (!leftListEl || !rightListEl) return

  function getCfg() {
    return settingsState.getWidgets()
  }

  function isActive(widgetId, side, cfg) {
    if (!(cfg.layout[side] || []).includes(widgetId)) return false
    return resolveWidgetSettings(WIDGETS[widgetId], cfg).enabled !== false
  }

  function toggleWidget(widgetId, side, enabled) {
    const cfg = structuredClone(getCfg())
    const other = side === 'left' ? 'right' : 'left'
    cfg.settings[widgetId] = cfg.settings[widgetId] || {}
    if (enabled) {
      cfg.layout[other] = (cfg.layout[other] || []).filter((id) => id !== widgetId)
      if (!cfg.layout[side].includes(widgetId)) cfg.layout[side].push(widgetId)
      delete cfg.settings[widgetId].enabled
    } else {
      cfg.settings[widgetId].enabled = false
    }
    if (Object.keys(cfg.settings[widgetId]).length === 0) delete cfg.settings[widgetId]
    settingsState.setWidgets(cfg)
    render()
  }

  function renderColumn(listEl, side) {
    const cfg = getCfg()
    const allIds = Object.keys(WIDGETS)
    const activeIds = (cfg.layout[side] || []).filter((id) => isActive(id, side, cfg))
    const inactiveIds = allIds.filter((id) => !activeIds.includes(id))

    listEl.innerHTML = ''

    const renderItem = (id, active) => {
      const descriptor = WIDGETS[id]
      if (!descriptor) return

      const item = document.createElement('li')
      item.className = 'wdg-order-item' + (active ? ' wdg-active' : ' wdg-inactive')
      item.draggable = active
      item.dataset.id = id

      const handle = document.createElement('span')
      handle.className = 'wdg-drag-handle'
      handle.innerHTML = DRAG_HANDLE_SVG

      const icon = document.createElement('span')
      icon.className = 'wdg-item-icon'
      icon.innerHTML = descriptor.icon

      const name = document.createElement('span')
      name.className = 'wdg-item-name'
      name.textContent = descriptor.label

      const toggle = document.createElement('input')
      toggle.type = 'checkbox'
      toggle.className = 'toggle toggle-primary wdg-toggle'
      toggle.checked = active
      toggle.setAttribute('aria-label', `${active ? 'Remove' : 'Add'} ${descriptor.label} to ${side} sidebar`)
      toggle.addEventListener('change', () => toggleWidget(id, side, toggle.checked))

      item.appendChild(handle)
      item.appendChild(icon)
      item.appendChild(name)
      item.appendChild(toggle)
      listEl.appendChild(item)

      if (active && Object.keys(descriptor.settings || {}).length > 0) {
        const settingsRow = document.createElement('li')
        settingsRow.className = 'wdg-settings-row'
        // `cfg` (renderColumn's snapshot) is fine for the initial values below,
        // but the onChange write re-fetches getCfg() fresh -- it must not
        // write back a config that's gone stale from a change made elsewhere
        // on the page since this row was drawn.
        const resolved = resolveWidgetSettings(descriptor, cfg)
        const form = renderSettingsForm(descriptor.settings, resolved, (key, value) => {
          settingsState.setWidgets(setWidgetSettingOverride(descriptor, getCfg(), key, value))
        })
        settingsRow.appendChild(form)
        listEl.appendChild(settingsRow)
      }
    }

    activeIds.forEach((id) => renderItem(id, true))
    inactiveIds.forEach((id) => renderItem(id, false))
  }

  function render() {
    renderColumn(leftListEl, 'left')
    renderColumn(rightListEl, 'right')
  }

  function getDragAfterElement(listEl, y) {
    const activeItems = [...listEl.querySelectorAll('.wdg-active:not(.dragging)')]
    return activeItems.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) return { offset, element: child }
        return closest
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element
  }

  function setupDnd(listEl, side) {
    listEl.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.wdg-active')
      if (!item) return
      e.dataTransfer.effectAllowed = 'move'
      item.classList.add('dragging')
    })

    listEl.addEventListener('dragend', (e) => {
      const item = e.target.closest('.wdg-order-item')
      if (item) item.classList.remove('dragging')
    })

    listEl.addEventListener('dragover', (e) => {
      e.preventDefault()
      const dragging = listEl.querySelector('.dragging')
      if (!dragging) return
      const afterEl = getDragAfterElement(listEl, e.clientY)
      const firstInactive = listEl.querySelector('.wdg-inactive')
      if (afterEl) {
        listEl.insertBefore(dragging, afterEl)
      } else if (firstInactive) {
        listEl.insertBefore(dragging, firstInactive)
      } else {
        listEl.appendChild(dragging)
      }
    })

    listEl.addEventListener('drop', (e) => {
      e.preventDefault()
      const newOrder = [...listEl.querySelectorAll('.wdg-active')].map((el) => el.dataset.id)
      const cfg = structuredClone(getCfg())
      cfg.layout[side] = newOrder
      settingsState.setWidgets(cfg)
      // A settings row is a sibling <li>, not part of the dragged node, so the
      // drag handlers above never move it -- re-render from the persisted
      // order rather than patching the DOM in place.
      render()
    })
  }

  setupDnd(leftListEl, 'left')
  setupDnd(rightListEl, 'right')

  render()
}
