import { settingsState } from '../settings/state.js'

const CHEVRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`

export function createWidgetPanel(descriptor, side, deps = {}) {
  const sideConfig = settingsState.getSidebarConfig()[side]

  const panel = document.createElement('div')
  panel.className = 'widget-panel'
  panel.dataset.widget = descriptor.id

  const header = document.createElement('div')
  header.className = 'widget-panel-header'

  const iconSpan = document.createElement('span')
  iconSpan.className = 'widget-icon'
  iconSpan.innerHTML = descriptor.icon

  const badge = document.createElement('span')
  badge.className = 'widget-badge'
  badge.style.display = 'none'
  iconSpan.appendChild(badge)

  const labelSpan = document.createElement('span')
  labelSpan.className = 'widget-label'
  labelSpan.textContent = descriptor.label

  const chevron = document.createElement('button')
  chevron.className = 'widget-chevron'
  chevron.setAttribute('aria-label', `Collapse ${descriptor.label} panel`)
  chevron.innerHTML = CHEVRON_SVG

  header.appendChild(iconSpan)
  header.appendChild(labelSpan)
  header.appendChild(chevron)

  const body = document.createElement('div')
  body.className = 'widget-body'

  panel.appendChild(header)
  panel.appendChild(body)

  const panelCollapsed = sideConfig.panels?.[descriptor.id]?.collapsed || false
  if (panelCollapsed) {
    panel.classList.add('panel-collapsed')
    body.hidden = true
  }

  chevron.addEventListener('click', () => {
    const isCollapsed = panel.classList.toggle('panel-collapsed')
    body.hidden = isCollapsed
    const cfg = settingsState.getSidebarConfig()
    if (!cfg[side].panels[descriptor.id]) cfg[side].panels[descriptor.id] = {}
    cfg[side].panels[descriptor.id].collapsed = isCollapsed
    settingsState.setSidebarConfig(cfg)
  })

  descriptor.init({ container: body, badge, ...deps })

  return panel
}

export function mountSidebar(sideEl, side, widgetMap, deps = {}) {
  const sideConfig = settingsState.getSidebarConfig()[side]
  sideEl.innerHTML = ''
  for (const widgetId of sideConfig.order) {
    const descriptor = widgetMap[widgetId]
    if (!descriptor) continue
    const panel = createWidgetPanel(descriptor, side, deps)
    sideEl.appendChild(panel)
  }
}
