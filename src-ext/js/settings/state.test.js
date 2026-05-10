import { describe, it, expect, vi, beforeEach } from 'vitest'

function makeAdapter(initialData = {}) {
  const store = { ...initialData }
  return {
    get: vi.fn((key) => (key in store ? store[key] : null)),
    set: vi.fn((key, value) => { store[key] = value }),
    _store: store,
  }
}

async function freshState(adapter) {
  vi.resetModules()
  const mod = await import('./state.js')
  await mod.settingsState.init(adapter)
  return mod
}

describe('settingsState defaults', () => {
  it('returns ntpTheme default when storage is empty', async () => {
    const adapter = makeAdapter()
    const { settingsState, DEFAULTS } = await freshState(adapter)
    expect(settingsState.getNtpTheme()).toEqual(DEFAULTS.ntpTheme)
  })

  it('returns tlbData default when storage is empty', async () => {
    const adapter = makeAdapter()
    const { settingsState, DEFAULTS } = await freshState(adapter)
    expect(settingsState.getTlbData()).toEqual(DEFAULTS.tlbData)
  })

  it('returns sidebarConfig default when storage is empty', async () => {
    const adapter = makeAdapter()
    const { settingsState, DEFAULTS } = await freshState(adapter)
    expect(settingsState.getSidebarConfig()).toEqual(DEFAULTS.sidebarConfig)
  })

  it('seeds storage with defaults on init', async () => {
    const adapter = makeAdapter()
    const { DEFAULTS } = await freshState(adapter)
    expect(adapter.set).toHaveBeenCalledWith('ntp_theme', DEFAULTS.ntpTheme)
    expect(adapter.set).toHaveBeenCalledWith('tlb_data', DEFAULTS.tlbData)
  })
})

describe('settingsState persisted values', () => {
  it('loads ntpTheme from storage when present', async () => {
    const stored = { value: 'dark', autoSwitch: false, autoSwitchType: 'system', darkModeStart: 20, darkModeEnd: 6 }
    const adapter = makeAdapter({ ntp_theme: stored })
    const { settingsState } = await freshState(adapter)
    expect(settingsState.getNtpTheme()).toEqual(stored)
  })

  it('loads tlbData from storage when present', async () => {
    const stored = { dateFormat: 'us', timeFormat: '12', seconds: true }
    const adapter = makeAdapter({ tlb_data: stored })
    const { settingsState } = await freshState(adapter)
    expect(settingsState.getTlbData()).toEqual(stored)
  })
})

describe('settingsState set* and onChange', () => {
  it('onChange fires after setNtpTheme', async () => {
    const adapter = makeAdapter()
    const { settingsState } = await freshState(adapter)
    const fn = vi.fn()
    settingsState.onChange('ntpTheme', fn)
    const theme = { value: 'dark', autoSwitch: false, autoSwitchType: 'system', darkModeStart: 18, darkModeEnd: 7 }
    settingsState.setNtpTheme(theme)
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith(theme)
  })

  it('onChange fires after setTlbData', async () => {
    const adapter = makeAdapter()
    const { settingsState } = await freshState(adapter)
    const fn = vi.fn()
    settingsState.onChange('tlbData', fn)
    const data = { dateFormat: 'auto', timeFormat: '12', seconds: true }
    settingsState.setTlbData(data)
    expect(fn).toHaveBeenCalledWith(data)
  })

  it('multiple listeners for the same key all fire', async () => {
    const adapter = makeAdapter()
    const { settingsState } = await freshState(adapter)
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    settingsState.onChange('ntpTheme', fn1)
    settingsState.onChange('ntpTheme', fn2)
    settingsState.setNtpTheme({ value: 'light' })
    expect(fn1).toHaveBeenCalledOnce()
    expect(fn2).toHaveBeenCalledOnce()
  })

  it('unsubscribe stops listener from firing', async () => {
    const adapter = makeAdapter()
    const { settingsState } = await freshState(adapter)
    const fn = vi.fn()
    const unsub = settingsState.onChange('ntpTheme', fn)
    unsub()
    settingsState.setNtpTheme({ value: 'dark' })
    expect(fn).not.toHaveBeenCalled()
  })

  it('set* persists to the adapter', async () => {
    const adapter = makeAdapter()
    const { settingsState } = await freshState(adapter)
    const theme = { value: 'dark', autoSwitch: true, autoSwitchType: 'time', darkModeStart: 20, darkModeEnd: 6 }
    settingsState.setNtpTheme(theme)
    expect(adapter.set).toHaveBeenCalledWith('ntp_theme', theme)
  })
})
