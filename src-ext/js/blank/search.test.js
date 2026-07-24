import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createQueryBus } from '../widgets/panelHost.js'

let _store = {}

vi.mock('../components/localStorage', () => ({
  storage: {
    get: vi.fn((key) => (key in _store ? _store[key] : null)),
    set: vi.fn((key, value) => { _store[key] = value }),
  },
}))

const { initSearch } = await import('./search.js')

// The real bus (not a hand-rolled mock), spied so assertions like
// toHaveBeenCalledWith still work while delivery stays real.
function makeBus() {
  const bus = createQueryBus()
  vi.spyOn(bus, 'emit')
  vi.spyOn(bus, 'on')
  return bus
}

function mount(bus = makeBus()) {
  const container = document.createElement('div')
  initSearch({ container, bus })
  const input = container.querySelector('#sb_input')
  const form = container.querySelector('#action')
  return { container, bus, input, form }
}

beforeEach(() => {
  _store = {}
})

describe('initSearch — DOM structure', () => {
  it('builds a form + input inside container, tagged .tool_search', () => {
    const { container, form, input } = mount()
    expect(container.classList.contains('tool_search')).toBe(true)
    expect(form).not.toBeNull()
    expect(input).not.toBeNull()
    expect(input.getAttribute('aria-label')).toBe('Search Bar')
  })

  it('uses a custom placeholder from stored sb_data', () => {
    _store.sb_data = { placeholder: 'Find stuff..', default: 'd', bang: '!', d: 'https://duckduckgo.com/?q=' }
    const { input } = mount()
    expect(input.placeholder).toBe('Find stuff..')
  })

  it('seeds default sb_data (with bangs) when none is stored', () => {
    mount()
    expect(_store.sb_data).toBeDefined()
    expect(_store.sb_data.bang).toBe('!')
    expect(_store.sb_data.d).toContain('duckduckgo')
  })
})

describe('initSearch — query emission', () => {
  it('emits the trimmed query text on normal input', () => {
    const { input, bus } = mount()
    input.value = '  hello world'
    input.dispatchEvent(new Event('input'))
    expect(bus.emit).toHaveBeenCalledWith('query', 'hello world')
  })

  it('emits a null query and sets a bang-shortcut action, without touching bookmarks', () => {
    const { input, bus, form } = mount()
    input.value = '!g cats'
    input.dispatchEvent(new Event('input'))
    expect(bus.emit).toHaveBeenCalledWith('query', null)
    expect(form.action).toBe('https://google.com/search?q=cats')
  })

  it('emits a null query for the trailing-double-space escape hatch', () => {
    const { input, bus, form } = mount()
    input.value = 'literal query  '
    input.dispatchEvent(new Event('input'))
    expect(bus.emit).toHaveBeenCalledWith('query', null)
    expect(form.action).toBe('https://duckduckgo.com/?q=' + encodeURIComponent('literal query'))
  })
})

describe('initSearch — selection reactions', () => {
  it('points the form action at the selection and sets aria-activedescendant', () => {
    const { bus, form, input } = mount()
    bus.emit('selection', { id: 'bm-1', url: 'https://example.com' })
    expect(form.action).toBe('https://example.com/')
    expect(form.querySelector('input').getAttribute('name')).toBeNull()
    expect(input.getAttribute('aria-activedescendant')).toBe('bm-1')
  })

  it('clears aria-activedescendant and falls back to the default engine when selection clears mid-query', () => {
    const { input, bus, form } = mount()
    input.value = 'term'
    input.dispatchEvent(new Event('input'))
    bus.emit('selection', null)
    expect(input.getAttribute('aria-activedescendant')).toBeNull()
    expect(form.action).toBe(_store.sb_data[_store.sb_data.default])
  })

  it('leaves the action untouched when selection clears on an empty query (browse-all view)', () => {
    const { form, bus } = mount()
    const before = form.action
    bus.emit('selection', null)
    expect(form.action).toBe(before)
  })
})

describe('initSearch — keyboard nav intent', () => {
  it('forwards up/down as nav intent and prevents default', () => {
    const { input, bus } = mount()
    const evt = new KeyboardEvent('keydown', { keyCode: 40, cancelable: true })
    Object.defineProperty(evt, 'keyCode', { value: 40 })
    input.dispatchEvent(evt)
    expect(bus.emit).toHaveBeenCalledWith('nav', 'down')
    expect(evt.defaultPrevented).toBe(true)
  })

  it('does not forward left/right when nothing is selected', () => {
    const { input, bus } = mount()
    const evt = new KeyboardEvent('keydown', { cancelable: true })
    Object.defineProperty(evt, 'keyCode', { value: 39 })
    input.dispatchEvent(evt)
    expect(bus.emit).not.toHaveBeenCalledWith('nav', expect.anything())
    expect(evt.defaultPrevented).toBe(false)
  })

  it('forwards left/right as nav intent once something is selected', () => {
    const { input, bus } = mount()
    bus.emit('selection', { id: 'bm-1', url: 'https://example.com' })
    const evt = new KeyboardEvent('keydown', { cancelable: true })
    Object.defineProperty(evt, 'keyCode', { value: 37 })
    input.dispatchEvent(evt)
    expect(bus.emit).toHaveBeenCalledWith('nav', 'left')
    expect(evt.defaultPrevented).toBe(true)
  })
})

describe('initSearch — activation', () => {
  it('prevents default submit and emits activate when something is selected', () => {
    const { form, bus } = mount()
    bus.emit('selection', { id: 'bm-1', url: 'https://example.com' })
    const evt = new Event('submit', { cancelable: true })
    form.dispatchEvent(evt)
    expect(evt.defaultPrevented).toBe(true)
    expect(bus.emit).toHaveBeenCalledWith('activate')
  })

  it('lets the form submit natively when nothing is selected', () => {
    const { form } = mount()
    const evt = new Event('submit', { cancelable: true })
    form.dispatchEvent(evt)
    expect(evt.defaultPrevented).toBe(false)
  })

  it('strips a bare "d query" shortcut prefix before native submission', () => {
    const { input, form } = mount()
    input.value = 'd hello'
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    expect(input.value).toBe('hello')
  })
})

describe('initSearch — degrades alone (no bookmarks widget)', () => {
  it('works with no bus at all: input does not throw, submit falls through natively', () => {
    const container = document.createElement('div')
    expect(() => initSearch({ container })).not.toThrow()
    const input = container.querySelector('#sb_input')
    const form = container.querySelector('#action')
    input.value = 'plain query'
    expect(() => input.dispatchEvent(new Event('input'))).not.toThrow()
    const evt = new Event('submit', { cancelable: true })
    form.dispatchEvent(evt)
    expect(evt.defaultPrevented).toBe(false)
  })
})
