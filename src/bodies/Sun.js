import * as THREE from 'three'
import { SUN_RADIUS } from '../config.js'
import { loadTexture } from '../scene/textures.js'
import { SPHERE_GEOMETRY } from './geometry.js'

export function createSun(record) {
  const material = new THREE.MeshBasicMaterial({ color: record.color })
  const mesh = new THREE.Mesh(SPHERE_GEOMETRY, material)
  mesh.scale.setScalar(SUN_RADIUS)
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
