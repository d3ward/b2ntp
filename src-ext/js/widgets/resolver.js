import { settingsState } from '../settings/state.js'

export function resolveWidgetSettings(descriptor, widgetsConfig) {
  const schema = descriptor.settings || {}
  const defaults = {}
  for (const [key, field] of Object.entries(schema)) {
    defaults[key] = field.default
  }
  const overrides = (widgetsConfig.settings && widgetsConfig.settings[descriptor.id]) || {}
  return { ...defaults, ...overrides }
}

export function isWidgetEnabled(descriptor, widgetsConfig) {
  return resolveWidgetSettings(descriptor, widgetsConfig).enabled !== false
}

export function mergeRegistryIntoLayout(layout, registry) {
  const known = new Set(Object.values(layout).flat())
  const missing = Object.values(registry)
    .filter((descriptor) => !known.has(descriptor.id))
    .sort((a, b) => a.placement.order - b.placement.order)
  if (missing.length === 0) return layout

  const next = {}
  for (const [region, ids] of Object.entries(layout)) next[region] = [...ids]
  for (const descriptor of missing) {
    const region = descriptor.placement.region
    if (!next[region]) next[region] = []
    next[region].push(descriptor.id)
  }
  return next
}

export function ensureWidgetsSeeded(registry) {
  const cfg = settingsState.getWidgets()
  const mergedLayout = mergeRegistryIntoLayout(cfg.layout, registry)
  if (mergedLayout !== cfg.layout) {
    settingsState.setWidgets({ ...cfg, layout: mergedLayout })
  }
}
