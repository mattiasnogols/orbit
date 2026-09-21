const REALISTIC_SIZE = { minKm: 0, maxKm: 69911, outMin: 0, outMax: 3, pow: 1 }
const REALISTIC_KM_TO_SCENE = REALISTIC_SIZE.outMax / REALISTIC_SIZE.maxKm

export const SCALE_MODES = {
  compressed: {
    distance: { minAU: 0.387, maxAU: 30.07, outMin: 7, outMax: 130, pow: 0.5 },
    size: { minKm: 2439.7, maxKm: 69911, outMin: 0.18, outMax: 3, pow: 0.5 },
    moonDistance: { minKm: 10000, maxKm: 2000000, outMin: 0.5, outMax: 5, pow: 0.5 },
  },
  realistic: {
    distance: { minAU: 0, maxAU: 30.07, outMin: 0, outMax: 800, pow: 1 },
    size: REALISTIC_SIZE,
    moonDistance: {
      minKm: 0,
      maxKm: 2000000,
      outMin: 0,
      outMax: 2000000 * REALISTIC_KM_TO_SCENE,
      pow: 1,
    },
  },
}

export const SUN_RADIUS = 5

export const DAYS_PER_SECOND = 2
