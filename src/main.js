import * as THREE from 'three'
import { createScene } from './scene/setup.js'
import { addLighting } from './scene/lighting.js'

const { renderer, scene, camera, controls } = createScene()
addLighting(scene)

scene.background = new THREE.Color(0x101820)

renderer.setAnimationLoop(() => {
  controls.update()
  renderer.render(scene, camera)
})
