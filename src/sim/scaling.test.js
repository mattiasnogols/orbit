import { describe, expect, it } from 'vitest'
import { auToScene, kmToScene, mapRange, moonDistanceToScene } from './scaling.js'
import { DISTANCE_SCALE, MOON_DISTANCE_SCALE, SIZE_SCALE } from '../config.js'

describe('mapRange', () => {
  it('maps linearly when pow is 1', () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50)
  })

  it('applies the power curve', () => {
    expect(mapRange(5, 0, 10, 0, 100, 0.5)).toBeCloseTo(Math.SQRT1_2 * 100, 10)
  })

  it('clamps values below the input range', () => {
    expect(mapRange(-10, 0, 10, 0, 100)).toBe(0)
  })

  it('does not clamp values above the input range', () => {
    expect(mapRange(20, 0, 10, 0, 100)).toBe(200)
  })
})

describe('auToScene', () => {
  it('maps the closest and farthest orbits to the configured bounds', () => {
    expect(auToScene(DISTANCE_SCALE.minAU)).toBeCloseTo(DISTANCE_SCALE.outMin, 10)
    expect(auToScene(DISTANCE_SCALE.maxAU)).toBeCloseTo(DISTANCE_SCALE.outMax, 10)
  })

  it('increases with distance from the Sun', () => {
    const distances = [0.387, 0.723, 1, 1.524, 5.203, 9.537, 19.191, 30.07]
    const mapped = distances.map(auToScene)
    for (let index = 1; index < mapped.length; index += 1) {
      expect(mapped[index]).toBeGreaterThan(mapped[index - 1])
    }
  })

  it('stays within the scene bounds for every planet', () => {
    for (const au of [0.387, 0.723, 1, 1.524, 5.203, 9.537, 19.191, 30.07]) {
      expect(auToScene(au)).toBeGreaterThanOrEqual(DISTANCE_SCALE.outMin)
      expect(auToScene(au)).toBeLessThanOrEqual(DISTANCE_SCALE.outMax)
    }
  })

  it('clamps non-positive input instead of returning NaN', () => {
    expect(auToScene(0)).toBe(DISTANCE_SCALE.outMin)
    expect(auToScene(-5)).toBe(DISTANCE_SCALE.outMin)
  })
})

describe('kmToScene', () => {
  it('maps the smallest and largest radii to the configured bounds', () => {
    expect(kmToScene(SIZE_SCALE.minKm)).toBeCloseTo(SIZE_SCALE.outMin, 10)
    expect(kmToScene(SIZE_SCALE.maxKm)).toBeCloseTo(SIZE_SCALE.outMax, 10)
  })

  it('increases with planet radius', () => {
    const radii = [2439.7, 6051.8, 6371, 3389.5, 69911, 58232, 25362, 24622]
      .slice()
      .sort((a, b) => a - b)
    const mapped = radii.map(kmToScene)
    for (let index = 1; index < mapped.length; index += 1) {
      expect(mapped[index]).toBeGreaterThan(mapped[index - 1])
    }
  })

  it('clamps tiny bodies to the minimum size', () => {
    expect(kmToScene(1)).toBe(SIZE_SCALE.outMin)
    expect(kmToScene(0)).toBe(SIZE_SCALE.outMin)
  })
})

describe('moonDistanceToScene', () => {
  it('maps the distance range to the configured bounds', () => {
    expect(moonDistanceToScene(MOON_DISTANCE_SCALE.minKm)).toBeCloseTo(
      MOON_DISTANCE_SCALE.outMin,
      10,
    )
    expect(moonDistanceToScene(MOON_DISTANCE_SCALE.maxKm)).toBeCloseTo(
      MOON_DISTANCE_SCALE.outMax,
      10,
    )
  })

  it('increases with distance from the planet', () => {
    const distances = [384400, 421700, 671034, 1221870]
    const mapped = distances.map(moonDistanceToScene)
    for (let index = 1; index < mapped.length; index += 1) {
      expect(mapped[index]).toBeGreaterThan(mapped[index - 1])
    }
  })
})
