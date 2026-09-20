import { describe, expect, it } from 'vitest'
import { createSimTime } from './time.js'

describe('createSimTime', () => {
  it('starts at zero, unpaused, at 1x speed', () => {
    const time = createSimTime()
    expect(time.getDays()).toBe(0)
    expect(time.isPaused()).toBe(false)
    expect(time.getSpeed()).toBe(1)
  })

  it('advances by delta * daysPerSecond * speed', () => {
    const time = createSimTime(2)
    time.advance(0.5)
    expect(time.getDays()).toBeCloseTo(1, 10)
    time.setSpeed(3)
    time.advance(0.5)
    expect(time.getDays()).toBeCloseTo(4, 10)
  })

  it('accumulates time across advances', () => {
    const time = createSimTime(2)
    time.advance(0.25)
    time.advance(0.25)
    expect(time.getDays()).toBeCloseTo(1, 10)
  })

  it('does not advance while paused', () => {
    const time = createSimTime()
    time.advance(1)
    time.setPaused(true)
    time.advance(1)
    expect(time.getDays()).toBeCloseTo(2, 10)
    time.setPaused(false)
    time.advance(1)
    expect(time.getDays()).toBeCloseTo(4, 10)
  })

  it('never allows a negative speed', () => {
    const time = createSimTime()
    time.setSpeed(-5)
    expect(time.getSpeed()).toBe(0)
    time.advance(1)
    expect(time.getDays()).toBe(0)
  })

  it('resets elapsed time', () => {
    const time = createSimTime()
    time.advance(10)
    time.reset()
    expect(time.getDays()).toBe(0)
  })
})
