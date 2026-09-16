import * as THREE from 'three'
import { createScene } from './scene/setup.js'
import { addLighting } from './scene/lighting.js'
import { buildSystem } from './scene/sync.js'
import { createSimTime } from './sim/time.js'
import { SUN, PLANETS } from './data/defaults.js'

const { renderer, scene, camera, controls } = createScene()
addLighting(scene)

scene.background = new THREE.Color(0x101820)

const system = buildSystem(scene, [SUN, ...PLANETS])
const simTime = createSimTime()
const clock = new THREE.Clock()

renderer.setAnimationLoop(() => {
  simTime.advance(clock.getDelta())
  system.update(simTime.getDays())
  controls.update()
  renderer.render(scene, camera)
})
