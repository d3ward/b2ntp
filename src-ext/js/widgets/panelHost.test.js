import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.mock is hoisted — use a mutable variable the factory closes over
let _mockConfig = {
  left:  { enabled: true, collapsed: false, order: ['test'],  panels: {} },
  right: { enabled: true, collapsed: false, order: [],        panels: {} },
}

vi.mock('../settings/state.js', () => ({
  settingsState: {
    getSidebarConfig: vi.fn(() => _mockConfig),
    setSidebarConfig: vi.fn(),
  },
}))

// Import after mock is registered
const { createWidgetPanel, mountSidebar } = await import('./panelHost.js')

function makeMockDescriptor(id = 'test', overrides = {}) {
  return {
    id,
    label: 'Test Widget',
    icon: '<svg></svg>',
    defaultSide: 'left',
    init: vi.fn(),
    ...overrides,
  }
}

const DEFAULT_CONFIG = {
  left:  { enabled: true, collapsed: false, order: ['test'],  panels: {} },
  right: { enabled: true, collapsed: false, order: [],        panels: {} },
}

beforeEach(() => {
  _mockConfig = structuredClone(DEFAULT_CONFIG)
  vi.clearAllMocks()
})

describe('createWidgetPanel — DOM structure', () => {
  it('creates a .widget-panel element with data-widget attribute', () => {
    const panel = createWidgetPanel(makeMockDescriptor('mywidget'), 'left')
    expect(panel.classList.contains('widget-panel')).toBe(true)
    expect(panel.dataset.widget).toBe('mywidget')
  })

  it('panel contains .widget-panel-header and .widget-body', () => {
    const panel = createWidgetPanel(makeMockDescriptor(), 'left')
    expect(panel.querySelector('.widget-panel-header')).not.toBeNull()
    expect(panel.querySelector('.widget-body')).not.toBeNull()
  })

  it('header contains .widget-icon, .widget-label, .widget-chevron', () => {
    const panel = createWidgetPanel(makeMockDescriptor(), 'left')
    const header = panel.querySelector('.widget-panel-header')
    expect(header.querySelector('.widget-icon')).not.toBeNull()
    expect(header.querySelector('.widget-label')).not.toBeNull()
    expect(header.querySelector('.widget-chevron')).not.toBeNull()
  })

  it('label text matches descriptor.label', () => {
    const panel = createWidgetPanel(makeMockDescriptor('x', { label: 'My Label' }), 'left')
    expect(panel.querySelector('.widget-label').textContent).toBe('My Label')
  })

  it('icon HTML is injected into .widget-icon', () => {
    const panel = createWidgetPanel(makeMockDescriptor('x', { icon: '<svg id="test-icon"></svg>' }), 'left')
    expect(panel.querySelector('#test-icon')).not.toBeNull()
  })

  it('header has a .widget-badge element', () => {
    const panel = createWidgetPanel(makeMockDescriptor(), 'left')
    expect(panel.querySelector('.widget-badge')).not.toBeNull()
  })
})

describe('createWidgetPanel — init call', () => {
  it('calls descriptor.init with { container, badge }', () => {
    const desc = makeMockDescriptor()
    createWidgetPanel(desc, 'left', { ntoast: null })
    expect(desc.init).toHaveBeenCalledOnce()
    const args = desc.init.mock.calls[0][0]
    expect(args.container).toBeInstanceOf(HTMLElement)
    expect(args.container.classList.contains('widget-body')).toBe(true)
    expect(args.badge).toBeInstanceOf(HTMLElement)
  })

  it('passes extra deps through to init', () => {
    const desc = makeMockDescriptor()
    const getTabs = vi.fn()
    createWidgetPanel(desc, 'left', { ntoast: 'toast', getTabs })
    const args = desc.init.mock.calls[0][0]
    expect(args.ntoast).toBe('toast')
    expect(args.getTabs).toBe(getTabs)
  })
})

describe('createWidgetPanel — collapsed state', () => {
  it('adds panel-collapsed class when saved state is collapsed', () => {
    _mockConfig = {
      left:  { enabled: true, collapsed: false, order: ['test'], panels: { test: { collapsed: true } } },
      right: { enabled: true, collapsed: false, order: [], panels: {} },
    }
    const panel = createWidgetPanel(makeMockDescriptor('test'), 'left')
    expect(panel.classList.contains('panel-collapsed')).toBe(true)
    expect(panel.querySelector('.widget-body').hidden).toBe(true)
  })

  it('does not add panel-collapsed when saved state is not collapsed', () => {
    const panel = createWidgetPanel(makeMockDescriptor('test'), 'left')
    expect(panel.classList.contains('panel-collapsed')).toBe(false)
    expect(panel.querySelector('.widget-body').hidden).toBe(false)
  })
})

describe('mountSidebar', () => {
  it('appends one panel per widget in order', () => {
    _mockConfig = {
      left:  { enabled: true, collapsed: false, order: ['a', 'b'], panels: {} },
      right: { enabled: true, collapsed: false, order: [],         panels: {} },
    }
    const container = document.createElement('div')
    const widgetMap = {
      a: makeMockDescriptor('a'),
      b: makeMockDescriptor('b'),
    }
    mountSidebar(container, 'left', widgetMap)
    const panels = container.querySelectorAll('.widget-panel')
    expect(panels).toHaveLength(2)
    expect(panels[0].dataset.widget).toBe('a')
    expect(panels[1].dataset.widget).toBe('b')
  })

  it('skips widgets not in widgetMap', () => {
    _mockConfig = {
      left:  { enabled: true, collapsed: false, order: ['a', 'missing'], panels: {} },
      right: { enabled: true, collapsed: false, order: [], panels: {} },
    }
    const container = document.createElement('div')
    mountSidebar(container, 'left', { a: makeMockDescriptor('a') })
    expect(container.querySelectorAll('.widget-panel')).toHaveLength(1)
  })

  it('clears existing content before mounting', () => {
    const container = document.createElement('div')
    container.innerHTML = '<div class="stale">old</div>'
    mountSidebar(container, 'left', { test: makeMockDescriptor('test') })
    expect(container.querySelector('.stale')).toBeNull()
  })
})
