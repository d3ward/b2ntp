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

// Flat regions (left/right, ...): append each missing widget to its own
// region array, in placement.order.
function mergeRailsIntoLayout(layout, railDescriptors) {
  const railRegions = Object.keys(layout).filter((region) => region !== 'main')
  const known = new Set(railRegions.flatMap((region) => layout[region]))
  const missing = railDescriptors
    .filter((d) => !known.has(d.id))
    .sort((a, b) => a.placement.order - b.placement.order)
  if (missing.length === 0) return null

  const next = {}
  for (const region of railRegions) next[region] = [...layout[region]]
  for (const descriptor of missing) {
    const region = descriptor.placement.region
    if (!next[region]) next[region] = []
    next[region].push(descriptor.id)
  }
  return next
}

// `main` is `{ header: <id|null>, body: [<id>, ...] }`, not a flat array like
// every other region. The first missing main-region widget (by
// placement.order) claims the header slot if it's empty; every other one
// lands in body. In practice that's just search (order 0) and bookmarks
// (order 1) -- search occupies main.header by default (spec.md §4).
// Returns null when there's nothing missing to seed -- including when the
// layout had no `main` key and the registry has no main-region widgets
// either, so the caller doesn't invent an empty one.
function mergeMainIntoLayout(layout, mainDescriptors) {
  const mainLayout = layout.main || { header: null, body: [] }
  const known = new Set([mainLayout.header, ...(mainLayout.body || [])].filter(Boolean))
  const missing = mainDescriptors
    .filter((d) => !known.has(d.id))
    .sort((a, b) => a.placement.order - b.placement.order)
  if (missing.length === 0) return null

  let header = mainLayout.header
  const body = [...(mainLayout.body || [])]
  for (const descriptor of missing) {
    if (!header) header = descriptor.id
    else body.push(descriptor.id)
  }
  return { header, body }
}

export function mergeRegistryIntoLayout(layout, registry) {
  const descriptors = Object.values(registry)
  const mainDescriptors = descriptors.filter((d) => d.placement.region === 'main')
  const railDescriptors = descriptors.filter((d) => d.placement.region !== 'main')

  const mergedRails = mergeRailsIntoLayout(layout, railDescriptors)
  const mergedMain = mergeMainIntoLayout(layout, mainDescriptors)

  if (mergedRails === null && mergedMain === null) return layout

  const next = mergedRails ?? { ...layout }
  if (mergedMain !== null) next.main = mergedMain
  return next
}

export function ensureWidgetsSeeded(registry) {
  const cfg = settingsState.getWidgets()
  const mergedLayout = mergeRegistryIntoLayout(cfg.layout, registry)
  if (mergedLayout !== cfg.layout) {
    settingsState.setWidgets({ ...cfg, layout: mergedLayout })
  }
}
