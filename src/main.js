import * as THREE from 'three'
import { createScene } from './scene/setup.js'
import { addLighting } from './scene/lighting.js'

const { renderer, scene, camera, controls } = createScene()
addLighting(scene)

scene.background = new THREE.Color(0x101820)

const testSphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 48, 32),
  new THREE.MeshStandardMaterial({ color: 0xffcc33, roughness: 0.8 }),
)
testSphere.position.set(3, 0, 0)
scene.add(testSphere)

renderer.setAnimationLoop(() => {
  controls.update()
  renderer.render(scene, camera)
})
