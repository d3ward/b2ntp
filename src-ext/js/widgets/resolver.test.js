import { describe, it, expect, vi, beforeEach } from 'vitest'

let _mockConfig = { layout: { left: ['a'], right: [] }, settings: {} }

vi.mock('../settings/state.js', () => ({
  settingsState: {
    getWidgets: vi.fn(() => _mockConfig),
    setWidgets: vi.fn(),
  },
}))

const { settingsState } = await import('../settings/state.js')
const {
  resolveWidgetSettings,
  isWidgetEnabled,
  mergeRegistryIntoLayout,
  ensureWidgetsSeeded,
  setWidgetSettingOverride,
} = await import('./resolver.js')

function makeDescriptor(id, overrides = {}) {
  return { id, placement: { region: 'left', order: 0 }, settings: {}, ...overrides }
}

beforeEach(() => {
  _mockConfig = { layout: { left: ['a'], right: [] }, settings: {} }
  vi.clearAllMocks()
})

describe('resolveWidgetSettings', () => {
  it('returns schema defaults when there are no overrides', () => {
    const descriptor = makeDescriptor('clock', { settings: { showSeconds: { type: 'bool', default: false } } })
    const result = resolveWidgetSettings(descriptor, { settings: {} })
    expect(result).toEqual({ showSeconds: false })
  })

  it('sparse-merges stored overrides on top of defaults', () => {
    const descriptor = makeDescriptor('clock', { settings: { showSeconds: { type: 'bool', default: false } } })
    const result = resolveWidgetSettings(descriptor, { settings: { clock: { showSeconds: true } } })
    expect(result).toEqual({ showSeconds: true })
  })

  it('handles a descriptor with no settings schema', () => {
    const descriptor = makeDescriptor('tabs')
    const result = resolveWidgetSettings(descriptor, { settings: { tabs: { collapsed: true } } })
    expect(result).toEqual({ collapsed: true })
  })

  it('handles a widgetsConfig with no overrides for this widget', () => {
    const descriptor = makeDescriptor('qnote')
    const result = resolveWidgetSettings(descriptor, { settings: {} })
    expect(result).toEqual({})
  })
})

describe('isWidgetEnabled', () => {
  it('is true by default', () => {
    const descriptor = makeDescriptor('weather')
    expect(isWidgetEnabled(descriptor, { settings: {} })).toBe(true)
  })

  it('is false when the enabled override is false', () => {
    const descriptor = makeDescriptor('qnote')
    expect(isWidgetEnabled(descriptor, { settings: { qnote: { enabled: false } } })).toBe(false)
  })

  it('is true when the enabled override is explicitly true', () => {
    const descriptor = makeDescriptor('qnote')
    expect(isWidgetEnabled(descriptor, { settings: { qnote: { enabled: true } } })).toBe(true)
  })
})

describe('mergeRegistryIntoLayout', () => {
  it('returns the same layout reference when nothing is missing', () => {
    const layout = { left: ['tabs'], right: ['weather'] }
    const registry = { tabs: makeDescriptor('tabs'), weather: makeDescriptor('weather') }
    expect(mergeRegistryIntoLayout(layout, registry)).toBe(layout)
  })

  it('appends a missing widget to its placement region', () => {
    const layout = { left: ['tabs'], right: ['weather'] }
    const registry = {
      tabs: makeDescriptor('tabs'),
      weather: makeDescriptor('weather'),
      qnote: makeDescriptor('qnote', { placement: { region: 'right', order: 1 } }),
    }
    const result = mergeRegistryIntoLayout(layout, registry)
    expect(result.right).toEqual(['weather', 'qnote'])
    expect(result.left).toEqual(['tabs'])
  })

  it('does not mutate the original layout', () => {
    const layout = { left: ['tabs'], right: ['weather'] }
    const registry = {
      tabs: makeDescriptor('tabs'),
      weather: makeDescriptor('weather'),
      qnote: makeDescriptor('qnote', { placement: { region: 'right', order: 1 } }),
    }
    mergeRegistryIntoLayout(layout, registry)
    expect(layout.right).toEqual(['weather'])
  })

  it('creates a region array when the layout has none for that region yet', () => {
    const layout = { left: ['tabs'] }
    const registry = { tabs: makeDescriptor('tabs'), weather: makeDescriptor('weather', { placement: { region: 'right', order: 0 } }) }
    const result = mergeRegistryIntoLayout(layout, registry)
    expect(result.right).toEqual(['weather'])
  })

  it('seeds an empty layout in placement.order sequence, per region', () => {
    const layout = { left: [], right: [] }
    const registry = {
      tabs: makeDescriptor('tabs', { placement: { region: 'left', order: 0 } }),
      clock: makeDescriptor('clock', { placement: { region: 'left', order: 1 } }),
      weather: makeDescriptor('weather', { placement: { region: 'right', order: 0 } }),
      qnote: makeDescriptor('qnote', { placement: { region: 'right', order: 1 } }),
    }
    const result = mergeRegistryIntoLayout(layout, registry)
    expect(result).toEqual({ left: ['tabs', 'clock'], right: ['weather', 'qnote'] })
  })

  it('orders multiple newly-appended widgets by placement.order without disturbing existing entries', () => {
    const layout = { left: ['tabs'], right: [] }
    const registry = {
      tabs: makeDescriptor('tabs', { placement: { region: 'left', order: 0 } }),
      qnote: makeDescriptor('qnote', { placement: { region: 'right', order: 1 } }),
      weather: makeDescriptor('weather', { placement: { region: 'right', order: 0 } }),
    }
    const result = mergeRegistryIntoLayout(layout, registry)
    expect(result.left).toEqual(['tabs'])
    expect(result.right).toEqual(['weather', 'qnote'])
  })
})

describe('mergeRegistryIntoLayout — main region', () => {
  function mainDescriptor(id, order) {
    return makeDescriptor(id, { placement: { region: 'main', order } })
  }

  it('seeds an empty main from scratch: lowest order becomes header, the rest body', () => {
    const layout = { left: [], right: [] }
    const registry = { search: mainDescriptor('search', 0), bookmarks: mainDescriptor('bookmarks', 1) }
    const result = mergeRegistryIntoLayout(layout, registry)
    expect(result.main).toEqual({ header: 'search', body: ['bookmarks'] })
  })

  it('does not add a main key when the registry has no main-region widgets', () => {
    const layout = { left: [], right: [] }
    const registry = { tabs: makeDescriptor('tabs') }
    const result = mergeRegistryIntoLayout(layout, registry)
    expect(result).not.toHaveProperty('main')
  })

  it('returns the same reference when main is already fully seeded', () => {
    const layout = { left: [], right: [], main: { header: 'search', body: ['bookmarks'] } }
    const registry = { search: mainDescriptor('search', 0), bookmarks: mainDescriptor('bookmarks', 1) }
    expect(mergeRegistryIntoLayout(layout, registry)).toBe(layout)
  })

  it('appends a newly-registered main widget to body when a header already exists', () => {
    const layout = { left: [], right: [], main: { header: 'search', body: [] } }
    const registry = {
      search: mainDescriptor('search', 0),
      bookmarks: mainDescriptor('bookmarks', 1),
    }
    const result = mergeRegistryIntoLayout(layout, registry)
    expect(result.main).toEqual({ header: 'search', body: ['bookmarks'] })
  })

  it('fills an empty header slot from a missing widget even if body already has entries', () => {
    const layout = { left: [], right: [], main: { header: null, body: ['bookmarks'] } }
    const registry = {
      search: mainDescriptor('search', 0),
      bookmarks: mainDescriptor('bookmarks', 1),
    }
    const result = mergeRegistryIntoLayout(layout, registry)
    expect(result.main).toEqual({ header: 'search', body: ['bookmarks'] })
  })

  it('does not mutate the original layout.main', () => {
    const layout = { left: [], right: [], main: { header: null, body: [] } }
    const registry = { search: mainDescriptor('search', 0) }
    mergeRegistryIntoLayout(layout, registry)
    expect(layout.main).toEqual({ header: null, body: [] })
  })

  it('merges rail and main widgets independently in the same call', () => {
    const layout = { left: [], right: [] }
    const registry = {
      tabs: makeDescriptor('tabs', { placement: { region: 'left', order: 0 } }),
      search: mainDescriptor('search', 0),
      bookmarks: mainDescriptor('bookmarks', 1),
    }
    const result = mergeRegistryIntoLayout(layout, registry)
    expect(result.left).toEqual(['tabs'])
    expect(result.main).toEqual({ header: 'search', body: ['bookmarks'] })
  })
})

describe('ensureWidgetsSeeded', () => {
  it('does not write when every registry widget is already in layout', () => {
    _mockConfig = { layout: { left: ['a'], right: [] }, settings: {} }
    ensureWidgetsSeeded({ a: makeDescriptor('a') })
    expect(settingsState.setWidgets).not.toHaveBeenCalled()
  })

  it('persists a merged layout when a registry widget is missing', () => {
    _mockConfig = { layout: { left: [], right: [] }, settings: {} }
    ensureWidgetsSeeded({ a: makeDescriptor('a', { placement: { region: 'left', order: 0 } }) })
    expect(settingsState.setWidgets).toHaveBeenCalledWith({
      layout: { left: ['a'], right: [] },
      settings: {},
    })
  })
})

describe('setWidgetSettingOverride', () => {
  const descriptor = makeDescriptor('clock', {
    settings: { showSeconds: { type: 'bool', default: false } },
  })

  it('stores a value that differs from the descriptor default', () => {
    const cfg = { layout: { left: [], right: [] }, settings: {} }
    const result = setWidgetSettingOverride(descriptor, cfg, 'showSeconds', true)
    expect(result.settings.clock).toEqual({ showSeconds: true })
  })

  it('deletes the key when the value equals the descriptor default', () => {
    const cfg = { layout: { left: [], right: [] }, settings: { clock: { showSeconds: true } } }
    const result = setWidgetSettingOverride(descriptor, cfg, 'showSeconds', false)
    expect(result.settings.clock).toBeUndefined()
  })

  it('drops the widget key entirely once its last override is removed', () => {
    const cfg = { layout: { left: [], right: [] }, settings: { clock: { showSeconds: true } } }
    const result = setWidgetSettingOverride(descriptor, cfg, 'showSeconds', false)
    expect(Object.prototype.hasOwnProperty.call(result.settings, 'clock')).toBe(false)
  })

  it('preserves a sibling override on the same widget when only one key changes', () => {
    const multiField = makeDescriptor('clock', {
      settings: {
        showSeconds: { type: 'bool', default: false },
        timeFormat: { type: 'select', default: '24' },
      },
    })
    const cfg = { layout: { left: [], right: [] }, settings: { clock: { timeFormat: '12' } } }
    const result = setWidgetSettingOverride(multiField, cfg, 'showSeconds', true)
    expect(result.settings.clock).toEqual({ timeFormat: '12', showSeconds: true })
  })

  it('does not mutate the original widgetsConfig', () => {
    const cfg = { layout: { left: [], right: [] }, settings: { clock: { showSeconds: false } } }
    setWidgetSettingOverride(descriptor, cfg, 'showSeconds', true)
    expect(cfg.settings.clock).toEqual({ showSeconds: false })
  })

  it('treats a key with no schema entry as always an override (no default to compare against)', () => {
    const cfg = { layout: { left: [], right: [] }, settings: {} }
    const result = setWidgetSettingOverride(descriptor, cfg, 'enabled', false)
    expect(result.settings.clock).toEqual({ enabled: false })
  })
})
