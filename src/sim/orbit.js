export function orbitPosition({ radius, startAngle, periodDays, simDays }) {
  const angle = startAngle + (2 * Math.PI * simDays) / periodDays
  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
  }
}
