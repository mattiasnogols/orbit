import { SCALE_MODES } from '../config.js'

let modeName = 'compressed'

export function setScaleMode(name) {
  modeName = name in SCALE_MODES ? name : 'compressed'
}

export function getScaleMode() {
  return modeName
}

export function mapRange(value, inMin, inMax, outMin, outMax, pow = 1) {
  const t = Math.max((value - inMin) / (inMax - inMin), 0)
  return outMin + Math.pow(t, pow) * (outMax - outMin)
}

export function auToScene(au) {
  const scale = SCALE_MODES[modeName].distance
  return mapRange(au, scale.minAU, scale.maxAU, scale.outMin, scale.outMax, scale.pow)
}

export function kmToScene(km) {
  const scale = SCALE_MODES[modeName].size
  return mapRange(km, scale.minKm, scale.maxKm, scale.outMin, scale.outMax, scale.pow)
}

export function moonDistanceToScene(km) {
  const scale = SCALE_MODES[modeName].moonDistance
  return mapRange(km, scale.minKm, scale.maxKm, scale.outMin, scale.outMax, scale.pow)
}
