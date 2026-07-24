import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('sortablejs', () => ({
  default: vi.fn(function Sortable(el, options) {
    // Real SortableJS wires native drag events; tests instead call
    // `_sortableInstances.get(el).options.onEnd()` directly to simulate a
    // completed drag after moving nodes around in the DOM by hand.
    this.el = el
    this.options = options
    _sortableInstances.set(el, this)
  }),
}))

let _sortableInstances

let _mockConfig = {
  layout: { left: ['tabs'], main: { header: 'search', body: ['bookmarks'] }, right: ['weather'] },
  settings: {},
}

vi.mock('../widgets/registry.js', () => ({
  WIDGETS: {
    tabs: { id: 'tabs', label: 'Tabs', icon: '<svg></svg>', settings: {} },
    weather: {
      id: 'weather',
      label: 'Weather',
      icon: '<svg></svg>',
      settings: { units: { type: 'select', default: 'C', options: [['C', 'C'], ['F', 'F']] } },
    },
    qnote: { id: 'qnote', label: 'Quick Note', icon: '<svg></svg>', settings: {} },
    search: { id: 'search', label: 'Search', icon: '<svg></svg>', settings: {} },
    bookmarks: { id: 'bookmarks', label: 'Bookmarks', icon: '<svg></svg>', settings: {} },
  },
  CORE_WIDGET_IDS: new Set(['search', 'bookmarks']),
}))

vi.mock('./state.js', () => ({
  settingsState: {
    getWidgets: vi.fn(() => _mockConfig),
    setWidgets: vi.fn((cfg) => { _mockConfig = cfg }),
  },
}))

const { settingsState } = await import('./state.js')
const { initWidgetSettings, initWidgetDetailSettings } = await import('./widgetSettings.js')

function ids(listEl) {
  return [...listEl.querySelectorAll(':scope > .wdg-order-item')].map((el) => el.dataset.id)
}

beforeEach(() => {
  _sortableInstances = new Map()
  _mockConfig = {
    layout: { left: ['tabs'], main: { header: 'search', body: ['bookmarks'] }, right: ['weather'] },
    settings: {},
  }
  vi.clearAllMocks()
  document.body.innerHTML = `
    <ul id="wdg-order-left"></ul>
    <ul id="wdg-order-main-header"></ul>
    <ul id="wdg-order-main-body"></ul>
    <ul id="wdg-order-right"></ul>
  `
})

describe('initWidgetSettings — three-region rendering', () => {
  it('renders each region from layout', () => {
    initWidgetSettings()
    expect(ids(document.getElementById('wdg-order-left'))).toEqual(['tabs'])
    expect(ids(document.getElementById('wdg-order-right'))).toEqual(['weather'])
    expect(ids(document.getElementById('wdg-order-main-header'))).toEqual(['search'])
    expect(ids(document.getElementById('wdg-order-main-body'))).toEqual(['bookmarks'])
  })

  it('keeps a disabled widget in its region, just dimmed', () => {
    _mockConfig.settings.weather = { enabled: false }
    initWidgetSettings()
    const item = document.querySelector('#wdg-order-right [data-id="weather"]')
    expect(item.classList.contains('wdg-inactive')).toBe(true)
    expect(ids(document.getElementById('wdg-order-right'))).toEqual(['weather'])
  })
})

describe('initWidgetSettings — CORE widgets', () => {
  it('gives search and bookmarks no toggle', () => {
    initWidgetSettings()
    expect(document.querySelector('[data-id="search"] .wdg-toggle')).toBeNull()
    expect(document.querySelector('[data-id="bookmarks"] .wdg-toggle')).toBeNull()
  })

  it('gives every non-CORE widget a toggle', () => {
    initWidgetSettings()
    expect(document.querySelector('[data-id="tabs"] .wdg-toggle')).not.toBeNull()
    expect(document.querySelector('[data-id="weather"] .wdg-toggle')).not.toBeNull()
  })

  it('renders no drag handle for CORE widgets', () => {
    initWidgetSettings()
    expect(document.querySelector('[data-id="search"] .wdg-drag-handle')).toBeNull()
    expect(document.querySelector('[data-id="bookmarks"] .wdg-drag-handle')).toBeNull()
    expect(document.querySelector('[data-id="search"] .wdg-drag-handle-spacer')).not.toBeNull()
  })

  it('never initializes a Sortable instance on the main-header list', () => {
    initWidgetSettings()
    expect(_sortableInstances.has(document.getElementById('wdg-order-main-header'))).toBe(false)
  })

  it('initializes Sortable on left, right and main-body, sharing one group', () => {
    initWidgetSettings()
    const left = _sortableInstances.get(document.getElementById('wdg-order-left'))
    const right = _sortableInstances.get(document.getElementById('wdg-order-right'))
    const body = _sortableInstances.get(document.getElementById('wdg-order-main-body'))
    expect(left.options.group).toBe(right.options.group)
    expect(left.options.group).toBe(body.options.group)
  })
})

describe('initWidgetSettings — toggle writes visibility only', () => {
  it('changing the toggle sets settings[id].enabled without touching layout', () => {
    initWidgetSettings()
    const toggle = document.querySelector('[data-id="weather"] .wdg-toggle')
    toggle.checked = false
    toggle.dispatchEvent(new Event('change'))
    expect(settingsState.setWidgets).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: _mockConfig.layout,
        settings: expect.objectContaining({ weather: { enabled: false } }),
      })
    )
  })

  it('re-enabling deletes the override', () => {
    _mockConfig.settings.weather = { enabled: false }
    initWidgetSettings()
    const toggle = document.querySelector('[data-id="weather"] .wdg-toggle')
    toggle.checked = true
    toggle.dispatchEvent(new Event('change'))
    expect(settingsState.setWidgets).toHaveBeenCalledWith(
      expect.objectContaining({ settings: {} })
    )
  })
})

describe('initWidgetSettings — drag reorder / cross-region move', () => {
  it('reorders within a region and persists via onEnd', () => {
    _mockConfig.layout.right = ['weather', 'qnote']
    initWidgetSettings()
    const rightList = document.getElementById('wdg-order-right')
    const qnoteItem = rightList.querySelector('[data-id="qnote"]')
    const weatherItem = rightList.querySelector('[data-id="weather"]')
    rightList.insertBefore(qnoteItem, weatherItem)

    _sortableInstances.get(rightList).options.onEnd()

    expect(settingsState.setWidgets).toHaveBeenCalledWith(
      expect.objectContaining({ layout: expect.objectContaining({ right: ['qnote', 'weather'] }) })
    )
  })

  it('moves a widget from one rail to the other', () => {
    initWidgetSettings()
    const leftList = document.getElementById('wdg-order-left')
    const rightList = document.getElementById('wdg-order-right')
    leftList.appendChild(rightList.querySelector('[data-id="weather"]'))

    _sortableInstances.get(leftList).options.onEnd()

    expect(settingsState.setWidgets).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: expect.objectContaining({ left: ['tabs', 'weather'], right: [] }),
      })
    )
  })

  it('moves a non-CORE widget into main.body and keeps CORE header/body intact', () => {
    initWidgetSettings()
    const rightList = document.getElementById('wdg-order-right')
    const mainBodyList = document.getElementById('wdg-order-main-body')
    mainBodyList.appendChild(rightList.querySelector('[data-id="weather"]'))

    _sortableInstances.get(mainBodyList).options.onEnd()

    expect(settingsState.setWidgets).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: expect.objectContaining({
          main: { header: 'search', body: ['bookmarks', 'weather'] },
        }),
      })
    )
  })

})

describe('initWidgetDetailSettings', () => {
  beforeEach(() => {
    document.body.innerHTML += '<div id="wdg-settings-weather"></div><div id="wdg-settings-tabs"></div>'
  })

  it('renders the widget schema form with the resolved value', () => {
    _mockConfig.settings.weather = { units: 'F' }
    initWidgetDetailSettings('wdg-settings-weather', 'weather')
    const select = document.querySelector('#wdg-settings-weather select')
    expect(select).not.toBeNull()
    expect(select.value).toBe('F')
  })

  it('writes a change via setWidgets', () => {
    initWidgetDetailSettings('wdg-settings-weather', 'weather')
    const select = document.querySelector('#wdg-settings-weather select')
    select.value = 'F'
    select.dispatchEvent(new Event('change'))
    expect(settingsState.setWidgets).toHaveBeenCalledWith(
      expect.objectContaining({ settings: { weather: { units: 'F' } } })
    )
  })

  it('shows an empty-state message for a widget with no schema', () => {
    initWidgetDetailSettings('wdg-settings-tabs', 'tabs')
    const host = document.getElementById('wdg-settings-tabs')
    expect(host.querySelector('select, input')).toBeNull()
    expect(host.textContent).toMatch(/no settings/i)
  })

  it('does nothing for an unknown widget id', () => {
    expect(() => initWidgetDetailSettings('wdg-settings-weather', 'nope')).not.toThrow()
    expect(document.getElementById('wdg-settings-weather').innerHTML).toBe('')
  })

  it('does nothing when the container is missing', () => {
    expect(() => initWidgetDetailSettings('does-not-exist', 'weather')).not.toThrow()
  })
})
