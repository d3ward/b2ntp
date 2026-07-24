import { describe, it, expect } from 'vitest'
import { BookmarkRenderer } from './BookmarkRenderer.js'

function makeSection(overrides = {}) {
  return {
    title: 'Dev Tools',
    id: 'sec-1',
    items: [
      { title: 'MDN', url: 'https://developer.mozilla.org', id: 'bm-1' },
      { title: 'GitHub', url: 'https://github.com', id: 'bm-2' },
    ],
    ...overrides,
  }
}

describe('BookmarkRenderer.render — container param', () => {
  it('renders into the given container, not a global lookup', () => {
    const container = document.createElement('div')
    BookmarkRenderer.render(container, [makeSection()])
    expect(container.querySelectorAll('.section')).toHaveLength(1)
    expect(container.querySelectorAll('a')).toHaveLength(2)
  })

  it('does nothing when no container is given', () => {
    expect(() => BookmarkRenderer.render(null, [makeSection()])).not.toThrow()
  })

  it('clears prior content before rendering', () => {
    const container = document.createElement('div')
    container.innerHTML = '<div class="stale">old</div>'
    BookmarkRenderer.render(container, [makeSection()])
    expect(container.querySelector('.stale')).toBeNull()
  })

  it('skips sections with no items', () => {
    const container = document.createElement('div')
    BookmarkRenderer.render(container, [makeSection({ items: [] })])
    expect(container.querySelectorAll('.section')).toHaveLength(0)
  })
})

describe('BookmarkRenderer.render — highlightFirst', () => {
  it('marks the first item .selected when highlightFirst is true', () => {
    const container = document.createElement('div')
    BookmarkRenderer.render(container, [makeSection()], true)
    const links = container.querySelectorAll('a')
    expect(links[0].classList.contains('selected')).toBe(true)
    expect(links[1].classList.contains('selected')).toBe(false)
  })

  it('selects nothing when highlightFirst is false', () => {
    const container = document.createElement('div')
    BookmarkRenderer.render(container, [makeSection()], false)
    expect(container.querySelector('.selected')).toBeNull()
  })

  it('highlights the first item across sections, not per-section', () => {
    const container = document.createElement('div')
    BookmarkRenderer.render(container, [makeSection({ id: 'sec-1' }), makeSection({ id: 'sec-2', title: 'Other' })], true)
    expect(container.querySelectorAll('.selected')).toHaveLength(1)
  })
})

describe('BookmarkRenderer.render — bookmark links', () => {
  it('gives a bookmark link its own id, href, and text', () => {
    const container = document.createElement('div')
    BookmarkRenderer.render(container, [makeSection()])
    const link = container.querySelector('a')
    expect(link.id).toBe('bm-1')
    expect(link.href).toBe('https://developer.mozilla.org/')
    expect(link.textContent).toBe('MDN')
    expect(link.dataset.tabId).toBeUndefined()
  })
})

describe('BookmarkRenderer.render — tab result links', () => {
  const tabsSection = {
    title: 'Tabs',
    id: 'tabs-search-results',
    items: [{ title: 'Open Tab', url: 'https://example.com', id: '42', favIconUrl: 'https://example.com/f.png' }],
  }

  it('prefixes the id so it never collides with a bookmark id', () => {
    const container = document.createElement('div')
    BookmarkRenderer.render(container, [tabsSection])
    const link = container.querySelector('a')
    expect(link.id).toBe('tab-42')
    expect(link.dataset.tabId).toBe('42')
  })

  it('is selectable/highlightable just like a bookmark link', () => {
    const container = document.createElement('div')
    BookmarkRenderer.render(container, [tabsSection], true)
    expect(container.querySelector('a').classList.contains('selected')).toBe(true)
  })

  it('renders a favicon image when present', () => {
    const container = document.createElement('div')
    BookmarkRenderer.render(container, [tabsSection])
    expect(container.querySelector('a img')).not.toBeNull()
  })
})
