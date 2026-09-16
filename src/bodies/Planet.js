import * as THREE from 'three'
import { auToScene, kmToScene } from '../sim/scaling.js'
import { orbitPosition } from '../sim/orbit.js'
import { createOrbitLine } from './orbitLine.js'

const SPHERE_GEOMETRY = new THREE.SphereGeometry(1, 48, 32)

export function createPlanet(record) {
  const sceneRadius = kmToScene(record.radiusKm)
  const orbitRadius = auToScene(record.distanceAU)

  const anchor = new THREE.Object3D()

  const mesh = new THREE.Mesh(
    SPHERE_GEOMETRY,
    new THREE.MeshStandardMaterial({ color: record.color, roughness: 0.9 }),
  )
  mesh.scale.setScalar(sceneRadius)
  anchor.add(mesh)

  const orbitLine = createOrbitLine(orbitRadius, record.color)

  function update(simDays) {
    const { x, z } = orbitPosition({
      radius: orbitRadius,
      startAngle: record.startAngle,
      periodDays: record.periodDays,
      simDays,
    })
    anchor.position.set(x, 0, z)
  }

  return { anchor, mesh, orbitLine, update }
}
