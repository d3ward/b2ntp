import { initTabs } from '../blank/tabs.js'
import { initWeather } from '../blank/weather/widget.js'
import { initClock } from '../blank/clock.js'
import { initQuickNote } from '../blank/qnote.js'

export const WIDGETS = {
  tabs: {
    id: 'tabs',
    label: 'Tabs',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"/><path d="M3 14m0 1a1 1 0 0 1 1 -1h8a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1z"/></svg>`,
    defaultSide: 'left',
    init: initTabs,
  },
  weather: {
    id: 'weather',
    label: 'Weather',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-12"/></svg>`,
    defaultSide: 'right',
    init: initWeather,
  },
  clock: {
    id: 'clock',
    label: 'Clock',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/></svg>`,
    defaultSide: null,
    init: initClock,
  },
  qnote: {
    id: 'qnote',
    label: 'Quick Note',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"/><path d="M9 7l6 0"/><path d="M9 11l6 0"/><path d="M9 15l4 0"/></svg>`,
    defaultSide: null,
    init: initQuickNote,
  },
};
