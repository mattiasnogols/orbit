import { createBodyForm } from './bodyForm.js'

const YEAR_DAYS = 365.26
const NEW_PLANET_DISTANCE_AU = 2.2

function nextPlanetIndex(bodies) {
  let index = 1
  while (bodies.some((body) => body.id === `planet-${index}`)) index += 1
  return index
}

function newPlanetRecord(bodies) {
  const index = nextPlanetIndex(bodies)
  return {
    id: `planet-${index}`,
    type: 'planet',
    parentId: null,
    name: `New planet ${index}`,
    radiusKm: 5000,
    distanceAU: NEW_PLANET_DISTANCE_AU,
    periodDays: Math.round(YEAR_DAYS * Math.pow(NEW_PLANET_DISTANCE_AU, 1.5)),
    rotationHours: 24,
    axialTiltDeg: 0,
    color: '#9ad0f5',
    texture: null,
    ringTexture: null,
    startAngle: 0,
  }
}

function nextMoonIndex(bodies) {
  let index = 1
  while (bodies.some((body) => body.id === `moon-${index}`)) index += 1
  return index
}

function newMoonRecord(parent, bodies) {
  const index = nextMoonIndex(bodies)
  return {
    id: `moon-${index}`,
    type: 'moon',
    parentId: parent.id,
    name: `New moon ${index}`,
    radiusKm: 1000,
    distanceKm: 300000,
    periodDays: 30,
    rotationHours: 24,
    axialTiltDeg: 0,
    color: '#c9c9c9',
    texture: null,
    ringTexture: null,
    startAngle: 0,
  }
}

function createRow(record, { onFocus, onDelete, onAddMoon }) {
  const row = document.createElement('li')
  row.className = record.type === 'moon' ? 'body-row moon' : 'body-row'

  const name = document.createElement('span')
  name.className = 'body-name'
  name.textContent = record.name
  name.title = record.name

  const actions = document.createElement('div')
  actions.className = 'body-actions'

  const focus = document.createElement('button')
  focus.type = 'button'
  focus.className = 'body-action'
  focus.textContent = 'Focus'
  focus.addEventListener('click', () => onFocus?.(record.id))

  actions.append(focus)

  if (onAddMoon) {
    const addMoon = document.createElement('button')
    addMoon.type = 'button'
    addMoon.className = 'body-action'
    addMoon.textContent = '+ Moon'
    addMoon.addEventListener('click', () => onAddMoon(record))
    actions.append(addMoon)
  }

  const remove = document.createElement('button')
  remove.type = 'button'
  remove.className = 'body-action danger'
  remove.textContent = 'Delete'
  remove.addEventListener('click', () => {
    if (window.confirm(`Delete ${record.name}?`)) onDelete?.(record.id)
  })

  actions.append(remove)
  row.append(name, actions)
  return { row, name }
}

export function createPanel(container, store, { onFocus } = {}) {
  const root = document.createElement('aside')
  root.className = 'panel'

  const header = document.createElement('header')
  header.className = 'panel-header'

  const title = document.createElement('h2')
  title.className = 'panel-title'
  title.textContent = 'Solar system'

  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className = 'panel-toggle'
  toggle.textContent = '−'
  toggle.setAttribute('aria-expanded', 'true')
  toggle.setAttribute('aria-label', 'Collapse panel')
  toggle.addEventListener('click', () => {
    const collapsed = root.classList.toggle('collapsed')
    toggle.textContent = collapsed ? '+' : '−'
    toggle.setAttribute('aria-expanded', String(!collapsed))
  })

  const body = document.createElement('div')
  body.className = 'panel-body'

  const list = document.createElement('ul')
  list.className = 'body-list'

  const form = createBodyForm(store)

  const actions = document.createElement('div')
  actions.className = 'panel-actions'

  const add = document.createElement('button')
  add.type = 'button'
  add.textContent = '+ Add planet'
  add.addEventListener('click', () => store.add(newPlanetRecord(store.getBodies())))

  const restore = document.createElement('button')
  restore.type = 'button'
  restore.textContent = 'Restore defaults'
  restore.addEventListener('click', () => store.reset())

  const rowsById = new Map()

  function renderList() {
    rowsById.clear()
    const records = store.getBodies()
    const planets = records
      .filter((record) => record.type === 'planet')
      .sort((a, b) => a.distanceAU - b.distanceAU)

    const moonsByParent = new Map()
    for (const moon of records.filter((record) => record.type === 'moon')) {
      const siblings = moonsByParent.get(moon.parentId) ?? []
      siblings.push(moon)
      moonsByParent.set(moon.parentId, siblings)
    }

    const rows = []
    for (const planet of planets) {
      const moons = (moonsByParent.get(planet.id) ?? []).sort(
        (a, b) => a.distanceKm - b.distanceKm,
      )
      const entries = [
        {
          record: planet,
          onAddMoon: (parent) => store.add(newMoonRecord(parent, store.getBodies())),
        },
        ...moons.map((moon) => ({ record: moon })),
      ]

      for (const entry of entries) {
        const { row, name } = createRow(entry.record, {
          onFocus,
          onDelete: (id) => store.remove(id),
          onAddMoon: entry.onAddMoon,
        })
        row.addEventListener('click', (event) => {
          if (event.target.closest('button')) return
          store.select(entry.record.id)
        })
        rowsById.set(entry.record.id, { row, name })
        rows.push(row)
      }
    }

    list.replaceChildren(...rows)
  }

  function applySelection() {
    const selectedId = store.getSelection()
    for (const [id, entry] of rowsById) {
      entry.row.classList.toggle('selected', id === selectedId)
    }

    const record = selectedId ? store.get(selectedId) : null
    if (!record) {
      form.hide()
      return
    }

    form.show(record)
    rowsById.get(selectedId)?.row.scrollIntoView({ block: 'nearest' })
  }

  store.subscribe(({ kind, id }) => {
    if (kind === 'add' || kind === 'remove' || kind === 'reset') {
      renderList()
      applySelection()
      return
    }

    if (kind === 'update') {
      const entry = rowsById.get(id)
      const record = store.get(id)
      if (entry && record) {
        entry.name.textContent = record.name
        entry.name.title = record.name
      }
      if (id === store.getSelection() && record) form.show(record)
      return
    }

    if (kind === 'select') applySelection()
  })

  header.append(title, toggle)
  actions.append(add, restore)
  body.append(list, form.element, actions)
  root.append(header, body)
  container.append(root)

  renderList()
  applySelection()
}
