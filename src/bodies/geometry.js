import * as THREE from 'three'

const SPHERE_WIDTH_SEGMENTS = 48
const SPHERE_HEIGHT_SEGMENTS = 32
const ORBIT_SEGMENTS = 128

export const SPHERE_GEOMETRY = new THREE.SphereGeometry(
  1,
  SPHERE_WIDTH_SEGMENTS,
  SPHERE_HEIGHT_SEGMENTS,
)

export const ORBIT_GEOMETRY = (() => {
  const points = []
  for (let i = 0; i < ORBIT_SEGMENTS; i += 1) {
    const angle = (i / ORBIT_SEGMENTS) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
})()
