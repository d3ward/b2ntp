import { settingsState } from '../settings/state.js'
import { resolveWidgetSettings } from './resolver.js'

const CHEVRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`

export function createWidgetPanel(descriptor, side, deps = {}) {
  const widgetsCfg = settingsState.getWidgets()
  const resolved = resolveWidgetSettings(descriptor, widgetsCfg)
  const isCollapsible = descriptor.id === 'tabs'

  const panel = document.createElement('div')
  panel.className = 'widget-panel'
  panel.dataset.widget = descriptor.id

  const badge = document.createElement('span')
  badge.className = 'widget-badge'
  badge.style.display = 'none'

  if (isCollapsible) {
    const header = document.createElement('div')
    header.className = 'widget-panel-header'

    const iconSpan = document.createElement('span')
    iconSpan.className = 'widget-icon'
    iconSpan.innerHTML = descriptor.icon
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
    panel.appendChild(header)
  }

  const body = document.createElement('div')
  body.className = 'widget-body'
  panel.appendChild(body)

  if (isCollapsible) {
    const panelCollapsed = resolved.collapsed || false
    if (panelCollapsed) {
      panel.classList.add('panel-collapsed')
      body.hidden = true
    }

    const chevron = panel.querySelector('.widget-chevron')
    chevron.addEventListener('click', () => {
      const isCollapsed = panel.classList.toggle('panel-collapsed')
      body.hidden = isCollapsed
      const cfg = structuredClone(settingsState.getWidgets())
      if (!cfg.settings[descriptor.id]) cfg.settings[descriptor.id] = {}
      cfg.settings[descriptor.id].collapsed = isCollapsed
      settingsState.setWidgets(cfg)
    })
  }

  descriptor.init({ container: body, badge, ...deps })

  return panel
}

export function mountSidebar(sideEl, side, widgetMap, deps = {}) {
  sideEl.innerHTML = ''
  const widgetsCfg = settingsState.getWidgets()
  const ids = widgetsCfg.layout[side] || []
  for (const widgetId of ids) {
    const descriptor = widgetMap[widgetId]
    if (!descriptor) continue
    const resolved = resolveWidgetSettings(descriptor, widgetsCfg)
    if (resolved.enabled === false) continue
    const panel = createWidgetPanel(descriptor, side, deps)
    sideEl.appendChild(panel)
  }
}
