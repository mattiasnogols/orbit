import * as THREE from 'three'
import { createScene } from './scene/setup.js'

const { renderer, scene, camera, controls } = createScene()

scene.background = new THREE.Color(0x101820)

renderer.setAnimationLoop(() => {
  controls.update()
  renderer.render(scene, camera)
})
