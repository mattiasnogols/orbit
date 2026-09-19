import * as THREE from 'three'
import { SUN_RADIUS } from '../config.js'

export function createSun(record) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_RADIUS, 48, 32),
    new THREE.MeshBasicMaterial({ color: record.color }),
  )
  mesh.userData.record = record
  return mesh
}
