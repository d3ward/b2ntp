import { describe, it, expect, vi } from 'vitest'
import { renderSettingsForm } from './schemaForm.js'

describe('renderSettingsForm — field types', () => {
  it('renders a bool field as a checkbox reflecting the current value', () => {
    const schema = { showSeconds: { type: 'bool', default: false, label: 'Show seconds' } }
    const form = renderSettingsForm(schema, { showSeconds: true }, vi.fn())
    const input = form.querySelector('input[type="checkbox"]')
    expect(input).not.toBeNull()
    expect(input.checked).toBe(true)
    expect(form.querySelector('.schema-field-label').textContent).toBe('Show seconds')
  })

  it('falls back to the schema default when no value is provided', () => {
    const schema = { showSeconds: { type: 'bool', default: true, label: 'Show seconds' } }
    const form = renderSettingsForm(schema, {}, vi.fn())
    expect(form.querySelector('input[type="checkbox"]').checked).toBe(true)
  })

  it('calls onChange with the new boolean on toggle', () => {
    const onChange = vi.fn()
    const schema = { showSeconds: { type: 'bool', default: false } }
    const form = renderSettingsForm(schema, { showSeconds: false }, onChange)
    const input = form.querySelector('input[type="checkbox"]')
    input.checked = true
    input.dispatchEvent(new Event('change'))
    expect(onChange).toHaveBeenCalledWith('showSeconds', true)
  })

  it('renders a select field with its options and current value', () => {
    const schema = {
      units: { type: 'select', default: 'C', options: [['C', 'Celsius'], ['F', 'Fahrenheit']] },
    }
    const form = renderSettingsForm(schema, { units: 'F' }, vi.fn())
    const select = form.querySelector('select')
    expect(select.value).toBe('F')
    expect([...select.options].map((o) => o.value)).toEqual(['C', 'F'])
    expect([...select.options].map((o) => o.textContent)).toEqual(['Celsius', 'Fahrenheit'])
  })

  it('calls onChange with the new string on select change', () => {
    const onChange = vi.fn()
    const schema = { units: { type: 'select', default: 'C', options: [['C', 'C'], ['F', 'F']] } }
    const form = renderSettingsForm(schema, { units: 'C' }, onChange)
    const select = form.querySelector('select')
    select.value = 'F'
    select.dispatchEvent(new Event('change'))
    expect(onChange).toHaveBeenCalledWith('units', 'F')
  })

  it('renders a text field with placeholder and value', () => {
    const schema = { location: { type: 'text', default: '', placeholder: 'City' } }
    const form = renderSettingsForm(schema, { location: 'Paris' }, vi.fn())
    const input = form.querySelector('input[type="text"]')
    expect(input.value).toBe('Paris')
    expect(input.placeholder).toBe('City')
  })

  it('calls onChange with the new string on text change', () => {
    const onChange = vi.fn()
    const schema = { location: { type: 'text', default: '' } }
    const form = renderSettingsForm(schema, { location: '' }, onChange)
    const input = form.querySelector('input[type="text"]')
    input.value = 'Berlin'
    input.dispatchEvent(new Event('change'))
    expect(onChange).toHaveBeenCalledWith('location', 'Berlin')
  })

  it('renders a number field with min/max/step and calls onChange with a Number', () => {
    const onChange = vi.fn()
    const schema = { volume: { type: 'number', default: 5, min: 0, max: 10, step: 1 } }
    const form = renderSettingsForm(schema, { volume: 5 }, onChange)
    const input = form.querySelector('input[type="number"]')
    expect(input.min).toBe('0')
    expect(input.max).toBe('10')
    expect(input.step).toBe('1')
    input.value = '8'
    input.dispatchEvent(new Event('change'))
    expect(onChange).toHaveBeenCalledWith('volume', 8)
  })

  it('renders a range field and calls onChange on input with a Number', () => {
    const onChange = vi.fn()
    const schema = { brightness: { type: 'range', default: 50, min: 0, max: 100, step: 10 } }
    const form = renderSettingsForm(schema, { brightness: 50 }, onChange)
    const input = form.querySelector('input[type="range"]')
    expect(input.min).toBe('0')
    expect(input.max).toBe('100')
    input.value = '70'
    input.dispatchEvent(new Event('input'))
    expect(onChange).toHaveBeenCalledWith('brightness', 70)
  })

  it('falls back to a text control for an unknown type', () => {
    const schema = { mystery: { type: 'wat', default: 'x' } }
    const form = renderSettingsForm(schema, { mystery: 'x' }, vi.fn())
    expect(form.querySelector('input[type="text"]')).not.toBeNull()
  })

  it('renders an optional hint', () => {
    const schema = { location: { type: 'text', default: '', hint: 'City or lat,lon' } }
    const form = renderSettingsForm(schema, {}, vi.fn())
    expect(form.querySelector('.schema-field-hint').textContent).toBe('City or lat,lon')
  })

  it('omits the hint element when none is declared', () => {
    const schema = { location: { type: 'text', default: '' } }
    const form = renderSettingsForm(schema, {}, vi.fn())
    expect(form.querySelector('.schema-field-hint')).toBeNull()
  })

  it('renders one field per schema key, in order', () => {
    const schema = {
      a: { type: 'text', default: '' },
      b: { type: 'bool', default: false },
    }
    const form = renderSettingsForm(schema, {}, vi.fn())
    expect(form.querySelectorAll('.schema-field')).toHaveLength(2)
  })

  it('renders nothing for an empty schema', () => {
    const form = renderSettingsForm({}, {}, vi.fn())
    expect(form.querySelectorAll('.schema-field')).toHaveLength(0)
  })
})
