import * as THREE from 'three'

const LINE_HIT_RADIUS = 0.6
const BASE_LINE_OPACITY = 0.35
const HOVER_LINE_OPACITY = 0.9
const HOVER_EMISSIVE = 0x444444
const HOVER_BASIC_COLOR = 0xffffff
const CLICK_TOLERANCE = 5

function sameEntry(a, b) {
  if (!a && !b) return true
  return Boolean(a && b && a.object === b.object)
}

export function createPicker({ camera, domElement, getPickables, onHover, onSelect }) {
  const raycaster = new THREE.Raycaster()
  raycaster.params.Line.threshold = LINE_HIT_RADIUS
  const pointer = new THREE.Vector2()
  let pointerInside = false
  let hovered = null
  let selected = null
  let pressed = false
  let pressX = 0
  let pressY = 0

  function setHighlight(entry, on) {
    if (!entry) return
    const material = entry.object.material
    if (entry.object.isLine || entry.object.isLineLoop) {
      material.opacity = on ? HOVER_LINE_OPACITY : BASE_LINE_OPACITY
    } else if (material.emissive) {
      material.emissive.setHex(on ? HOVER_EMISSIVE : 0x000000)
    } else if (material.color) {
      if (on && entry.object.userData.baseColor === undefined) {
        entry.object.userData.baseColor = material.color.getHex()
      }
      if (entry.object.userData.baseColor !== undefined) {
        material.color.setHex(on ? HOVER_BASIC_COLOR : entry.object.userData.baseColor)
      }
    }
  }

  function pick() {
    raycaster.setFromCamera(pointer, camera)
    const intersections = raycaster.intersectObjects(getPickables(), false)
    for (const hit of intersections) {
      if (hit.object.userData.record) {
        return { object: hit.object, record: hit.object.userData.record }
      }
    }
    return null
  }

  function setHovered(next) {
    if (sameEntry(hovered, next)) return
    setHighlight(hovered, false)
    hovered = next
    setHighlight(hovered, true)
    domElement.style.cursor = next ? 'pointer' : ''
    if (onHover) onHover(next)
  }

  function updatePointer(event) {
    const rect = domElement.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  function onPointerEnter(event) {
    pointerInside = true
    updatePointer(event)
  }

  function onPointerLeave() {
    pointerInside = false
    setHovered(null)
  }

  function onPointerMove(event) {
    updatePointer(event)
    pointerInside = true
  }

  function onPointerDown(event) {
    pressed = true
    pressX = event.clientX
    pressY = event.clientY
    updatePointer(event)
  }

  function onPointerUp(event) {
    if (!pressed) return
    pressed = false
    const distance = Math.hypot(event.clientX - pressX, event.clientY - pressY)
    if (distance > CLICK_TOLERANCE) return
    updatePointer(event)
    selected = pick()
    if (onSelect) onSelect(selected)
  }

  function onKeyDown(event) {
    if (event.key !== 'Escape' || !selected) return
    selected = null
    if (onSelect) onSelect(null)
  }

  domElement.addEventListener('pointerenter', onPointerEnter)
  domElement.addEventListener('pointerleave', onPointerLeave)
  domElement.addEventListener('pointermove', onPointerMove)
  domElement.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('keydown', onKeyDown)

  function update() {
    if (!pointerInside) return
    setHovered(pick())
  }

  return { update }
}
