import { describe, it, expect } from 'vitest'
import { WIDGETS } from './registry'

const REQUIRED_FIELDS = ['id', 'label', 'icon', 'defaultSide', 'init']
const VALID_SIDES = ['left', 'right', null]

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

      it('defaultSide is left, right, or null', () => {
        expect(VALID_SIDES).toContain(WIDGETS[id].defaultSide)
      })

      it('init is a function', () => {
        expect(typeof WIDGETS[id].init).toBe('function')
      })
    })
  }
})

describe('WIDGETS registry defaultSide assignments', () => {
  it('tabs defaults to left', () => {
    expect(WIDGETS.tabs.defaultSide).toBe('left')
  })

  it('weather defaults to right', () => {
    expect(WIDGETS.weather.defaultSide).toBe('right')
  })

  it('clock has no default side', () => {
    expect(WIDGETS.clock.defaultSide).toBeNull()
  })

  it('qnote has no default side', () => {
    expect(WIDGETS.qnote.defaultSide).toBeNull()
  })
})
