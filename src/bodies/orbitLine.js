import * as THREE from 'three'
import { ORBIT_GEOMETRY } from './geometry.js'

export function createOrbitLine(color = 0xffffff) {
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 })
  return new THREE.LineLoop(ORBIT_GEOMETRY, material)
}
