import * as THREE from 'three'

const BASE_PATH = `${import.meta.env.BASE_URL}textures/`
const entries = new Map()

export function loadTexture(file, onLoad) {
  if (!file || typeof document === 'undefined') return

  const existing = entries.get(file)
  if (existing) {
    if (existing.texture) onLoad(existing.texture)
    else existing.waiting.push(onLoad)
    return
  }

  const entry = { texture: null, waiting: [onLoad] }
  entries.set(file, entry)

  new THREE.TextureLoader().load(
    `${BASE_PATH}${file}`,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 4
      entry.texture = texture
      for (const callback of entry.waiting) callback(texture)
      entry.waiting.length = 0
    },
    undefined,
    () => entries.delete(file),
  )
}
