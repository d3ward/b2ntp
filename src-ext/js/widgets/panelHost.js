import { settingsState } from '../settings/state.js'
import { resolveWidgetSettings } from './resolver.js'

// resolvedSettings isn't consumed here yet -- no widget-level chrome decision
// depends on it now that collapse is gone -- but the mount shape carries it
// through so a later ticket (e.g. a `scrolls`-driven chrome choice) doesn't
// need to re-thread it through every caller.
export function createWidgetPanel(descriptor, resolvedSettings, deps = {}) {
  const panel = document.createElement('div')
  panel.className = 'widget-panel'
  panel.dataset.widget = descriptor.id

  const body = document.createElement('div')
  body.className = 'widget-body'
  panel.appendChild(body)

  descriptor.init({ container: body, ...deps })

  return panel
}

function mountWidgetIfEnabled(containerEl, id, widgetMap, widgetsCfg, deps) {
  const descriptor = widgetMap[id]
  if (!descriptor) return
  const resolved = resolveWidgetSettings(descriptor, widgetsCfg)
  if (resolved.enabled === false) return
  containerEl.appendChild(createWidgetPanel(descriptor, resolved, deps))
}

export function mountRegion(regionEl, ids, widgetMap, deps = {}) {
  regionEl.innerHTML = ''
  const widgetsCfg = settingsState.getWidgets()
  for (const id of ids) {
    mountWidgetIfEnabled(regionEl, id, widgetMap, widgetsCfg, deps)
  }
}

export function mountMain(mainEl, { header, body } = {}, widgetMap, deps = {}) {
  mainEl.innerHTML = ''
  const widgetsCfg = settingsState.getWidgets()

  if (header) mountWidgetIfEnabled(mainEl, header, widgetMap, widgetsCfg, deps)
  for (const id of body || []) {
    mountWidgetIfEnabled(mainEl, id, widgetMap, widgetsCfg, deps)
  }
}
