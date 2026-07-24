import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.mock is hoisted — use a mutable variable the factory closes over
let _mockConfig = {
  layout:   { left: ['test'], right: [] },
  settings: {},
}

vi.mock('../settings/state.js', () => ({
  settingsState: {
    getWidgets: vi.fn(() => _mockConfig),
    setWidgets: vi.fn(),
  },
}))

// Import after mock is registered
const { createWidgetPanel, mountRegion, mountMain, createQueryBus } = await import('./panelHost.js')

function makeMockDescriptor(id = 'test', overrides = {}) {
  return {
    id,
    label: 'Test Widget',
    icon: '<svg></svg>',
    placement: { region: 'left', order: 0 },
    settings: {},
    init: vi.fn(),
    ...overrides,
  }
}

const DEFAULT_CONFIG = {
  layout:   { left: ['test'], right: [] },
  settings: {},
}

beforeEach(() => {
  _mockConfig = structuredClone(DEFAULT_CONFIG)
  vi.clearAllMocks()
})

describe('createWidgetPanel — DOM structure', () => {
  it('creates a .widget-panel element with data-widget attribute', () => {
    const panel = createWidgetPanel(makeMockDescriptor('mywidget'), {})
    expect(panel.classList.contains('widget-panel')).toBe(true)
    expect(panel.dataset.widget).toBe('mywidget')
  })

  it('panel contains only a .widget-body — no header, icon, label, chevron, or badge', () => {
    const panel = createWidgetPanel(makeMockDescriptor(), {})
    expect(panel.children).toHaveLength(1)
    expect(panel.querySelector('.widget-body')).not.toBeNull()
    expect(panel.querySelector('.widget-panel-header')).toBeNull()
    expect(panel.querySelector('.widget-icon')).toBeNull()
    expect(panel.querySelector('.widget-label')).toBeNull()
    expect(panel.querySelector('.widget-chevron')).toBeNull()
    expect(panel.querySelector('.widget-badge')).toBeNull()
  })
})

describe('createWidgetPanel — scrolls', () => {
  it('adds the scrolls class when the descriptor declares scrolls: true', () => {
    const panel = createWidgetPanel(makeMockDescriptor('tall', { scrolls: true }), {})
    expect(panel.classList.contains('scrolls')).toBe(true)
  })

  it('adds no scrolls class when the descriptor omits it', () => {
    const panel = createWidgetPanel(makeMockDescriptor('flat'), {})
    expect(panel.classList.contains('scrolls')).toBe(false)
  })
})

describe('createWidgetPanel — init call', () => {
  it('calls descriptor.init with { container, ...deps } and no badge', () => {
    const desc = makeMockDescriptor()
    createWidgetPanel(desc, {}, { ntoast: null })
    expect(desc.init).toHaveBeenCalledOnce()
    const args = desc.init.mock.calls[0][0]
    expect(args.container).toBeInstanceOf(HTMLElement)
    expect(args.container.classList.contains('widget-body')).toBe(true)
    expect(args).not.toHaveProperty('badge')
  })

  it('passes extra deps through to init', () => {
    const desc = makeMockDescriptor()
    const getTabs = vi.fn()
    createWidgetPanel(desc, {}, { ntoast: 'toast', getTabs })
    const args = desc.init.mock.calls[0][0]
    expect(args.ntoast).toBe('toast')
    expect(args.getTabs).toBe(getTabs)
  })
})

describe('createQueryBus', () => {
  it('delivers an emitted payload to a subscribed handler', () => {
    const bus = createQueryBus()
    const fn = vi.fn()
    bus.on('query', fn)
    bus.emit('query', 'hello')
    expect(fn).toHaveBeenCalledWith('hello')
  })

  it('supports multiple handlers for the same event', () => {
    const bus = createQueryBus()
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    bus.on('nav', fn1)
    bus.on('nav', fn2)
    bus.emit('nav', 'down')
    expect(fn1).toHaveBeenCalledWith('down')
    expect(fn2).toHaveBeenCalledWith('down')
  })

  it('does not call handlers for a different event', () => {
    const bus = createQueryBus()
    const fn = vi.fn()
    bus.on('query', fn)
    bus.emit('activate')
    expect(fn).not.toHaveBeenCalled()
  })

  it('emitting with no subscribers does not throw', () => {
    const bus = createQueryBus()
    expect(() => bus.emit('selection', null)).not.toThrow()
  })

  it('unsubscribe stops the handler from firing', () => {
    const bus = createQueryBus()
    const fn = vi.fn()
    const unsubscribe = bus.on('query', fn)
    unsubscribe()
    bus.emit('query', 'x')
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('mountRegion', () => {
  it('appends one panel per widget in order', () => {
    const container = document.createElement('div')
    const widgetMap = {
      a: makeMockDescriptor('a'),
      b: makeMockDescriptor('b'),
    }
    mountRegion(container, ['a', 'b'], widgetMap)
    const panels = container.querySelectorAll('.widget-panel')
    expect(panels).toHaveLength(2)
    expect(panels[0].dataset.widget).toBe('a')
    expect(panels[1].dataset.widget).toBe('b')
  })

  it('skips widgets not in widgetMap', () => {
    const container = document.createElement('div')
    mountRegion(container, ['a', 'missing'], { a: makeMockDescriptor('a') })
    expect(container.querySelectorAll('.widget-panel')).toHaveLength(1)
  })

  it('skips widgets resolved as disabled', () => {
    _mockConfig = {
      layout:   { left: ['a', 'b'], right: [] },
      settings: { b: { enabled: false } },
    }
    const container = document.createElement('div')
    const widgetMap = {
      a: makeMockDescriptor('a'),
      b: makeMockDescriptor('b'),
    }
    mountRegion(container, ['a', 'b'], widgetMap)
    const panels = container.querySelectorAll('.widget-panel')
    expect(panels).toHaveLength(1)
    expect(panels[0].dataset.widget).toBe('a')
  })

  it('clears existing content before mounting', () => {
    const container = document.createElement('div')
    container.innerHTML = '<div class="stale">old</div>'
    mountRegion(container, [], { test: makeMockDescriptor('test') })
    expect(container.querySelector('.stale')).toBeNull()
  })

  it('never renders panel chrome for any mounted widget', () => {
    const container = document.createElement('div')
    mountRegion(container, ['test'], { test: makeMockDescriptor('test') })
    expect(container.querySelector('.widget-panel-header')).toBeNull()
    expect(container.querySelector('.widget-chevron')).toBeNull()
  })

  it('gives every widget in the same mount call the same bus instance', () => {
    const container = document.createElement('div')
    const a = makeMockDescriptor('a')
    const b = makeMockDescriptor('b')
    mountRegion(container, ['a', 'b'], { a, b })
    const busA = a.init.mock.calls[0][0].bus
    const busB = b.init.mock.calls[0][0].bus
    expect(busA).toBeDefined()
    expect(busA).toBe(busB)
  })
})

describe('mountMain', () => {
  it('mounts the header widget followed by the body widgets, in order', () => {
    const mainEl = document.createElement('div')
    const widgetMap = {
      search: makeMockDescriptor('search'),
      bookmarks: makeMockDescriptor('bookmarks'),
    }
    mountMain(mainEl, { header: 'search', body: ['bookmarks'] }, widgetMap)
    const panels = mainEl.querySelectorAll('.widget-panel')
    expect(panels).toHaveLength(2)
    expect(panels[0].dataset.widget).toBe('search')
    expect(panels[1].dataset.widget).toBe('bookmarks')
  })

  it('tags the header panel with main-header, not the body panels', () => {
    const mainEl = document.createElement('div')
    const widgetMap = {
      search: makeMockDescriptor('search'),
      bookmarks: makeMockDescriptor('bookmarks'),
    }
    mountMain(mainEl, { header: 'search', body: ['bookmarks'] }, widgetMap)
    const searchPanel = mainEl.querySelector('[data-widget="search"]')
    const bookmarksPanel = mainEl.querySelector('[data-widget="bookmarks"]')
    expect(searchPanel.classList.contains('main-header')).toBe(true)
    expect(bookmarksPanel.classList.contains('main-header')).toBe(false)
  })

  it('gives the header and body widgets the same bus instance', () => {
    const mainEl = document.createElement('div')
    const search = makeMockDescriptor('search')
    const bookmarks = makeMockDescriptor('bookmarks')
    mountMain(mainEl, { header: 'search', body: ['bookmarks'] }, { search, bookmarks })
    const searchBus = search.init.mock.calls[0][0].bus
    const bookmarksBus = bookmarks.init.mock.calls[0][0].bus
    expect(searchBus).toBeDefined()
    expect(searchBus).toBe(bookmarksBus)
  })

  it('tolerates a missing header', () => {
    const mainEl = document.createElement('div')
    mountMain(mainEl, { body: ['bookmarks'] }, { bookmarks: makeMockDescriptor('bookmarks') })
    const panels = mainEl.querySelectorAll('.widget-panel')
    expect(panels).toHaveLength(1)
    expect(panels[0].dataset.widget).toBe('bookmarks')
  })

  it('tolerates being called with no shape at all', () => {
    const mainEl = document.createElement('div')
    expect(() => mountMain(mainEl, undefined, {})).not.toThrow()
    expect(mainEl.querySelectorAll('.widget-panel')).toHaveLength(0)
  })

  it('skips widgets resolved as disabled', () => {
    _mockConfig = {
      layout:   { left: [], right: [] },
      settings: { bookmarks: { enabled: false } },
    }
    const mainEl = document.createElement('div')
    mountMain(mainEl, { header: 'search', body: ['bookmarks'] }, {
      search: makeMockDescriptor('search'),
      bookmarks: makeMockDescriptor('bookmarks'),
    })
    const panels = mainEl.querySelectorAll('.widget-panel')
    expect(panels).toHaveLength(1)
    expect(panels[0].dataset.widget).toBe('search')
  })

  describe('mobile-static header', () => {
    it('stays off by default (mobileSticky defaults true)', () => {
      const mainEl = document.createElement('div')
      mountMain(mainEl, { header: 'search', body: [] }, { search: makeMockDescriptor('search') })
      expect(mainEl.querySelector('[data-widget="search"]').classList.contains('mobile-static')).toBe(false)
    })

    it('is added when the header widget resolves mobileSticky: false', () => {
      _mockConfig = { layout: { left: [], right: [] }, settings: { search: { mobileSticky: false } } }
      const mainEl = document.createElement('div')
      mountMain(mainEl, { header: 'search', body: [] }, { search: makeMockDescriptor('search') })
      expect(mainEl.querySelector('[data-widget="search"]').classList.contains('mobile-static')).toBe(true)
    })
  })
})
