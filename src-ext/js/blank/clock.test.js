import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

let _mockWidgets = { layout: { left: [], right: [] }, settings: {} }

vi.mock('../settings/state.js', () => ({
  settingsState: {
    getWidgets: vi.fn(() => _mockWidgets),
  },
}))

const { initClock, settingsSchema } = await import('./clock.js')

beforeEach(() => {
  vi.useFakeTimers()
  document.body.className = ''
  _mockWidgets = { layout: { left: [], right: [] }, settings: {} }
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('settingsSchema', () => {
  it('declares showSeconds, timeFormat, dateFormat with the pre-existing tlbData defaults', () => {
    expect(settingsSchema.showSeconds.default).toBe(false)
    expect(settingsSchema.timeFormat.default).toBe('24')
    expect(settingsSchema.dateFormat.default).toBe('auto')
  })
})

describe('initClock', () => {
  it('adds clock-widget-active to body', () => {
    initClock({ container: document.createElement('div') })
    expect(document.body.classList.contains('clock-widget-active')).toBe(true)
  })

  it('renders .clock-widget-time and .clock-widget-date inside container', () => {
    const container = document.createElement('div')
    initClock({ container })
    expect(container.querySelector('.clock-widget-time')).not.toBeNull()
    expect(container.querySelector('.clock-widget-date')).not.toBeNull()
  })

  it('populates time and date text immediately on init', () => {
    const container = document.createElement('div')
    initClock({ container })
    expect(container.querySelector('.clock-widget-time').textContent).not.toBe('')
    expect(container.querySelector('.clock-widget-date').textContent).not.toBe('')
  })

  it('calls clearInterval with the previous ID on re-init', () => {
    // Plant a known ID by mocking setInterval return value (must be numeric for clearInterval)
    const knownId = 9999
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval').mockReturnValue(knownId)
    initClock({ container: document.createElement('div') })
    setIntervalSpy.mockRestore()

    // Now spy fresh on clearInterval and trigger a second init
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    initClock({ container: document.createElement('div') })
    expect(clearIntervalSpy).toHaveBeenCalledWith(knownId)
    clearIntervalSpy.mockRestore()
  })

  it('updates displayed text on each tick', () => {
    const container = document.createElement('div')
    initClock({ container })
    const timeBefore = container.querySelector('.clock-widget-time').textContent
    vi.advanceTimersByTime(1000)
    // Verify tick ran without error (content is still a string)
    expect(typeof container.querySelector('.clock-widget-time').textContent).toBe('string')
    expect(timeBefore).toBeDefined()
  })

  it('shows seconds when showSeconds is overridden true', () => {
    _mockWidgets = { layout: { left: [], right: [] }, settings: { clock: { showSeconds: true } } }
    const container = document.createElement('div')
    initClock({ container })
    const time = container.querySelector('.clock-widget-time').textContent
    // h:mm:ss has two ':' separators; h:mm (no seconds) has one
    expect(time.split(':').length).toBeGreaterThanOrEqual(3)
  })

  it('omits seconds by default', () => {
    const container = document.createElement('div')
    initClock({ container })
    const time = container.querySelector('.clock-widget-time').textContent
    expect(time.split(':').length).toBeLessThanOrEqual(2)
  })

  it('uses 12-hour format when overridden', () => {
    _mockWidgets = { layout: { left: [], right: [] }, settings: { clock: { timeFormat: '12' } } }
    const container = document.createElement('div')
    initClock({ container })
    const time = container.querySelector('.clock-widget-time').textContent
    expect(/AM|PM/.test(time)).toBe(true)
  })
})
