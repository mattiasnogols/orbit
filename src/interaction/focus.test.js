import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { createFocus } from './focus.js'

function setup(radius = 10) {
  const anchor = new THREE.Object3D()
  const camera = new THREE.PerspectiveCamera()
  camera.position.set(0, 100, 200)
  const controls = { target: new THREE.Vector3() }
  const bodies = new Map([['moon', { anchor, radius }]])
  const focus = createFocus({
    camera,
    controls,
    getBody: (id) => bodies.get(id) ?? null,
  })
  return { anchor, camera, controls, bodies, focus }
}

describe('createFocus', () => {
  it('frames the body using its radius', () => {
    const { anchor, camera, controls, focus } = setup()
    anchor.position.set(3, 0, 4)
    focus.focus('moon')
    expect(focus.getFollowedId()).toBe('moon')
    expect(controls.target.x).toBeCloseTo(3, 10)
    expect(controls.target.z).toBeCloseTo(4, 10)
    expect(camera.position.distanceTo(controls.target)).toBeCloseTo(80, 10)
  })

  it('clamps the framing distance for tiny and huge bodies', () => {
    const tiny = setup(0.05)
    tiny.focus.focus('moon')
    expect(tiny.camera.position.distanceTo(tiny.controls.target)).toBeCloseTo(2, 10)

    const huge = setup(100)
    huge.focus.focus('moon')
    expect(huge.camera.position.distanceTo(huge.controls.target)).toBeCloseTo(120, 10)
  })

  it('moves the camera with the followed body', () => {
    const { anchor, camera, controls, focus } = setup()
    focus.focus('moon')
    const offset = camera.position.clone().sub(controls.target)

    anchor.position.set(10, 0, 0)
    focus.update()

    expect(controls.target.x).toBeCloseTo(10, 10)
    expect(camera.position.clone().sub(controls.target).distanceTo(offset)).toBeCloseTo(0, 10)
  })

  it('stops following a body that disappears', () => {
    const { bodies, focus } = setup()
    focus.focus('moon')
    bodies.clear()
    focus.update()
    expect(focus.getFollowedId()).toBe(null)
  })

  it('ignores unknown ids and can unfocus', () => {
    const { focus } = setup()
    focus.focus('missing')
    expect(focus.getFollowedId()).toBe(null)
    focus.focus('moon')
    focus.unfocus()
    expect(focus.getFollowedId()).toBe(null)
  })
})
