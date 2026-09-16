import { createSun } from '../bodies/Sun.js'
import { createPlanet } from '../bodies/Planet.js'

export function buildSystem(scene, records) {
  const sunRecord = records.find((record) => record.type === 'star')
  const sun = createSun(sunRecord)
  scene.add(sun)

  const planets = records
    .filter((record) => record.type === 'planet')
    .map((record) => {
      const planet = createPlanet(record)
      scene.add(planet.anchor)
      scene.add(planet.orbitLine)
      return planet
    })

  function update(simDays) {
    for (const planet of planets) {
      planet.update(simDays)
    }
  }

  update(0)

  return { sun, planets, update }
}
