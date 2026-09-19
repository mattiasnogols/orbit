import { createSun } from '../bodies/Sun.js'
import { createOrbitingBody } from '../bodies/OrbitingBody.js'
import { SUN_RADIUS } from '../config.js'
import { kmToScene } from '../sim/scaling.js'

export function buildSystem(scene, records) {
  const recordsById = new Map(records.map((record) => [record.id, record]))
  const sunRecord = records.find((record) => record.type === 'star')
  const sun = createSun(sunRecord)
  scene.add(sun)

  const anchorsById = new Map([[sunRecord.id, sun]])
  const bodiesById = new Map()
  const moonsByParent = new Map()
  const planetsById = new Map()

  const planets = records
    .filter((record) => record.type === 'planet')
    .map((record) => {
      const planet = createOrbitingBody(record)
      scene.add(planet.anchor)
      scene.add(planet.orbitLine)
      anchorsById.set(record.id, planet.anchor)
      bodiesById.set(record.id, planet)
      planetsById.set(record.id, planet)
      return planet
    })

  const moons = records
    .filter((record) => record.type === 'moon' && planetsById.has(record.parentId))
    .map((record) => {
      const parent = planetsById.get(record.parentId)
      const parentRecord = recordsById.get(record.parentId)
      const moon = createOrbitingBody(record, {
        parentRadius: () => kmToScene(parentRecord.radiusKm),
      })
      parent.anchor.add(moon.anchor)
      parent.anchor.add(moon.orbitLine)
      anchorsById.set(record.id, moon.anchor)
      bodiesById.set(record.id, moon)

      const siblings = moonsByParent.get(record.parentId) ?? []
      siblings.push(moon)
      moonsByParent.set(record.parentId, siblings)
      return moon
    })

  function getBody(id) {
    const anchor = anchorsById.get(id)
    if (!anchor) return null
    const record = recordsById.get(id)
    const radius = record.type === 'star' ? SUN_RADIUS : kmToScene(record.radiusKm)
    return { anchor, radius }
  }

  function refreshBody(id) {
    bodiesById.get(id)?.refresh()
    for (const moon of moonsByParent.get(id) ?? []) moon.refresh()
  }

  function update(simDays) {
    for (const planet of planets) planet.update(simDays)
    for (const moon of moons) moon.update(simDays)
  }

  function getPickables() {
    return [
      sun,
      ...planets.flatMap((planet) => [planet.mesh, planet.orbitLine]),
      ...moons.flatMap((moon) => [moon.mesh, moon.orbitLine]),
    ]
  }

  function dispose() {
    const objects = [sun, ...planets.flatMap((planet) => [planet.anchor, planet.orbitLine])]
    for (const object of objects) {
      scene.remove(object)
      object.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
    }
  }

  update(0)

  return { sun, planets, moons, update, getPickables, getBody, refreshBody, dispose }
}
