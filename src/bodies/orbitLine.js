import * as THREE from 'three'

const SEGMENTS = 128

export function createOrbitLine(radius, color = 0xffffff) {
  const points = []
  for (let i = 0; i < SEGMENTS; i += 1) {
    const angle = (i / SEGMENTS) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 })
  return new THREE.LineLoop(geometry, material)
}
