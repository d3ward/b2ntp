import { describe, it, expect, vi, beforeEach } from 'vitest'

let _mockWeatherConfig = { location: 'London' }
let _mockWidgets = { layout: { left: [], right: [] }, settings: {} }
let _mockStore = {}

vi.mock('../../settings/state.js', () => ({
  settingsState: {
    getWeatherConfig: vi.fn(() => _mockWeatherConfig),
    getWidgets: vi.fn(() => _mockWidgets),
    onChange: vi.fn(),
  },
}))

vi.mock('../../components/localStorage.js', () => ({
  storage: {
    get: vi.fn((key) => (key in _mockStore ? _mockStore[key] : null)),
    set: vi.fn((key, value) => { _mockStore[key] = value }),
  },
}))

const { initWeather, settingsSchema } = await import('./widget.js')

const FAKE_WTTR_RESPONSE = {
  current_condition: [{
    temp_C: '10', temp_F: '50',
    weatherCode: '113', weatherDesc: [{ value: 'Sunny' }],
    winddirDegree: '90', windspeedKmph: '5', humidity: '40',
  }],
  weather: [{ maxtempC: '15', maxtempF: '59', mintempC: '5', mintempF: '41' }],
  nearest_area: [{ areaName: [{ value: 'London' }] }],
}

beforeEach(() => {
  _mockWeatherConfig = { location: 'London' }
  _mockWidgets = { layout: { left: [], right: [] }, settings: {} }
  _mockStore = {}
  vi.clearAllMocks()
  global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve(FAKE_WTTR_RESPONSE) }))
})

describe('settingsSchema', () => {
  it('declares a units select defaulting to Celsius', () => {
    expect(settingsSchema.units.type).toBe('select')
    expect(settingsSchema.units.default).toBe('C')
  })
})

describe('initWeather — units', () => {
  it('renders Celsius by default', async () => {
    const container = document.createElement('div')
    initWeather({ container })
    await vi.waitFor(() => {
      expect(container.querySelector('.wth_t').innerHTML).toContain('10')
    })
    expect(container.querySelector('.wth_t').innerHTML).toContain('℃')
  })

  it('renders Fahrenheit when units is overridden to F', async () => {
    _mockWidgets = { layout: { left: [], right: [] }, settings: { weather: { units: 'F' } } }
    const container = document.createElement('div')
    initWeather({ container })
    await vi.waitFor(() => {
      expect(container.querySelector('.wth_t').innerHTML).toContain('50')
    })
    expect(container.querySelector('.wth_t').innerHTML).toContain('℉')
  })

  it('shows the placeholder when no location is set', () => {
    _mockWeatherConfig = { location: '' }
    const container = document.createElement('div')
    initWeather({ container })
    expect(container.querySelector('.wth_s').style.opacity).toBe('1')
  })
})
