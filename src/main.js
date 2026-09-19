import * as THREE from 'three'
import { createScene } from './scene/setup.js'
import { addLighting } from './scene/lighting.js'
import { buildSystem } from './scene/sync.js'
import { createSimTime } from './sim/time.js'
import { createTimeControls } from './ui/timeControls.js'
import { createTooltip } from './ui/tooltip.js'
import { createPicker } from './interaction/picker.js'
import { SUN, PLANETS } from './data/defaults.js'

const { renderer, scene, camera, controls } = createScene()
addLighting(scene)

scene.background = new THREE.Color(0x101820)

const system = buildSystem(scene, [SUN, ...PLANETS])
const simTime = createSimTime()
const timeControls = createTimeControls(document.getElementById('ui'), simTime)
const tooltip = createTooltip(document.getElementById('tooltip'))
const clock = new THREE.Clock()

const pickables = [
  system.sun,
  ...system.planets.flatMap((planet) => [planet.mesh, planet.orbitLine]),
]

const picker = createPicker({
  camera,
  domElement: renderer.domElement,
  getPickables: () => pickables,
  onHover: (entry) => {
    if (entry) tooltip.show(entry.record)
    else tooltip.hide()
  },
})

window.addEventListener('keydown', (event) => {
  if (event.code !== 'Space') return
  if (['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return
  event.preventDefault()
  simTime.setPaused(!simTime.isPaused())
})

renderer.setAnimationLoop(() => {
  simTime.advance(clock.getDelta())
  system.update(simTime.getDays())
  timeControls.update()
  controls.update()
  picker.update()
  renderer.render(scene, camera)
})
