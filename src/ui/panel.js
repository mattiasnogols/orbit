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

function createRow(record, { onFocus, onDelete }) {
  const row = document.createElement('li')
  row.className = 'body-row'

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

  const remove = document.createElement('button')
  remove.type = 'button'
  remove.className = 'body-action danger'
  remove.textContent = 'Delete'
  remove.addEventListener('click', () => {
    if (window.confirm(`Delete ${record.name}?`)) onDelete?.(record.id)
  })

  actions.append(focus, remove)
  row.append(name, actions)
  return row
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

  function renderList() {
    const planets = store
      .getBodies()
      .filter((record) => record.type === 'planet')
      .sort((a, b) => a.distanceAU - b.distanceAU)
    list.replaceChildren(
      ...planets.map((record) =>
        createRow(record, {
          onFocus,
          onDelete: (id) => store.remove(id),
        }),
      ),
    )
  }

  store.subscribe(({ kind }) => {
    if (kind === 'add' || kind === 'remove' || kind === 'reset') renderList()
  })

  header.append(title, toggle)
  actions.append(add, restore)
  body.append(list, actions)
  root.append(header, body)
  container.append(root)

  renderList()
}
