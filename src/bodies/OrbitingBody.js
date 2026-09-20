import * as THREE from 'three'
import { auToScene, kmToScene, moonDistanceToScene } from '../sim/scaling.js'
import { orbitPosition } from '../sim/orbit.js'
import { loadTexture } from '../scene/textures.js'
import { createOrbitLine } from './orbitLine.js'
import { SPHERE_GEOMETRY } from './geometry.js'

const RING_INNER = 1.3
const RING_OUTER = 2.3

function createRing(record) {
  const geometry = new THREE.RingGeometry(RING_INNER, RING_OUTER, 128, 1)
  const position = geometry.attributes.position
  const uv = geometry.attributes.uv
  for (let i = 0; i < position.count; i += 1) {
    const radius = Math.hypot(position.getX(i), position.getY(i))
    uv.setXY(i, (radius - RING_INNER) / (RING_OUTER - RING_INNER), 0.5)
  }

  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  })

  loadTexture(record.ringTexture, (texture) => {
    material.map = texture
    material.needsUpdate = true
  })

  const ring = new THREE.Mesh(geometry, material)
  ring.rotation.x = -Math.PI / 2
  return ring
}

export function createOrbitingBody(record, { parentRadius = () => 0 } = {}) {
  const anchor = new THREE.Object3D()

  const tilt = new THREE.Object3D()
  anchor.add(tilt)

  const material = new THREE.MeshStandardMaterial({ color: record.color, roughness: 0.9 })
  const mesh = new THREE.Mesh(SPHERE_GEOMETRY, material)
  mesh.userData.record = record
  tilt.add(mesh)

  if (record.texture) {
    loadTexture(record.texture, (texture) => {
      material.map = texture
      material.color.set(0xffffff)
      material.needsUpdate = true
    })
  }

  const ring = record.ringTexture ? createRing(record) : null
  if (ring) tilt.add(ring)

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

    if (!record.texture && material.map) {
      material.map = null
      material.needsUpdate = true
    }
    material.color.set(material.map ? 0xffffff : record.color)

    orbitLine.material.color.set(record.color)
    orbitLine.scale.setScalar(orbitRadius())
    if (ring) ring.scale.setScalar(kmToScene(record.radiusKm))
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

  function dispose() {
    material.dispose()
    orbitLine.material.dispose()
    if (ring) {
      ring.geometry.dispose()
      ring.material.dispose()
    }
  }

  refresh()

  return { anchor, mesh, orbitLine, refresh, update, dispose }
}
