const COLORS = ['#ff8f6b', '#7fd1ee', '#c9a7ff', '#7ee0a8', '#ffd166', '#f78fb3']
const YEAR_DAYS = 365.26

export function createStressRecords(count) {
  const records = []
  for (let index = 0; index < count; index += 1) {
    const distanceAU = 0.6 + (index % 60) * 0.5
    const radiusKm = 1000 + (index % 12) * 4000
    const id = `stress-${index}`
    const color = COLORS[index % COLORS.length]

    records.push({
      id,
      type: 'planet',
      parentId: null,
      name: `Stress ${index}`,
      radiusKm,
      distanceAU,
      periodDays: Math.round(YEAR_DAYS * Math.pow(distanceAU, 1.5)),
      rotationHours: 24,
      axialTiltDeg: 10,
      color,
      texture: null,
      ringTexture: null,
      startAngle: (index * 0.7) % (Math.PI * 2),
    })

    records.push({
      id: `${id}-moon`,
      type: 'moon',
      parentId: id,
      name: `Stress moon ${index}`,
      radiusKm: 800,
      distanceKm: 200000 + (index % 10) * 150000,
      periodDays: 10 + (index % 7) * 5,
      rotationHours: 24,
      axialTiltDeg: 0,
      color,
      texture: null,
      ringTexture: null,
      startAngle: (index * 1.3) % (Math.PI * 2),
    })
  }
  return records
}
