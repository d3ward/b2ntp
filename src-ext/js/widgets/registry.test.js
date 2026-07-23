import { describe, it, expect } from 'vitest'
import { WIDGETS } from './registry'

const REQUIRED_FIELDS = ['id', 'label', 'icon', 'placement', 'settings', 'init']
const VALID_REGIONS = ['left', 'main', 'right']

describe('WIDGETS registry shape', () => {
  it('exports an object with all four widget IDs', () => {
    expect(Object.keys(WIDGETS)).toEqual(expect.arrayContaining(['tabs', 'weather', 'clock', 'qnote']))
    expect(Object.keys(WIDGETS)).toHaveLength(4)
  })

  for (const id of ['tabs', 'weather', 'clock', 'qnote']) {
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
