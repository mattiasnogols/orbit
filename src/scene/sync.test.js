import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { createStore } from '../state/store.js'
import { auToScene, kmToScene, moonDistanceToScene } from '../sim/scaling.js'
import { buildSystem } from './sync.js'
import { loadTexture } from './textures.js'

vi.mock('./textures.js', () => ({ loadTexture: vi.fn() }))

function setup() {
  const store = createStore()
  const scene = new THREE.Scene()
  const system = buildSystem(scene, store.getBodies())
  return { store, scene, system }
}

function pickAt(system, scene, camera) {
  scene.updateMatrixWorld(true)
  camera.updateMatrixWorld(true)
  const raycaster = new THREE.Raycaster()
  raycaster.params.Line.threshold = 0.6
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)
  return raycaster.intersectObjects(system.getPickables(), false)
}

describe('buildSystem', () => {
  it('builds the Sun, planets and moons', () => {
    const { system } = setup()
    expect(system.planets).toHaveLength(8)
    expect(system.moons).toHaveLength(4)
    expect(system.getPickables()).toHaveLength(25)
  })

  it('parents moon anchors and orbit lines to their planet', () => {
    const { system } = setup()
    const earth = system.getBody('earth').anchor
    expect(system.getBody('moon').anchor.parent).toBe(earth)
    expect(system.moons[0].orbitLine.parent).toBe(earth)
  })

  it('computes moon orbit radii outside their planet', () => {
    const { system } = setup()
    system.update(0)
    const earth = new THREE.Vector3()
    const moon = new THREE.Vector3()
    system.getBody('earth').anchor.getWorldPosition(earth)
    system.getBody('moon').anchor.getWorldPosition(moon)
    expect(moon.distanceTo(earth)).toBeCloseTo(kmToScene(6371) + moonDistanceToScene(384400), 10)
  })

  it('returns live body radius and null for unknown ids', () => {
    const { store, system } = setup()
    expect(system.getBody('moon').radius).toBeGreaterThan(0)
    expect(system.getBody('missing')).toBe(null)

    store.update('jupiter', { radiusKm: 35000 })
    expect(system.getBody('jupiter').radius).toBeCloseTo(kmToScene(35000), 10)
  })

  it('patches a planet and its moons on refreshBody', () => {
    const { store, system } = setup()
    const jupiter = system.planets.find((planet) => planet.mesh.userData.record.id === 'jupiter')
    const io = system.moons.find((moon) => moon.mesh.userData.record.id === 'io')

    store.update('jupiter', { radiusKm: 35000, color: '#ff0000', distanceAU: 6 })
    system.refreshBody('jupiter')

    expect(jupiter.mesh.scale.x).toBeCloseTo(kmToScene(35000), 10)
    expect(jupiter.mesh.material.color.getHexString()).toBe('ff0000')
    expect(jupiter.orbitLine.scale.x).toBeCloseTo(auToScene(6), 10)
    expect(io.orbitLine.scale.x).toBeCloseTo(kmToScene(35000) + moonDistanceToScene(421700), 10)
  })

  it('re-applies a restored texture on refreshBody', () => {
    const { store, system } = setup()
    const earth = system.planets.find((planet) => planet.mesh.userData.record.id === 'earth')

    store.update('earth', { color: '#ff0000', texture: null })
    system.refreshBody('earth')
    expect(earth.mesh.material.map).toBe(null)

    loadTexture.mockClear()
    store.update('earth', { texture: 'earth.jpg' })
    system.refreshBody('earth')
    expect(loadTexture).toHaveBeenCalledWith('earth.jpg', expect.any(Function))
  })

  it('ignores a texture that loads after the texture was removed', () => {
    const { store, system } = setup()
    const earth = system.planets.find((planet) => planet.mesh.userData.record.id === 'earth')

    loadTexture.mockClear()
    system.refreshBody('earth')
    const onLoad = loadTexture.mock.calls.findLast(([file]) => file === 'earth.jpg')[1]

    store.update('earth', { color: '#ff0000', texture: null })
    system.refreshBody('earth')
    onLoad({ isTexture: true })

    expect(earth.mesh.material.map).toBe(null)
  })

  it('shares geometry between bodies and keeps it alive on dispose', () => {
    const { system } = setup()
    const geometry = system.planets[0].mesh.geometry
    expect(system.planets[1].mesh.geometry).toBe(geometry)
    expect(system.getBody('sun').anchor.geometry).toBe(geometry)
    expect(system.planets[1].orbitLine.geometry).toBe(system.planets[0].orbitLine.geometry)

    let disposed = false
    geometry.addEventListener('dispose', () => {
      disposed = true
    })
    system.dispose()
    expect(disposed).toBe(false)
  })

  it('spins Venus and Uranus retrograde relative to the orbit normal', () => {
    const { system } = setup()
    const spinDirection = (id) => {
      const planet = system.planets.find((item) => item.mesh.userData.record.id === id)
      const axis = new THREE.Vector3(0, 1, 0).applyQuaternion(
        planet.mesh.getWorldQuaternion(new THREE.Quaternion()),
      )
      return Math.sign(planet.mesh.userData.record.rotationHours) * axis.y
    }

    expect(spinDirection('earth')).toBeGreaterThan(0)
    expect(spinDirection('venus')).toBeLessThan(0)
    expect(spinDirection('uranus')).toBeLessThan(0)
  })

  it('removes every object from the scene on dispose', () => {
    const { scene, system } = setup()
    expect(scene.children.length).toBeGreaterThan(0)
    system.dispose()
    expect(scene.children).toHaveLength(0)
  })
})

describe('moon hover picking', () => {
  it('hits the moon mesh when aiming at it', () => {
    const { system, scene } = setup()
    system.update(0)
    scene.updateMatrixWorld(true)

    const moonWorld = new THREE.Vector3()
    system.getBody('moon').anchor.getWorldPosition(moonWorld)

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000)
    camera.position.copy(moonWorld).add(new THREE.Vector3(0, 6, 0))
    camera.lookAt(moonWorld)

    const hits = pickAt(system, scene, camera)
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].object.userData.record.id).toBe('moon')
    expect(hits[0].object.isLineLoop).not.toBe(true)
  })

  it('hits the moon orbit line from above', () => {
    const { system, scene } = setup()
    system.update(0)
    scene.updateMatrixWorld(true)

    const moonWorld = new THREE.Vector3()
    system.getBody('moon').anchor.getWorldPosition(moonWorld)

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000)
    camera.position.copy(moonWorld).add(new THREE.Vector3(0, 6, 0))
    camera.lookAt(moonWorld)

    const hits = pickAt(system, scene, camera)
    const lineHits = hits.filter((hit) => hit.object.userData.record?.id === 'moon')
    expect(lineHits.length).toBeGreaterThan(0)
    expect(lineHits.some((hit) => hit.object.isLineLoop)).toBe(true)
  })
})
