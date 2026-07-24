import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createQueryBus } from '../widgets/panelHost.js'

let _store = {}

vi.mock('../components/localStorage', () => ({
  storage: {
    get: vi.fn((key) => (key in _store ? _store[key] : null)),
    set: vi.fn((key, value) => { _store[key] = value }),
  },
}))

const queryMock = vi.fn()
const refreshMock = vi.fn()
vi.mock('./BookmarkStore', () => ({
  BookmarkStore: {
    query: (...args) => queryMock(...args),
    refresh: (...args) => refreshMock(...args),
  },
}))

const { initBookmarks, getBookmarks } = await import('./bookmarks.js')

const SECTIONS = [
  {
    title: 'Dev', id: 'sec-dev', items: [
      { title: 'MDN', url: 'https://developer.mozilla.org', id: 'bm-1' },
      { title: 'GitHub', url: 'https://github.com', id: 'bm-2' },
    ],
  },
  {
    title: 'News', id: 'sec-news', items: [
      { title: 'HN', url: 'https://news.ycombinator.com', id: 'bm-3' },
    ],
  },
]

// The real bus (not a hand-rolled mock), spied so assertions like
// toHaveBeenCalledWith still work while delivery stays real.
function makeBus() {
  const bus = createQueryBus()
  vi.spyOn(bus, 'emit')
  vi.spyOn(bus, 'on')
  return bus
}

async function mount({ bus = makeBus(), getTabs, sections = SECTIONS } = {}) {
  queryMock.mockResolvedValue(sections)
  const container = document.createElement('div')
  await initBookmarks({ container, bus, getTabs })
  return { container, bus }
}

beforeEach(() => {
  _store = {}
  queryMock.mockReset()
  refreshMock.mockReset()
  delete globalThis.chrome
  // jsdom doesn't implement scrollIntoView.
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('initBookmarks — initial render', () => {
  it('sets container id to "bookmarks" for existing CSS to target', async () => {
    const { container } = await mount()
    expect(container.id).toBe('bookmarks')
  })

  it('queries with an empty term and renders without highlighting on init', async () => {
    const { container } = await mount()
    expect(queryMock).toHaveBeenCalledWith('', [])
    expect(container.querySelectorAll('.section')).toHaveLength(2)
    expect(container.querySelector('.selected')).toBeNull()
  })

  it('passes getTabs() results through to BookmarkStore.query', async () => {
    const tabs = [{ id: 't1', title: 'Tab' }]
    await mount({ getTabs: () => tabs })
    expect(queryMock).toHaveBeenCalledWith('', tabs)
  })

  it('emits the (null) selection after the initial render', async () => {
    const { bus } = await mount()
    expect(bus.emit).toHaveBeenCalledWith('selection', null)
  })
})

describe('initBookmarks — bus: query', () => {
  it('re-renders with highlightFirst on a non-empty query and emits the new selection', async () => {
    const { container, bus } = await mount()
    bus.emit('query', 'mdn')
    await vi.waitFor(() => expect(queryMock).toHaveBeenCalledWith('mdn', []))
    expect(container.querySelector('.selected')).not.toBeNull()
    expect(bus.emit).toHaveBeenCalledWith('selection', { id: 'bm-1', url: 'https://developer.mozilla.org/' })
  })

  it('clears the container and emits a null selection on a null query', async () => {
    const { container, bus } = await mount()
    bus.emit('query', null)
    expect(container.innerHTML).toBe('')
    expect(bus.emit).toHaveBeenLastCalledWith('selection', null)
  })

  it('re-renders without highlighting on an empty-string query (browse-all)', async () => {
    const { container, bus } = await mount()
    bus.emit('query', 'mdn')
    await vi.waitFor(() => expect(container.querySelector('.selected')).not.toBeNull())
    bus.emit('query', '')
    await vi.waitFor(() => expect(container.querySelector('.selected')).toBeNull())
  })
})

describe('initBookmarks — bus: nav', () => {
  it('selects the first item on down with nothing selected', async () => {
    const { container, bus } = await mount()
    bus.emit('nav', 'down')
    expect(container.querySelector('.selected').id).toBe('bm-1')
    expect(bus.emit).toHaveBeenLastCalledWith('selection', { id: 'bm-1', url: 'https://developer.mozilla.org/' })
  })

  it('moves to the next item on down', async () => {
    const { container, bus } = await mount()
    bus.emit('nav', 'down')
    bus.emit('nav', 'down')
    expect(container.querySelector('.selected').id).toBe('bm-2')
  })

  it('crosses a section boundary on down', async () => {
    const { container, bus } = await mount()
    bus.emit('nav', 'down')
    bus.emit('nav', 'down')
    bus.emit('nav', 'down')
    expect(container.querySelector('.selected').id).toBe('bm-3')
  })

  it('moves to the previous section on left', async () => {
    const { container, bus } = await mount()
    bus.emit('nav', 'down') // bm-1, Dev section
    bus.emit('nav', 'left')
    expect(container.querySelector('.selected').id).toBe('bm-3')
  })

  it('is a no-op when there is nothing to select', async () => {
    const { container, bus } = await mount({ sections: [] })
    expect(() => bus.emit('nav', 'down')).not.toThrow()
    expect(container.querySelector('.selected')).toBeNull()
  })
})

describe('initBookmarks — bus: activate', () => {
  it('navigates window.location to the selected bookmark', async () => {
    const { bus } = await mount()
    bus.emit('nav', 'down')
    delete window.location
    window.location = { href: '' }
    bus.emit('activate')
    expect(window.location.href).toBe('https://developer.mozilla.org/')
  })

  it('activates a selected tab via chrome.tabs.update instead of navigating', async () => {
    globalThis.chrome = { tabs: { update: vi.fn() } }
    const tabSections = [{ title: 'Tabs', id: 'tabs-search-results', items: [{ title: 'Open', url: 'https://x.com', id: '9' }] }]
    const { bus } = await mount({ sections: tabSections })
    bus.emit('nav', 'down')
    bus.emit('activate')
    expect(chrome.tabs.update).toHaveBeenCalledWith(9, { active: true })
  })

  it('does nothing when nothing is selected', async () => {
    const { bus } = await mount()
    expect(() => bus.emit('activate')).not.toThrow()
  })
})

describe('initBookmarks — tab-click delegation', () => {
  it('activates the tab and prevents navigation on click', async () => {
    globalThis.chrome = { tabs: { update: vi.fn() } }
    const tabSections = [{ title: 'Tabs', id: 'tabs-search-results', items: [{ title: 'Open', url: 'https://x.com', id: '9' }] }]
    const { container } = await mount({ sections: tabSections })
    const link = container.querySelector('a[data-tab-id]')
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(evt)
    expect(evt.defaultPrevented).toBe(true)
    expect(chrome.tabs.update).toHaveBeenCalledWith(9, { active: true })
  })
})

describe('initBookmarks — degrades alone (no bus)', () => {
  it('renders normally when mounted without a bus', async () => {
    queryMock.mockResolvedValue(SECTIONS)
    const container = document.createElement('div')
    await expect(initBookmarks({ container })).resolves.not.toThrow()
    expect(container.querySelectorAll('.section')).toHaveLength(2)
  })
})

describe('getBookmarks', () => {
  it('refreshes the store and updates #last_sync', async () => {
    document.body.innerHTML = '<div id="last_sync"></div>'
    _store.bk_time = 'just now'
    await getBookmarks()
    expect(refreshMock).toHaveBeenCalledOnce()
    expect(document.getElementById('last_sync').innerText).toBe('just now')
  })
})
