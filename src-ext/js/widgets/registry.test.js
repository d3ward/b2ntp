import { describe, it, expect } from 'vitest'
import { WIDGETS, CORE_WIDGET_IDS } from './registry'

const REQUIRED_FIELDS = ['id', 'label', 'icon', 'placement', 'settings', 'init']
const VALID_REGIONS = ['left', 'main', 'right']
const ALL_IDS = ['tabs', 'weather', 'clock', 'qnote', 'search', 'bookmarks']

describe('WIDGETS registry shape', () => {
  it('exports an object with every widget id', () => {
    expect(Object.keys(WIDGETS)).toEqual(expect.arrayContaining(ALL_IDS))
    expect(Object.keys(WIDGETS)).toHaveLength(ALL_IDS.length)
  })

  for (const id of ALL_IDS) {
    describe(`${id} descriptor`, () => {
      it('has all required fields', () => {
        const entry = WIDGETS[id]
        for (const field of REQUIRED_FIELDS) {
          expect(entry, `missing field: ${field}`).toHaveProperty(field)
        }
      })

      it('id matches its key', () => {
        expect(WIDGETS[id].id).toBe(id)
      })

      it('label is a non-empty string', () => {
        expect(typeof WIDGETS[id].label).toBe('string')
        expect(WIDGETS[id].label.length).toBeGreaterThan(0)
      })

      it('icon is a non-empty string', () => {
        expect(typeof WIDGETS[id].icon).toBe('string')
        expect(WIDGETS[id].icon.length).toBeGreaterThan(0)
      })

      it('placement has a valid region and a numeric order', () => {
        expect(VALID_REGIONS).toContain(WIDGETS[id].placement.region)
        expect(typeof WIDGETS[id].placement.order).toBe('number')
      })

      it('does not declare defaultSide', () => {
        expect(WIDGETS[id]).not.toHaveProperty('defaultSide')
      })

      it('settings is an object', () => {
        expect(typeof WIDGETS[id].settings).toBe('object')
      })

      it('init is a function', () => {
        expect(typeof WIDGETS[id].init).toBe('function')
      })
    })
  }
})

describe('WIDGETS registry placement assignments', () => {
  it('tabs is placed in the left region', () => {
    expect(WIDGETS.tabs.placement.region).toBe('left')
  })

  it('weather is placed in the right region', () => {
    expect(WIDGETS.weather.placement.region).toBe('right')
  })

  it('clock is placed in the left region', () => {
    expect(WIDGETS.clock.placement.region).toBe('left')
  })

  it('qnote is placed in the right region', () => {
    expect(WIDGETS.qnote.placement.region).toBe('right')
  })

  it('search and bookmarks are placed in the main region, search first', () => {
    expect(WIDGETS.search.placement.region).toBe('main')
    expect(WIDGETS.bookmarks.placement.region).toBe('main')
    expect(WIDGETS.search.placement.order).toBeLessThan(WIDGETS.bookmarks.placement.order)
  })

  it('orders are unique within each region', () => {
    const byRegion = {}
    for (const descriptor of Object.values(WIDGETS)) {
      const { region, order } = descriptor.placement
      byRegion[region] = byRegion[region] || []
      byRegion[region].push(order)
    }
    for (const orders of Object.values(byRegion)) {
      expect(new Set(orders).size).toBe(orders.length)
    }
  })
})

describe('CORE_WIDGET_IDS', () => {
  it('marks exactly search and bookmarks as CORE', () => {
    expect(CORE_WIDGET_IDS).toEqual(new Set(['search', 'bookmarks']))
  })

  it('every CORE id names a real registry widget', () => {
    for (const id of CORE_WIDGET_IDS) {
      expect(WIDGETS).toHaveProperty(id)
    }
  })
})
