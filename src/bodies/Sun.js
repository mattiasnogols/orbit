import * as THREE from 'three'
import { SUN_RADIUS } from '../config.js'
import { loadTexture } from '../scene/textures.js'

export function createSun(record) {
  const material = new THREE.MeshBasicMaterial({ color: record.color })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 48, 32), material)
  mesh.userData.record = record

  if (record.texture) {
    loadTexture(record.texture, (texture) => {
      material.map = texture
      material.color.set(0xffffff)
      material.needsUpdate = true
    })
  }

  return mesh
}
