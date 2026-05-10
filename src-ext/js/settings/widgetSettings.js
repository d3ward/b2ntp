import { WIDGETS } from '../widgets/registry.js'
import { settingsState } from './state.js'

export function initWidgetSettings() {
  const cardsEl = document.getElementById('widget-cards')
  if (!cardsEl) return

  const leftListEl = document.getElementById('wdg-order-left')
  const rightListEl = document.getElementById('wdg-order-right')
  const leftCollapsedEl = document.getElementById('left-collapsed')
  const rightCollapsedEl = document.getElementById('right-collapsed')

  function getCfg() {
    return settingsState.getSidebarConfig()
  }

  function currentSide(widgetId) {
    const cfg = getCfg()
    if (cfg.left.order.includes(widgetId)) return 'left'
    if (cfg.right.order.includes(widgetId)) return 'right'
    return 'hidden'
  }

  function setWidgetSide(widgetId, newSide) {
    const cfg = structuredClone(getCfg())
    cfg.left.order = cfg.left.order.filter((id) => id !== widgetId)
    cfg.right.order = cfg.right.order.filter((id) => id !== widgetId)
    if (newSide === 'left') cfg.left.order.push(widgetId)
    else if (newSide === 'right') cfg.right.order.push(widgetId)
    settingsState.setSidebarConfig(cfg)
    renderOrderLists()
  }

  // --- Widget cards ---
  for (const [id, descriptor] of Object.entries(WIDGETS)) {
    const card = document.createElement('div')
    card.className = 'widget-settings-card'
    card.dataset.widgetId = id

    const iconSpan = document.createElement('span')
    iconSpan.className = 'widget-settings-icon'
    iconSpan.innerHTML = descriptor.icon

    const labelSpan = document.createElement('span')
    labelSpan.className = 'widget-settings-label'
    labelSpan.textContent = descriptor.label

    const sideDiv = document.createElement('div')
    sideDiv.className = 'widget-settings-side'

    const side = currentSide(id)
    for (const value of ['left', 'right', 'hidden']) {
      const lbl = document.createElement('label')
      const radio = document.createElement('input')
      radio.type = 'radio'
      radio.name = `wdg-${id}`
      radio.value = value
      radio.checked = side === value
      radio.addEventListener('change', () => {
        if (radio.checked) setWidgetSide(id, value)
      })
      lbl.appendChild(radio)
      lbl.appendChild(document.createTextNode(' ' + value.charAt(0).toUpperCase() + value.slice(1)))
      sideDiv.appendChild(lbl)
    }

    card.appendChild(iconSpan)
    card.appendChild(labelSpan)
    card.appendChild(sideDiv)
    cardsEl.appendChild(card)
  }

  // --- Order lists with drag-to-reorder ---
  function renderOrderList(listEl, side) {
    listEl.innerHTML = ''
    const order = getCfg()[side].order
    for (const id of order) {
      const descriptor = WIDGETS[id]
      if (!descriptor) continue
      const item = document.createElement('li')
      item.className = 'wdg-order-item'
      item.draggable = true
      item.dataset.id = id

      const handle = document.createElement('span')
      handle.className = 'wdg-drag-handle'
      handle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>`

      const iconSpan = document.createElement('span')
      iconSpan.innerHTML = descriptor.icon

      const nameSpan = document.createElement('span')
      nameSpan.textContent = descriptor.label

      item.appendChild(handle)
      item.appendChild(iconSpan)
      item.appendChild(nameSpan)
      listEl.appendChild(item)
    }
  }

  function renderOrderLists() {
    renderOrderList(leftListEl, 'left')
    renderOrderList(rightListEl, 'right')
    // Sync radio buttons to current config
    const cfg = getCfg()
    for (const id of Object.keys(WIDGETS)) {
      const side = cfg.left.order.includes(id) ? 'left'
        : cfg.right.order.includes(id) ? 'right'
        : 'hidden'
      const radio = cardsEl.querySelector(`input[name="wdg-${id}"][value="${side}"]`)
      if (radio) radio.checked = true
    }
  }

  function getDragAfterElement(listEl, y) {
    const items = [...listEl.querySelectorAll('.wdg-order-item:not(.dragging)')]
    return items.reduce((closest, child) => {
      const box = child.getBoundingClientRect()
      const offset = y - box.top - box.height / 2
      if (offset < 0 && offset > closest.offset) return { offset, element: child }
      return closest
    }, { offset: Number.NEGATIVE_INFINITY }).element
  }

  function setupDnd(listEl, side) {
    listEl.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.wdg-order-item')
      if (!item) return
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', item.dataset.id)
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
      if (afterEl) listEl.insertBefore(dragging, afterEl)
      else listEl.appendChild(dragging)
    })

    listEl.addEventListener('drop', (e) => {
      e.preventDefault()
      const newOrder = [...listEl.querySelectorAll('.wdg-order-item')].map((el) => el.dataset.id)
      const cfg = structuredClone(getCfg())
      cfg[side].order = newOrder
      settingsState.setSidebarConfig(cfg)
    })
  }

  setupDnd(leftListEl, 'left')
  setupDnd(rightListEl, 'right')

  // --- Collapse toggles ---
  if (leftCollapsedEl) {
    leftCollapsedEl.checked = getCfg().left.collapsed
    leftCollapsedEl.addEventListener('change', () => {
      const cfg = structuredClone(getCfg())
      cfg.left.collapsed = leftCollapsedEl.checked
      settingsState.setSidebarConfig(cfg)
    })
  }

  if (rightCollapsedEl) {
    rightCollapsedEl.checked = getCfg().right.collapsed
    rightCollapsedEl.addEventListener('change', () => {
      const cfg = structuredClone(getCfg())
      cfg.right.collapsed = rightCollapsedEl.checked
      settingsState.setSidebarConfig(cfg)
    })
  }

  renderOrderLists()
}
