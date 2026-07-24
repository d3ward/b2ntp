import { settingsState } from '../settings/state.js'
import { resolveWidgetSettings } from './resolver.js'

// spec.md §3 describes this as "the per-page query bus," but it's actually
// scoped per mountRegion/mountMain call. A true page-wide singleton would
// accumulate stale listeners on every remount (settingsState.onChange fires
// mountRegion/mountMain again on any widgets-config change, and nothing in
// this widget model has an unmount hook to unsubscribe with). Search and
// bookmarks -- the only current consumers -- are always mounted together in
// the same mountMain call, so a fresh bus there is all the sharing the
// contract actually needs.
export function createQueryBus() {
  const handlers = {}
  return {
    emit(event, payload) {
      (handlers[event] || []).slice().forEach((fn) => fn(payload))
    },
    on(event, fn) {
      (handlers[event] ||= []).push(fn)
      return () => {
        handlers[event] = (handlers[event] || []).filter((h) => h !== fn)
      }
    },
  }
}

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
  if (!descriptor) return null
  const resolved = resolveWidgetSettings(descriptor, widgetsCfg)
  if (resolved.enabled === false) return null
  const panel = createWidgetPanel(descriptor, resolved, deps)
  containerEl.appendChild(panel)
  return panel
}

export function mountRegion(regionEl, ids, widgetMap, deps = {}) {
  regionEl.innerHTML = ''
  const widgetsCfg = settingsState.getWidgets()
  const bus = createQueryBus()
  for (const id of ids) {
    mountWidgetIfEnabled(regionEl, id, widgetMap, widgetsCfg, { ...deps, bus })
  }
}

export function mountMain(mainEl, { header, body } = {}, widgetMap, deps = {}) {
  mainEl.innerHTML = ''
  const widgetsCfg = settingsState.getWidgets()
  const mergedDeps = { ...deps, bus: createQueryBus() }

  if (header) {
    const panel = mountWidgetIfEnabled(mainEl, header, widgetMap, widgetsCfg, mergedDeps)
    if (panel) panel.classList.add('main-header')
  }
  for (const id of body || []) {
    mountWidgetIfEnabled(mainEl, id, widgetMap, widgetsCfg, mergedDeps)
  }
}
