const OFFSET = 14
const MARGIN = 8
const KM_PER_AU = 149597870.7

function formatKm(km) {
  if (km >= 1000000) return `${(km / 1000000).toFixed(1)} million km`
  return `${Math.round(km).toLocaleString('en-US')} km`
}

function formatDistance(record) {
  if (record.type === 'moon') return formatKm(record.distanceKm)
  return `${record.distanceAU} AU · ${formatKm(record.distanceAU * KM_PER_AU)}`
}

function makeRow(label, value) {
  const line = document.createElement('div')
  line.className = 'tooltip-line'

  const key = document.createElement('span')
  key.className = 'tooltip-label'
  key.textContent = label

  const val = document.createElement('span')
  val.textContent = value

  line.append(key, val)
  return line
}

export function createTooltip(element) {
  let current = null
  let pointerX = 0
  let pointerY = 0

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX
    pointerY = event.clientY
    if (current) place()
  })

  function place() {
    const { width, height } = element.getBoundingClientRect()
    let left = pointerX + OFFSET
    let top = pointerY + OFFSET
    if (left + width > window.innerWidth - MARGIN) left = pointerX - width - OFFSET
    if (top + height > window.innerHeight - MARGIN) top = pointerY - height - OFFSET
    element.style.left = `${Math.max(left, MARGIN)}px`
    element.style.top = `${Math.max(top, MARGIN)}px`
  }

  function render(record) {
    const name = document.createElement('div')
    name.className = 'tooltip-name'
    name.textContent = record.name

    const rows = [makeRow('Diameter', formatKm(record.radiusKm * 2))]
    if (record.type === 'star') {
      rows.push(makeRow('Position', 'Centre of the system'))
    } else if (record.type === 'moon') {
      rows.push(makeRow('Orbit radius', formatDistance(record)))
    } else {
      rows.push(makeRow('Distance from Sun', formatDistance(record)))
    }

    element.replaceChildren(name, ...rows)
  }

  return {
    show(record) {
      if (record === current) return
      current = record
      render(record)
      element.hidden = false
      place()
    },
    hide() {
      if (!current) return
      current = null
      element.hidden = true
    },
  }
}
