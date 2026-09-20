import { afterEach, describe, expect, it } from 'vitest'
import { auToScene, getScaleMode, kmToScene, mapRange, moonDistanceToScene, setScaleMode } from './scaling.js'
import { SCALE_MODES } from '../config.js'

const COMPRESSED = SCALE_MODES.compressed

afterEach(() => setScaleMode('compressed'))

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
    expect(auToScene(COMPRESSED.distance.minAU)).toBeCloseTo(COMPRESSED.distance.outMin, 10)
    expect(auToScene(COMPRESSED.distance.maxAU)).toBeCloseTo(COMPRESSED.distance.outMax, 10)
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
      expect(auToScene(au)).toBeGreaterThanOrEqual(COMPRESSED.distance.outMin)
      expect(auToScene(au)).toBeLessThanOrEqual(COMPRESSED.distance.outMax)
    }
  })

  it('clamps non-positive input instead of returning NaN', () => {
    expect(auToScene(0)).toBe(COMPRESSED.distance.outMin)
    expect(auToScene(-5)).toBe(COMPRESSED.distance.outMin)
  })
})

describe('kmToScene', () => {
  it('maps the smallest and largest radii to the configured bounds', () => {
    expect(kmToScene(COMPRESSED.size.minKm)).toBeCloseTo(COMPRESSED.size.outMin, 10)
    expect(kmToScene(COMPRESSED.size.maxKm)).toBeCloseTo(COMPRESSED.size.outMax, 10)
  })

  it('increases with planet radius', () => {
    const radii = [2439.7, 3389.5, 6051.8, 6371, 24622, 25362, 58232, 69911]
    const mapped = radii.map(kmToScene)
    for (let index = 1; index < mapped.length; index += 1) {
      expect(mapped[index]).toBeGreaterThan(mapped[index - 1])
    }
  })

  it('clamps tiny bodies to the minimum size', () => {
    expect(kmToScene(1)).toBe(COMPRESSED.size.outMin)
    expect(kmToScene(0)).toBe(COMPRESSED.size.outMin)
  })
})

describe('moonDistanceToScene', () => {
  it('maps the distance range to the configured bounds', () => {
    expect(moonDistanceToScene(COMPRESSED.moonDistance.minKm)).toBeCloseTo(
      COMPRESSED.moonDistance.outMin,
      10,
    )
    expect(moonDistanceToScene(COMPRESSED.moonDistance.maxKm)).toBeCloseTo(
      COMPRESSED.moonDistance.outMax,
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

describe('scale modes', () => {
  it('defaults to the compressed mode', () => {
    expect(getScaleMode()).toBe('compressed')
    expect(auToScene(0.387)).toBe(COMPRESSED.distance.outMin)
  })

  it('uses linear spacing in realistic mode', () => {
    setScaleMode('realistic')
    expect(getScaleMode()).toBe('realistic')
    expect(auToScene(0)).toBe(0)
    expect(auToScene(SCALE_MODES.realistic.distance.maxAU)).toBeCloseTo(
      SCALE_MODES.realistic.distance.outMax,
      10,
    )
    expect(auToScene(15.035)).toBeCloseTo(SCALE_MODES.realistic.distance.outMax / 2, 6)
  })

  it('keeps true relative sizes in realistic mode', () => {
    setScaleMode('realistic')
    expect(kmToScene(69911)).toBeCloseTo(3, 10)
    expect(kmToScene(69911) / kmToScene(6371)).toBeCloseTo(69911 / 6371, 6)
  })

  it('keeps inner planet orbits outside the Sun in realistic mode', () => {
    setScaleMode('realistic')
    expect(auToScene(0.387)).toBeGreaterThan(5)
  })

  it('keeps moon orbits outside their planet in realistic mode', () => {
    setScaleMode('realistic')
    const earthRadius = kmToScene(6371)
    expect(earthRadius + moonDistanceToScene(384400)).toBeGreaterThan(earthRadius)
  })

  it('falls back to compressed for unknown mode names', () => {
    setScaleMode('realistic')
    setScaleMode('unknown')
    expect(getScaleMode()).toBe('compressed')
  })
})
