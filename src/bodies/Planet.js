import * as THREE from 'three'
import { auToScene, kmToScene } from '../sim/scaling.js'
import { orbitPosition } from '../sim/orbit.js'
import { createOrbitLine } from './orbitLine.js'

export function createPlanet(record) {
  const anchor = new THREE.Object3D()

  const material = new THREE.MeshStandardMaterial({ color: record.color, roughness: 0.9 })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), material)
  mesh.userData.record = record
  anchor.add(mesh)

  const orbitLine = createOrbitLine(record.color)
  orbitLine.userData.record = record

  function refresh() {
    mesh.scale.setScalar(kmToScene(record.radiusKm))
    material.color.set(record.color)
    orbitLine.scale.setScalar(auToScene(record.distanceAU))
  }

  function update(simDays) {
    const { x, z } = orbitPosition({
      radius: auToScene(record.distanceAU),
      startAngle: record.startAngle,
      periodDays: record.periodDays,
      simDays,
    })
    anchor.position.set(x, 0, z)
  }

  refresh()

  return { anchor, mesh, orbitLine, refresh, update }
}
