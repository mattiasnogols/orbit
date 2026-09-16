import * as THREE from 'three'

export function addLighting(scene) {
  const sunLight = new THREE.PointLight(0xfff3d6, 2, 0, 0)
  sunLight.position.set(0, 0, 0)
  scene.add(sunLight)

  const ambient = new THREE.AmbientLight(0xffffff, 0.15)
  scene.add(ambient)
}
