import { DAYS_PER_SECOND } from '../config.js'

export function createSimTime(daysPerSecond = DAYS_PER_SECOND) {
  let simDays = 0
  let paused = false
  let speed = 1

  return {
    advance(deltaSeconds) {
      if (paused) return
      simDays += deltaSeconds * daysPerSecond * speed
    },
    getDays() {
      return simDays
    },
    setPaused(value) {
      paused = value
    },
    isPaused() {
      return paused
    },
    setSpeed(value) {
      speed = Math.max(value, 0)
    },
    getSpeed() {
      return speed
    },
    reset() {
      simDays = 0
    },
  }
}
