import { createSun } from '../bodies/Sun.js'
import { createPlanet } from '../bodies/Planet.js'
import { SUN_RADIUS } from '../config.js'
import { kmToScene } from '../sim/scaling.js'

export function buildSystem(scene, records) {
  const recordsById = new Map(records.map((record) => [record.id, record]))
  const sunRecord = records.find((record) => record.type === 'star')
  const sun = createSun(sunRecord)
  scene.add(sun)

  const anchorsById = new Map([[sunRecord.id, sun]])
  const planetsById = new Map()

  const planets = records
    .filter((record) => record.type === 'planet')
    .map((record) => {
      const planet = createPlanet(record)
      scene.add(planet.anchor)
      scene.add(planet.orbitLine)
      anchorsById.set(record.id, planet.anchor)
      planetsById.set(record.id, planet)
      return planet
    })

  function getBody(id) {
    const anchor = anchorsById.get(id)
    if (!anchor) return null
    const record = recordsById.get(id)
    const radius = record.type === 'star' ? SUN_RADIUS : kmToScene(record.radiusKm)
    return { anchor, radius }
  }

  function refreshBody(id) {
    planetsById.get(id)?.refresh()
  }

  function update(simDays) {
    for (const planet of planets) {
      planet.update(simDays)
    }
  }

  function getPickables() {
    return [sun, ...planets.flatMap((planet) => [planet.mesh, planet.orbitLine])]
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

  return { sun, planets, update, getPickables, getBody, refreshBody, dispose }
}
