import { WIDGETS } from '../widgets/registry.js'
import { settingsState } from './state.js'

const DRAG_HANDLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>`

export function initWidgetSettings() {
  const leftListEl = document.getElementById('wdg-order-left')
  const rightListEl = document.getElementById('wdg-order-right')

  if (!leftListEl || !rightListEl) return

  function getCfg() {
    return settingsState.getSidebarConfig()
  }

  function toggleWidget(widgetId, side, enabled) {
    const cfg = structuredClone(getCfg())
    const other = side === 'left' ? 'right' : 'left'
    if (enabled) {
      cfg[other].order = cfg[other].order.filter((id) => id !== widgetId)
      if (!cfg[side].order.includes(widgetId)) cfg[side].order.push(widgetId)
    } else {
      cfg[side].order = cfg[side].order.filter((id) => id !== widgetId)
    }
    settingsState.setSidebarConfig(cfg)
    render()
  }

  function renderColumn(listEl, side) {
    const cfg = getCfg()
    const activeOrder = cfg[side].order
    const allIds = Object.keys(WIDGETS)
    const inactiveIds = allIds.filter((id) => !activeOrder.includes(id))

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
    }

    activeOrder.forEach((id) => renderItem(id, true))
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
      cfg[side].order = newOrder
      settingsState.setSidebarConfig(cfg)
    })
  }

  setupDnd(leftListEl, 'left')
  setupDnd(rightListEl, 'right')

  render()
}
