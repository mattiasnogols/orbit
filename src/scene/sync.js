import { createSun } from '../bodies/Sun.js'
import { createPlanet } from '../bodies/Planet.js'
import { SUN_RADIUS } from '../config.js'

export function buildSystem(scene, records) {
  const sunRecord = records.find((record) => record.type === 'star')
  const sun = createSun(sunRecord)
  scene.add(sun)

  const bodiesById = new Map([[sunRecord.id, { anchor: sun, radius: SUN_RADIUS }]])

  const planets = records
    .filter((record) => record.type === 'planet')
    .map((record) => {
      const planet = createPlanet(record)
      scene.add(planet.anchor)
      scene.add(planet.orbitLine)
      bodiesById.set(record.id, { anchor: planet.anchor, radius: planet.radius })
      return planet
    })

  function getBody(id) {
    return bodiesById.get(id) ?? null
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

  return { sun, planets, update, getPickables, getBody, dispose }
}
