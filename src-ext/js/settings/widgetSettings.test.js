import { describe, it, expect, vi, beforeEach } from 'vitest'

let _mockConfig = { layout: { left: ['tabs'], right: ['weather'] }, settings: {} }

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
const { initWidgetSettings } = await import('./widgetSettings.js')

beforeEach(() => {
  _mockConfig = { layout: { left: ['tabs'], right: ['weather'] }, settings: {} }
  vi.clearAllMocks()
  document.body.innerHTML = `
    <ul id="wdg-order-left"></ul>
    <ul id="wdg-order-right"></ul>
  `
})

describe('initWidgetSettings — schema form rendering', () => {
  it('renders a settings row for an active widget with a non-empty schema', () => {
    initWidgetSettings()
    const rightList = document.getElementById('wdg-order-right')
    expect(rightList.querySelector('.wdg-settings-row')).not.toBeNull()
    expect(rightList.querySelector('select')).not.toBeNull()
  })

  it('does not render a settings row for an active widget with an empty schema', () => {
    initWidgetSettings()
    const leftList = document.getElementById('wdg-order-left')
    expect(leftList.querySelector('.wdg-settings-row')).toBeNull()
  })

  it('does not render a settings row for an inactive widget even if it has a schema', () => {
    _mockConfig = { layout: { left: ['tabs'], right: [] }, settings: {} }
    initWidgetSettings()
    const rightList = document.getElementById('wdg-order-right')
    expect(rightList.querySelector('.wdg-settings-row')).toBeNull()
  })

  it('the rendered control reflects the resolved (overridden) value', () => {
    _mockConfig = { layout: { left: ['tabs'], right: ['weather'] }, settings: { weather: { units: 'F' } } }
    initWidgetSettings()
    const select = document.getElementById('wdg-order-right').querySelector('select')
    expect(select.value).toBe('F')
  })

  it('changing the control writes a sparse override via setWidgets', () => {
    initWidgetSettings()
    const select = document.getElementById('wdg-order-right').querySelector('select')
    select.value = 'F'
    select.dispatchEvent(new Event('change'))
    expect(settingsState.setWidgets).toHaveBeenCalledWith({
      layout: { left: ['tabs'], right: ['weather'] },
      settings: { weather: { units: 'F' } },
    })
  })

  it('setting the control back to its default deletes the override', () => {
    _mockConfig = { layout: { left: ['tabs'], right: ['weather'] }, settings: { weather: { units: 'F' } } }
    initWidgetSettings()
    const select = document.getElementById('wdg-order-right').querySelector('select')
    select.value = 'C'
    select.dispatchEvent(new Event('change'))
    expect(settingsState.setWidgets).toHaveBeenCalledWith({
      layout: { left: ['tabs'], right: ['weather'] },
      settings: {},
    })
  })
})

describe('initWidgetSettings — CORE widgets', () => {
  it('never lists search or bookmarks in the left/right arrangement lists', () => {
    initWidgetSettings()
    expect(document.querySelector('[data-id="search"]')).toBeNull()
    expect(document.querySelector('[data-id="bookmarks"]')).toBeNull()
  })

  it('still lists every non-CORE widget', () => {
    initWidgetSettings()
    expect(document.querySelector('#wdg-order-left [data-id="tabs"]')).not.toBeNull()
    expect(document.querySelector('#wdg-order-right [data-id="weather"]')).not.toBeNull()
    expect(document.querySelector('#wdg-order-right [data-id="qnote"]')).not.toBeNull()
  })
})

describe('initWidgetSettings — reorder via drag/drop', () => {
  it('keeps the settings row attached to its widget after a reorder', () => {
    _mockConfig = { layout: { left: ['tabs'], right: ['weather', 'qnote'] }, settings: {} }
    initWidgetSettings()
    const rightList = document.getElementById('wdg-order-right')

    // Simulate what the dragover handler would have left behind: qnote's
    // <li> physically moved ahead of weather's in the DOM, mid-drag.
    const qnoteItem = rightList.querySelector('[data-id="qnote"]')
    const weatherItem = rightList.querySelector('[data-id="weather"]')
    rightList.insertBefore(qnoteItem, weatherItem)

    rightList.dispatchEvent(new Event('drop', { cancelable: true }))

    expect(settingsState.setWidgets).toHaveBeenCalledWith(
      expect.objectContaining({ layout: expect.objectContaining({ right: ['qnote', 'weather'] }) })
    )

    // Re-rendered from the persisted order: weather's settings row must
    // immediately follow weather's own row, not be left behind at its
    // pre-drag DOM position.
    const items = [...document.getElementById('wdg-order-right').children]
    const weatherIndex = items.findIndex((el) => el.dataset.id === 'weather')
    expect(items[weatherIndex + 1]?.classList.contains('wdg-settings-row')).toBe(true)
  })
})
