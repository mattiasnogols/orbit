import * as THREE from 'three'
import { auToScene, kmToScene, moonDistanceToScene } from '../sim/scaling.js'
import { orbitPosition } from '../sim/orbit.js'
import { createOrbitLine } from './orbitLine.js'

export function createOrbitingBody(record, { parentRadius = () => 0 } = {}) {
  const anchor = new THREE.Object3D()

  const tilt = new THREE.Object3D()
  anchor.add(tilt)

  const material = new THREE.MeshStandardMaterial({ color: record.color, roughness: 0.9 })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), material)
  mesh.userData.record = record
  tilt.add(mesh)

  const orbitLine = createOrbitLine(record.color)
  orbitLine.userData.record = record

  function orbitRadius() {
    if (record.type === 'moon') {
      return parentRadius() + moonDistanceToScene(record.distanceKm)
    }
    return auToScene(record.distanceAU)
  }

  function refresh() {
    tilt.rotation.z = THREE.MathUtils.degToRad(record.axialTiltDeg ?? 0)
    mesh.scale.setScalar(kmToScene(record.radiusKm))
    material.color.set(record.color)
    orbitLine.scale.setScalar(orbitRadius())
  }

  function update(simDays) {
    const { x, z } = orbitPosition({
      radius: orbitRadius(),
      startAngle: record.startAngle,
      periodDays: record.periodDays,
      simDays,
    })
    anchor.position.set(x, 0, z)

    if (record.rotationHours) {
      const rotationDays = record.rotationHours / 24
      mesh.rotation.y = (2 * Math.PI * simDays) / rotationDays
    }
  }

  refresh()

  return { anchor, tilt, mesh, orbitLine, refresh, update }
}
