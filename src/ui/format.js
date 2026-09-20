const KM_PER_AU = 149597870.7

export function formatKm(km) {
  if (km >= 1000000) return `${(km / 1000000).toFixed(1)} million km`
  return `${Math.round(km).toLocaleString('en-US')} km`
}

export function formatAu(au) {
  return `${Number(au.toFixed(3))} AU · ${formatKm(au * KM_PER_AU)}`
}
