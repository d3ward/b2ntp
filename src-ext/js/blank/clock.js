import { settingsState } from '../settings/state.js'
import { resolveWidgetSettings } from '../widgets/resolver.js'

export const settingsSchema = {
  showSeconds: { type: 'bool', default: false, label: 'Show seconds' },
  timeFormat: {
    type: 'select',
    default: '24',
    label: 'Time format',
    options: [['12', '12-hour (AM/PM)'], ['24', '24-hour']],
  },
  dateFormat: {
    type: 'select',
    default: 'auto',
    label: 'Date format',
    options: [['auto', 'Auto (based on locale)'], ['en-US', 'en-US']],
  },
}

// Descriptor-shaped just enough for resolveWidgetSettings -- importing the
// real descriptor from registry.js would be circular (registry.js imports
// initClock from here).
const CLOCK_DESCRIPTOR = { id: 'clock', settings: settingsSchema }

let _intervalId = null

export function initClock({ container }) {
  document.body.classList.add('clock-widget-active')

  const timeEl = document.createElement('span')
  timeEl.className = 'clock-widget-time'
  const dateEl = document.createElement('span')
  dateEl.className = 'clock-widget-date'
  container.appendChild(timeEl)
  container.appendChild(dateEl)

  function tick() {
    const now = new Date()
    const settings = resolveWidgetSettings(CLOCK_DESCRIPTOR, settingsState.getWidgets())
    const userLocale = settings.dateFormat === 'auto' ? navigator.language || 'en-US' : settings.dateFormat
    timeEl.textContent = now.toLocaleTimeString(userLocale, {
      hour: '2-digit',
      minute: '2-digit',
      second: settings.showSeconds ? '2-digit' : undefined,
      hour12: settings.timeFormat === '12',
    })
    dateEl.textContent = now.toLocaleDateString(userLocale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  tick()
  if (_intervalId !== null) clearInterval(_intervalId)
  _intervalId = setInterval(tick, 1000)
}
