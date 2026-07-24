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

// Sparse-write a single setting: a value equal to the descriptor's own
// default is a no-op override, so it's deleted rather than stored; a widget
// left with no overrides at all drops its key entirely (spec.md §5/§6).
export function setWidgetSettingOverride(descriptor, widgetsConfig, key, value) {
  const schema = descriptor.settings || {}
  const defaultValue = schema[key] ? schema[key].default : undefined
  const settings = { ...(widgetsConfig.settings || {}) }
  const overrides = { ...(settings[descriptor.id] || {}) }

  if (value === defaultValue) {
    delete overrides[key]
  } else {
    overrides[key] = value
  }

  if (Object.keys(overrides).length === 0) {
    delete settings[descriptor.id]
  } else {
    settings[descriptor.id] = overrides
  }

  return { ...widgetsConfig, settings }
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
