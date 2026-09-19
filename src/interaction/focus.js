import * as THREE from 'three'

const MIN_DISTANCE = 2
const MAX_DISTANCE = 120
const RADIUS_FACTOR = 8

const bodyPosition = new THREE.Vector3()
const delta = new THREE.Vector3()

export function createFocus({ camera, controls, getBody }) {
  let followedId = null

  function update() {
    if (followedId === null) return
    const body = getBody(followedId)
    if (!body) {
      followedId = null
      return
    }
    body.anchor.getWorldPosition(bodyPosition)
    delta.copy(bodyPosition).sub(controls.target)
    controls.target.add(delta)
    camera.position.add(delta)
  }

  return {
    focus(id) {
      const body = getBody(id)
      if (!body) return
      body.anchor.getWorldPosition(bodyPosition)
      const direction = camera.position.clone().sub(controls.target).normalize()
      const distance = Math.min(Math.max(body.radius * RADIUS_FACTOR, MIN_DISTANCE), MAX_DISTANCE)
      controls.target.copy(bodyPosition)
      camera.position.copy(bodyPosition).addScaledVector(direction, distance)
      followedId = id
    },
    unfocus() {
      followedId = null
    },
    getFollowedId() {
      return followedId
    },
    update,
  }
}
