import { settingsState } from '../settings/state.js'

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
    const tlbData = settingsState.getTlbData()
    const userLocale = tlbData.dateFormat === 'auto' ? navigator.language || 'en-US' : 'en-US'
    timeEl.textContent = now.toLocaleTimeString(userLocale, {
      hour: '2-digit',
      minute: '2-digit',
      second: tlbData.seconds ? '2-digit' : undefined,
      hour12: tlbData.timeFormat === '12',
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
