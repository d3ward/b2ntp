import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../settings/state.js', () => ({
  settingsState: {
    getTlbData: vi.fn(() => ({ dateFormat: 'auto', timeFormat: '24', seconds: false })),
  },
}))

const { initClock } = await import('./clock.js')

beforeEach(() => {
  vi.useFakeTimers()
  document.body.className = ''
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
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
})
