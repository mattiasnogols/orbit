import { DISTANCE_SCALE, SIZE_SCALE } from '../config.js'

export function mapRange(value, inMin, inMax, outMin, outMax, pow = 1) {
  const t = Math.max((value - inMin) / (inMax - inMin), 0)
  return outMin + Math.pow(t, pow) * (outMax - outMin)
}

export function auToScene(au) {
  return mapRange(
    au,
    DISTANCE_SCALE.minAU,
    DISTANCE_SCALE.maxAU,
    DISTANCE_SCALE.outMin,
    DISTANCE_SCALE.outMax,
    DISTANCE_SCALE.pow,
  )
}

export function kmToScene(km) {
  return mapRange(
    km,
    SIZE_SCALE.minKm,
    SIZE_SCALE.maxKm,
    SIZE_SCALE.outMin,
    SIZE_SCALE.outMax,
    SIZE_SCALE.pow,
  )
}
