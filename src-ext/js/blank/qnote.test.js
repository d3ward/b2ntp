import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

let _store = {}

vi.mock('../components/localStorage.js', () => ({
  storage: {
    get: vi.fn((key) => _store[key] ?? null),
    set: vi.fn((key, value) => { _store[key] = value }),
  },
}))

const { initQuickNote } = await import('./qnote.js')
const { storage } = await import('../components/localStorage.js')


beforeEach(() => {
  _store = {}
  vi.clearAllMocks()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('initQuickNote', () => {
  it('renders a textarea inside container', () => {
    const container = document.createElement('div')
    initQuickNote({ container })
    expect(container.querySelector('textarea')).not.toBeNull()
  })

  it('restores saved content from storage on init', () => {
    _store['qnote_content'] = 'my saved note'
    const container = document.createElement('div')
    initQuickNote({ container })
    expect(container.querySelector('textarea').value).toBe('my saved note')
  })

  it('leaves textarea empty when storage returns null', () => {
    // _store is reset in beforeEach, so storage.get returns null
    const container = document.createElement('div')
    initQuickNote({ container })
    expect(container.querySelector('textarea').value).toBe('')
  })

  it('saves content to storage under qnote_content after debounce', () => {
    const container = document.createElement('div')
    initQuickNote({ container })

    const textarea = container.querySelector('textarea')
    textarea.value = 'hello world'
    textarea.dispatchEvent(new Event('input'))

    // Should not save yet (debounce pending)
    expect(storage.set).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(storage.set).toHaveBeenCalledOnce()
    expect(storage.set).toHaveBeenCalledWith('qnote_content', 'hello world')
  })

  it('debounces rapid input — only one save after burst', () => {
    const container = document.createElement('div')
    initQuickNote({ container })

    const textarea = container.querySelector('textarea')
    for (let i = 0; i < 5; i++) {
      textarea.value = `keystroke ${i}`
      textarea.dispatchEvent(new Event('input'))
      vi.advanceTimersByTime(100)
    }
    // 5 keystrokes × 100ms = 500ms but debounce restarts each time, not fired yet
    expect(storage.set).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(storage.set).toHaveBeenCalledOnce()
  })
})
