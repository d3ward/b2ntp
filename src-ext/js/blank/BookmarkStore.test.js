import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../components/localStorage', () => ({
  storage: {
    get: vi.fn(() => null),
    set: vi.fn(),
  },
}))

vi.mock('../components/utilities', () => ({
  jsoncat: (o1, o2) => {
    for (const k in o2) o1[k] = o2[k]
    return o1
  },
}))

const FIXTURE_TREE = [
  {
    id: '0',
    title: '',
    children: [
      {
        id: '1',
        title: 'Dev Tools',
        children: [
          { id: '10', title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
          { id: '11', title: 'GitHub', url: 'https://github.com' },
        ],
      },
      {
        id: '2',
        title: 'Search Engines',
        children: [
          { id: '20', title: 'Google', url: 'https://google.com' },
          { id: '21', title: 'DuckDuckGo', url: 'https://duckduckgo.com' },
        ],
      },
    ],
  },
]

beforeEach(() => {
  vi.resetModules()
  globalThis.chrome = {
    bookmarks: { getTree: vi.fn((cb) => cb(FIXTURE_TREE)) },
  }
})

describe('BookmarkStore.query', () => {
  it('empty query returns all folders as sections preserving order', async () => {
    const { BookmarkStore } = await import('./BookmarkStore')
    const sections = await BookmarkStore.query('')
    expect(sections).toHaveLength(2)
    expect(sections[0].title).toBe('Dev Tools')
    expect(sections[0].id).toBe('1')
    expect(sections[0].items).toHaveLength(2)
    expect(sections[1].title).toBe('Search Engines')
    expect(sections[1].items).toHaveLength(2)
  })

  it('filtered query returns only items matching title or url', async () => {
    const { BookmarkStore } = await import('./BookmarkStore')
    const sections = await BookmarkStore.query('mdn')
    expect(sections).toHaveLength(1)
    expect(sections[0].title).toBe('Dev Tools')
    expect(sections[0].items).toHaveLength(1)
    expect(sections[0].items[0]).toMatchObject({
      title: 'MDN Web Docs',
      url: 'https://developer.mozilla.org',
      id: '10',
    })
  })

  it('match is case-insensitive', async () => {
    const { BookmarkStore } = await import('./BookmarkStore')
    const sections = await BookmarkStore.query('GITHUB')
    expect(sections).toHaveLength(1)
    expect(sections[0].items[0].title).toBe('GitHub')
  })

  it('prepends Tabs section when tabs match the search term', async () => {
    const { BookmarkStore } = await import('./BookmarkStore')
    const tabs = [
      { id: 't1', title: 'GitHub Issues', url: 'https://github.com/issues' },
      { id: 't2', title: 'Unrelated Tab', url: 'https://example.com' },
    ]
    const sections = await BookmarkStore.query('github', tabs)
    expect(sections[0].title).toBe('Tabs')
    expect(sections[0].id).toBe('tabs-search-results')
    expect(sections[0].items).toHaveLength(1)
    expect(sections[0].items[0].title).toBe('GitHub Issues')
    // bookmark result still present after tabs section
    expect(sections[1].title).toBe('Dev Tools')
  })

  it('does not prepend Tabs section when no tabs match', async () => {
    const { BookmarkStore } = await import('./BookmarkStore')
    const tabs = [{ id: 't1', title: 'Unrelated', url: 'https://example.com' }]
    const sections = await BookmarkStore.query('github', tabs)
    expect(sections[0].title).not.toBe('Tabs')
  })

  it('empty query with tabs arg ignores tabs', async () => {
    const { BookmarkStore } = await import('./BookmarkStore')
    const tabs = [{ id: 't1', title: 'GitHub Issues', url: 'https://github.com/issues' }]
    const sections = await BookmarkStore.query('', tabs)
    expect(sections.find((s) => s.title === 'Tabs')).toBeUndefined()
    expect(sections).toHaveLength(2)
  })
})
