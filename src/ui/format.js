const KM_PER_AU = 149597870.7
const YEAR_DAYS = 365.26

export function formatKm(km) {
  if (km >= 1000000) return `${(km / 1000000).toFixed(1)} million km`
  return `${Math.round(km).toLocaleString('en-US')} km`
}

export function formatAu(au) {
  return `${Number(au.toFixed(3))} AU · ${formatKm(au * KM_PER_AU)}`
}

export function formatAuShort(au) {
  return `${Number(au.toFixed(3))} AU`
}

export function formatPeriod(days) {
  if (days < YEAR_DAYS) return `${Math.round(days)} days`
  return `${(days / YEAR_DAYS).toFixed(2)} Earth years`
}
