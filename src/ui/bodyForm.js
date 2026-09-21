const SLIDER_STEPS = 1000
const SIZE = { min: 500, max: 150000, step: 10, unit: 'km', log: true }
const PLANET_DISTANCE = { min: 0.2, max: 35, step: 0.001, unit: 'AU', log: true }
const MOON_DISTANCE = { min: 10000, max: 2000000, step: 100, unit: 'km', log: true }
const PERIOD = { min: 1, max: 100000, step: 0.01, unit: 'days', log: true }

function distanceConfig(record) {
  return record.type === 'moon' ? MOON_DISTANCE : PLANET_DISTANCE
}

function toSlider(value, { min, max, log }) {
  const clamped = Math.min(Math.max(value, min), max)
  const t = log
    ? Math.log(clamped / min) / Math.log(max / min)
    : (clamped - min) / (max - min)
  return Math.round(t * SLIDER_STEPS)
}

function fromSlider(position, { min, max, log }) {
  const t = position / SLIDER_STEPS
  return log ? min * Math.pow(max / min, t) : min + t * (max - min)
}

function snap(value, { min, max, step }) {
  const clamped = Math.min(Math.max(value, min), max)
  return Number((Math.round(clamped / step) * step).toFixed(6))
}

function createSliderField(label, config) {
  const wrapper = document.createElement('label')
  wrapper.className = 'field'

  const head = document.createElement('span')
  head.className = 'field-head'

  const title = document.createElement('span')
  title.textContent = label

  const entry = document.createElement('span')
  entry.className = 'field-entry'

  const input = document.createElement('input')
  input.type = 'number'
  input.min = String(config.min)
  input.max = String(config.max)
  input.step = String(config.step)
  input.setAttribute('aria-label', label)

  const unit = document.createElement('span')
  unit.className = 'field-unit'
  unit.textContent = config.unit

  const slider = document.createElement('input')
  slider.type = 'range'
  slider.min = '0'
  slider.max = String(SLIDER_STEPS)
  slider.step = '1'
  slider.setAttribute('aria-label', `${label} slider`)

  entry.append(input, unit)
  head.append(title, entry)
  wrapper.append(head, slider)
  return { wrapper, title, slider, input, unit, config }
}

export function createBodyForm(store) {
  const element = document.createElement('form')
  element.className = 'body-form'
  element.hidden = true
  element.addEventListener('submit', (event) => event.preventDefault())

  const heading = document.createElement('h3')
  heading.className = 'form-title'

  const name = document.createElement('input')
  name.type = 'text'
  name.placeholder = 'Planet name'
  name.setAttribute('aria-label', 'Name')

  const nameField = document.createElement('label')
  nameField.className = 'field'
  const nameLabel = document.createElement('span')
  nameLabel.textContent = 'Name'
  nameField.append(nameLabel, name)

  const color = document.createElement('input')
  color.type = 'color'
  color.setAttribute('aria-label', 'Colour')

  const colorField = document.createElement('label')
  colorField.className = 'field'
  const colorLabel = document.createElement('span')
  colorLabel.textContent = 'Colour'
  colorField.append(colorLabel, color)

  const restoreTexture = document.createElement('button')
  restoreTexture.type = 'button'
  restoreTexture.className = 'texture-restore'
  restoreTexture.textContent = 'Use texture'
  restoreTexture.hidden = true

  const row = document.createElement('div')
  row.className = 'field-row'
  row.append(nameField, colorField)

  const size = createSliderField('Diameter', SIZE)
  const distance = createSliderField('Distance from Sun', PLANET_DISTANCE)
  const period = createSliderField('Year length', PERIOD)

  const texturesById = new Map()

  function currentRecord() {
    const id = store.getSelection()
    return id ? store.get(id) : null
  }

  function updateRestore() {
    const record = currentRecord()
    restoreTexture.hidden = !(record && record.texture == null && texturesById.has(record.id))
  }

  function commit(changes) {
    const id = store.getSelection()
    if (id) store.update(id, changes)
  }

  function bind(field, commitValue) {
    field.slider.addEventListener('input', () => {
      const value = snap(fromSlider(Number(field.slider.value), field.config), field.config)
      field.input.value = String(value)
      commitValue(value)
    })

    field.input.addEventListener('input', () => {
      const value = Number(field.input.value)
      if (!Number.isFinite(value)) return
      field.slider.value = String(toSlider(value, field.config))
      commitValue(value)
    })

    field.input.addEventListener('change', () => {
      const value = snap(Number(field.input.value) || field.config.min, field.config)
      field.input.value = String(value)
      field.slider.value = String(toSlider(value, field.config))
      commitValue(value)
    })
  }

  name.addEventListener('input', () => commit({ name: name.value }))
  name.addEventListener('blur', () => {
    if (name.value.trim() === '') {
      name.value = 'Unnamed'
      commit({ name: 'Unnamed' })
    }
  })

  color.addEventListener('input', () => {
    const record = currentRecord()
    if (record?.texture) texturesById.set(record.id, record.texture)
    commit({ color: color.value, texture: null })
    updateRestore()
  })

  restoreTexture.addEventListener('click', () => {
    const record = currentRecord()
    const texture = record ? texturesById.get(record.id) : null
    if (texture) commit({ texture })
    updateRestore()
  })

  bind(size, (diameter) => commit({ radiusKm: diameter / 2 }))
  bind(distance, (value) => {
    const record = currentRecord()
    if (!record) return
    commit(record.type === 'moon' ? { distanceKm: value } : { distanceAU: value })
  })
  bind(period, (days) => commit({ periodDays: days }))

  element.append(heading, row, restoreTexture, size.wrapper, distance.wrapper, period.wrapper)

  function setField(field, value) {
    if (document.activeElement !== field.slider) {
      field.slider.value = String(toSlider(value, field.config))
    }
    if (document.activeElement !== field.input) {
      field.input.value = String(Number(value.toFixed(6)))
    }
  }

  function show(record) {
    element.hidden = false
    heading.textContent = `Edit ${record.name}`

    const isMoon = record.type === 'moon'
    distance.config = distanceConfig(record)
    distance.unit.textContent = distance.config.unit
    distance.title.textContent = isMoon ? 'Distance from planet' : 'Distance from Sun'
    period.title.textContent = isMoon ? 'Orbit period' : 'Year length'

    if (document.activeElement !== name) name.value = record.name
    if (document.activeElement !== color) color.value = record.color
    if (record.texture) texturesById.set(record.id, record.texture)

    setField(size, record.radiusKm * 2)
    setField(distance, isMoon ? record.distanceKm : record.distanceAU)
    setField(period, record.periodDays)
    updateRestore()
  }

  function hide() {
    element.hidden = true
  }

  return { element, show, hide }
}
