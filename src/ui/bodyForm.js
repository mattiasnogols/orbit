import { formatAuShort, formatKm, formatPeriod } from './format.js'

const SLIDER_STEPS = 1000
const SIZE = { min: 500, max: 150000, log: true }
const DISTANCE = { min: 0.2, max: 35, log: true }
const PERIOD = { min: 10, max: 100000, log: true }

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

function createSliderField(label, config) {
  const wrapper = document.createElement('label')
  wrapper.className = 'field'

  const head = document.createElement('span')
  head.className = 'field-head'

  const title = document.createElement('span')
  title.textContent = label

  const value = document.createElement('span')
  value.className = 'field-value'

  const slider = document.createElement('input')
  slider.type = 'range'
  slider.min = '0'
  slider.max = String(SLIDER_STEPS)
  slider.step = '1'

  head.append(title, value)
  wrapper.append(head, slider)
  return { wrapper, title, slider, value }
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

  const row = document.createElement('div')
  row.className = 'field-row'
  row.append(nameField, colorField)

  const size = createSliderField('Diameter', SIZE)
  const distance = createSliderField('Distance from Sun', DISTANCE)
  const period = createSliderField('Year length', PERIOD)

  function commit(changes) {
    const id = store.getSelection()
    if (id) store.update(id, changes)
  }

  name.addEventListener('input', () => commit({ name: name.value }))
  name.addEventListener('blur', () => {
    if (name.value.trim() === '') {
      name.value = 'Unnamed'
      commit({ name: 'Unnamed' })
    }
  })

  color.addEventListener('input', () => commit({ color: color.value }))

  size.slider.addEventListener('input', () => {
    const diameter = Math.round(fromSlider(Number(size.slider.value), SIZE) / 10) * 10
    size.value.textContent = formatKm(diameter)
    commit({ radiusKm: diameter / 2 })
  })

  distance.slider.addEventListener('input', () => {
    const au = Number(fromSlider(Number(distance.slider.value), DISTANCE).toFixed(3))
    distance.value.textContent = formatAuShort(au)
    commit({ distanceAU: au })
  })

  period.slider.addEventListener('input', () => {
    const days = Math.round(fromSlider(Number(period.slider.value), PERIOD))
    period.value.textContent = formatPeriod(days)
    commit({ periodDays: days })
  })

  element.append(heading, row, size.wrapper, distance.wrapper, period.wrapper)

  function show(record) {
    element.hidden = false
    heading.textContent = `Edit ${record.name}`
    distance.title.textContent =
      record.type === 'moon' ? 'Distance from planet' : 'Distance from Sun'

    if (document.activeElement !== name) name.value = record.name
    if (document.activeElement !== color) color.value = record.color

    if (document.activeElement !== size.slider) {
      const diameter = record.radiusKm * 2
      size.slider.value = String(toSlider(diameter, SIZE))
      size.value.textContent = formatKm(diameter)
    }
    if (document.activeElement !== distance.slider) {
      distance.slider.value = String(toSlider(record.distanceAU, DISTANCE))
      distance.value.textContent = formatAuShort(record.distanceAU)
    }
    if (document.activeElement !== period.slider) {
      period.slider.value = String(toSlider(record.periodDays, PERIOD))
      period.value.textContent = formatPeriod(record.periodDays)
    }
  }

  function hide() {
    element.hidden = true
  }

  return { element, show, hide }
}
