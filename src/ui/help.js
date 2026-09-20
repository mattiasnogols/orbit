const CONTROLS = [
  ['Drag', 'orbit the camera'],
  ['Scroll', 'zoom in and out'],
  ['Hover', 'preview a body'],
  ['Click', 'select and edit'],
  ['Focus', 'follow a body'],
  ['Space', 'pause / play'],
]

export function createHelp(container) {
  const root = document.createElement('div')
  root.className = 'help'

  const title = document.createElement('h2')
  title.className = 'help-title'
  title.textContent = 'Controls'

  const list = document.createElement('dl')
  list.className = 'help-list'

  for (const [key, description] of CONTROLS) {
    const term = document.createElement('dt')
    term.textContent = key
    const text = document.createElement('dd')
    text.textContent = description
    list.append(term, text)
  }

  root.append(title, list)
  container.append(root)
}
