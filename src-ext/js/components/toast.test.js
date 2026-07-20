import { describe, it, expect, beforeEach, vi } from 'vitest'
import { toast } from './toast'

// Covers the wiring the DaisyUI migration added to toast.js: mapping types onto
// DaisyUI `alert-*` classes, and promoting the container into the top layer so
// toasts still paint above a native <dialog>.
function mountContainer({ popover = true } = {}) {
  document.body.innerHTML = `<div class="toast toast-top toast-center" id="nt1" toast-pos="top"${
    popover ? ' popover="manual"' : ''
  }></div>`
  const el = document.getElementById('nt1')
  // jsdom implements neither the Web Animations API nor the popover API.
  el.animate = vi.fn()
  el.showPopover = vi.fn(function () { this.__open = true })
  el.hidePopover = vi.fn(function () { this.__open = false })
  const realMatches = el.matches.bind(el)
  el.matches = (sel) => (sel === ':popover-open' ? !!el.__open : realMatches(sel))
  return el
}

const items = () => [...document.querySelectorAll('#nt1 .toast-item')]

describe('toast — DaisyUI alert classes', () => {
  beforeEach(() => { mountContainer() })

  it.each([
    ['success', 'alert-success'],
    ['error', 'alert-error'],
    ['warn', 'alert-warning'],
    ['info', 'alert-info'],
  ])('%s maps to %s', (kind, expected) => {
    toast()[kind]('hello')
    const el = items()[0]
    expect(el.classList.contains('alert')).toBe(true)
    expect(el.classList.contains(expected)).toBe(true)
  })

  it('renders the message as text, not markup', () => {
    toast().error('<img src=x onerror=alert(1)>')
    const span = items()[0].querySelector('span')
    expect(span.textContent).toBe('<img src=x onerror=alert(1)>')
    expect(items()[0].querySelector('img')).toBeNull()
  })

  it('marks items with role=alert', () => {
    toast().info('hi')
    expect(items()[0].getAttribute('role')).toBe('alert')
  })

  it('untyped toasts carry no alert-* colour class', () => {
    toast().show('plain')
    const classes = [...items()[0].classList]
    expect(classes.filter((c) => c.startsWith('alert-'))).toEqual([])
  })
})

describe('toast — top-layer promotion', () => {
  it('promotes the container on the first toast', () => {
    const el = mountContainer()
    toast().success('one')
    expect(el.showPopover).toHaveBeenCalledTimes(1)
  })

  it('does not promote twice while already open', () => {
    const el = mountContainer()
    const t = toast()
    t.success('one')
    t.success('two')
    expect(el.showPopover).toHaveBeenCalledTimes(1)
  })

  it('demotes only once the last toast is removed', () => {
    vi.useFakeTimers()
    const el = mountContainer()
    const t = toast()
    t.success('one')
    t.success('two')
    t.close(items()[0])
    vi.advanceTimersByTime(300)
    expect(el.hidePopover).not.toHaveBeenCalled()
    t.close(items()[0])
    vi.advanceTimersByTime(300)
    expect(el.hidePopover).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('is inert when the container is not a popover', () => {
    const el = mountContainer({ popover: false })
    expect(() => toast().success('one')).not.toThrow()
    expect(el.showPopover).not.toHaveBeenCalled()
  })
})

describe('toast — dismissal timing contract', () => {
  it('plays the exit animation for 300ms before removing', () => {
    vi.useFakeTimers()
    mountContainer()
    const t = toast()
    t.success('one')
    t.close(items()[0])
    expect(items()[0].classList.contains('toast-out')).toBe(true)
    vi.advanceTimersByTime(299)
    expect(items()).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(items()).toHaveLength(0)
    vi.useRealTimers()
  })
})
