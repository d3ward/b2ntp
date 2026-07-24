import { initTabs } from '../blank/tabs.js'
import { initWeather, settingsSchema as weatherSettingsSchema } from '../blank/weather/widget.js'
import { initClock, settingsSchema as clockSettingsSchema } from '../blank/clock.js'
import { initQuickNote } from '../blank/qnote.js'
import { initSearch } from '../blank/search.js'
import { initBookmarks } from '../blank/bookmarks.js'

// Not removable, not movable out of `main` (spec.md §4/§6). Enforcement lives
// in the arrangement UX (ticket 07/08); this set is the shared source of
// truth it and any other host code checks against.
export const CORE_WIDGET_IDS = new Set(['search', 'bookmarks'])

export const WIDGETS = {
  search: {
    id: 'search',
    label: 'Search',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/></svg>`,
    placement: { region: 'main', order: 0 },
    scrolls: false,
    // §7 (ticket 09/mobile reflow): the only per-widget say in the main
    // header's mobile stickiness -- sticky is otherwise a `main` region rule,
    // not a widget flag, and stays sticky on mobile unless this is off.
    settings: {
      mobileSticky: { type: 'bool', default: true, label: 'Stay sticky on mobile' },
    },
    init: initSearch,
  },
  bookmarks: {
    id: 'bookmarks',
    label: 'Bookmarks',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h6a2 2 0 0 1 2 2v14l-5 -3l-5 3v-14a2 2 0 0 1 2 -2"/></svg>`,
    placement: { region: 'main', order: 1 },
    // Rides the page rather than scrolling internally -- its height is what
    // pins the rails (spec.md §1/§4) -- true on every viewport, mobile included.
    scrolls: false,
    settings: {},
    init: initBookmarks,
  },
  tabs: {
    id: 'tabs',
    label: 'Tabs',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"/><path d="M3 14m0 1a1 1 0 0 1 1 -1h8a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1z"/></svg>`,
    placement: { region: 'left', order: 0 },
    scrolls: true,
    settings: {},
    init: initTabs,
  },
  weather: {
    id: 'weather',
    label: 'Weather',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-12"/></svg>`,
    placement: { region: 'right', order: 0 },
    scrolls: false,
    settings: weatherSettingsSchema,
    init: initWeather,
  },
  clock: {
    id: 'clock',
    label: 'Clock',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/></svg>`,
    placement: { region: 'left', order: 1 },
    scrolls: false,
    settings: clockSettingsSchema,
    init: initClock,
  },
  qnote: {
    id: 'qnote',
    label: 'Quick Note',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"/><path d="M9 7l6 0"/><path d="M9 11l6 0"/><path d="M9 15l4 0"/></svg>`,
    placement: { region: 'right', order: 1 },
    // The textarea is user-resizable (resize: vertical) and can grow past
    // the panel's own bounds -- scrolls:true caps the panel instead of
    // clipping it.
    scrolls: true,
    settings: {},
    init: initQuickNote,
  },
};
