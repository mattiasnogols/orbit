import { describe, expect, it } from 'vitest'
import { orbitPosition } from './orbit.js'

describe('orbitPosition', () => {
  it('places the body at the start angle when no time has passed', () => {
    const { x, z } = orbitPosition({
      radius: 10,
      startAngle: Math.PI / 2,
      periodDays: 100,
      simDays: 0,
    })
    expect(x).toBeCloseTo(0, 10)
    expect(z).toBeCloseTo(10, 10)
  })

  it('moves a quarter turn after a quarter of the period', () => {
    const { x, z } = orbitPosition({
      radius: 10,
      startAngle: 0,
      periodDays: 100,
      simDays: 25,
    })
    expect(x).toBeCloseTo(0, 10)
    expect(z).toBeCloseTo(10, 10)
  })

  it('returns to the start after a full period', () => {
    const start = orbitPosition({ radius: 10, startAngle: 1.2, periodDays: 365.26, simDays: 0 })
    const full = orbitPosition({
      radius: 10,
      startAngle: 1.2,
      periodDays: 365.26,
      simDays: 365.26,
    })
    expect(full.x).toBeCloseTo(start.x, 10)
    expect(full.z).toBeCloseTo(start.z, 10)
  })

  it('keeps a constant distance from the centre', () => {
    for (const simDays of [0, 12.5, 50, 999]) {
      const { x, z } = orbitPosition({ radius: 42, startAngle: 0.7, periodDays: 100, simDays })
      expect(Math.hypot(x, z)).toBeCloseTo(42, 10)
    }
  })

  it('orbits the other way for a negative period', () => {
    const forward = orbitPosition({ radius: 10, startAngle: 0, periodDays: 100, simDays: 25 })
    const backward = orbitPosition({ radius: 10, startAngle: 0, periodDays: -100, simDays: 25 })
    expect(backward.x).toBeCloseTo(forward.x, 10)
    expect(backward.z).toBeCloseTo(-forward.z, 10)
  })
})
