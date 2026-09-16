import { DAYS_PER_SECOND } from '../config.js'

export function createSimTime(daysPerSecond = DAYS_PER_SECOND) {
  let simDays = 0

  return {
    advance(deltaSeconds) {
      simDays += deltaSeconds * daysPerSecond
    },
    getDays() {
      return simDays
    },
    reset() {
      simDays = 0
    },
  }
}
