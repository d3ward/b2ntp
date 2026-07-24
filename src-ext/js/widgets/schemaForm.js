function currentValue(key, field, values) {
  const v = values ? values[key] : undefined
  return v !== undefined ? v : field.default
}

function buildBoolControl(key, field, values, onChange) {
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.className = 'toggle toggle-primary'
  input.checked = !!currentValue(key, field, values)
  input.addEventListener('change', () => onChange(key, input.checked))
  return input
}

function buildSelectControl(key, field, values, onChange) {
  const select = document.createElement('select')
  select.className = 'select select-bordered'
  for (const [value, label] of field.options || []) {
    const option = document.createElement('option')
    option.value = value
    option.textContent = label
    select.appendChild(option)
  }
  select.value = currentValue(key, field, values)
  select.addEventListener('change', () => onChange(key, select.value))
  return select
}

function buildTextControl(key, field, values, onChange) {
  const input = document.createElement('input')
  input.type = 'text'
  input.className = 'input input-bordered'
  if (field.placeholder) input.placeholder = field.placeholder
  input.value = currentValue(key, field, values) ?? ''
  input.addEventListener('change', () => onChange(key, input.value))
  return input
}

function buildNumberControl(key, field, values, onChange) {
  const input = document.createElement('input')
  input.type = 'number'
  input.className = 'input input-bordered'
  if (field.min !== undefined) input.min = field.min
  if (field.max !== undefined) input.max = field.max
  if (field.step !== undefined) input.step = field.step
  input.value = currentValue(key, field, values)
  input.addEventListener('change', () => onChange(key, Number(input.value)))
  return input
}

function buildRangeControl(key, field, values, onChange) {
  const input = document.createElement('input')
  input.type = 'range'
  input.className = 'range'
  if (field.min !== undefined) input.min = field.min
  if (field.max !== undefined) input.max = field.max
  if (field.step !== undefined) input.step = field.step
  input.value = currentValue(key, field, values)
  input.addEventListener('input', () => onChange(key, Number(input.value)))
  return input
}

const CONTROL_BUILDERS = {
  bool: buildBoolControl,
  select: buildSelectControl,
  text: buildTextControl,
  number: buildNumberControl,
  range: buildRangeControl,
}

// Unknown `type` falls back to a plain text control (spec.md §5).
export function renderSettingsForm(schema, values, onChange) {
  const form = document.createElement('div')
  form.className = 'schema-form'

  for (const [key, field] of Object.entries(schema || {})) {
    const row = document.createElement('div')
    row.className = 'schema-field'

    const label = document.createElement('label')
    label.className = 'schema-field-label'
    label.textContent = field.label || key
    row.appendChild(label)

    const buildControl = CONTROL_BUILDERS[field.type] || buildTextControl
    row.appendChild(buildControl(key, field, values, onChange))

    if (field.hint) {
      const hint = document.createElement('p')
      hint.className = 'schema-field-hint'
      hint.textContent = field.hint
      row.appendChild(hint)
    }

    form.appendChild(row)
  }

  return form
}
