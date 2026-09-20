import { describe, expect, it, vi } from 'vitest'
import { createStore } from './store.js'

function moonRecord(parentId, id = 'custom-moon') {
  return {
    id,
    type: 'moon',
    parentId,
    name: 'Custom moon',
    radiusKm: 1000,
    distanceKm: 300000,
    periodDays: 30,
    rotationHours: 24,
    axialTiltDeg: 0,
    color: '#ffffff',
    texture: null,
    ringTexture: null,
    startAngle: 0,
  }
}

describe('createStore', () => {
  it('seeds the Sun, planets and moons', () => {
    const store = createStore()
    const bodies = store.getBodies()
    expect(bodies).toHaveLength(13)
    expect(store.get('sun').type).toBe('star')
    expect(store.get('earth').type).toBe('planet')
    expect(store.get('moon').parentId).toBe('earth')
  })

  it('returns snapshots that cannot mutate the store', () => {
    const store = createStore()
    store.getBodies().pop()
    expect(store.getBodies()).toHaveLength(13)
  })

  it('adds a body and notifies subscribers', () => {
    const store = createStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.add(moonRecord('earth', 'moon-x'))
    expect(store.has('moon-x')).toBe(true)
    expect(listener).toHaveBeenCalledWith({ kind: 'add', id: 'moon-x' })
  })

  it('copies records on add', () => {
    const store = createStore()
    const record = moonRecord('earth', 'moon-x')
    store.add(record)
    record.name = 'Changed outside'
    expect(store.get('moon-x').name).toBe('Custom moon')
  })

  it('rejects duplicate ids', () => {
    const store = createStore()
    expect(() => store.add(store.get('earth'))).toThrow(/already exists/)
  })

  it('updates a record in place and notifies subscribers', () => {
    const store = createStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.update('earth', { name: 'Terra', radiusKm: 1 })
    expect(store.get('earth').name).toBe('Terra')
    expect(store.get('earth').radiusKm).toBe(1)
    expect(listener).toHaveBeenCalledWith({ kind: 'update', id: 'earth' })
  })

  it('ignores updates for unknown ids', () => {
    const store = createStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.update('missing', { name: 'Nope' })
    expect(listener).not.toHaveBeenCalled()
  })

  it('removes a planet together with its moons', () => {
    const store = createStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.remove('jupiter')
    expect(store.has('jupiter')).toBe(false)
    expect(store.has('io')).toBe(false)
    expect(store.has('europa')).toBe(false)
    expect(store.has('titan')).toBe(true)
    expect(listener).toHaveBeenCalledWith({ kind: 'remove', id: 'jupiter' })
  })

  it('ignores removals of unknown ids', () => {
    const store = createStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.remove('missing')
    expect(listener).not.toHaveBeenCalled()
  })

  it('clears the selection when the selected body is removed', () => {
    const store = createStore()
    store.select('moon')
    store.remove('earth')
    expect(store.getSelection()).toBe(null)
  })

  it('selects existing bodies and ignores unknown ones', () => {
    const store = createStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.select('mars')
    expect(store.getSelection()).toBe('mars')
    expect(listener).toHaveBeenCalledWith({ kind: 'select', id: 'mars' })
    store.select('missing')
    expect(store.getSelection()).toBe('mars')
    store.select(null)
    expect(store.getSelection()).toBe(null)
  })

  it('does not emit when selecting the same body twice', () => {
    const store = createStore()
    store.select('mars')
    const listener = vi.fn()
    store.subscribe(listener)
    store.select('mars')
    expect(listener).not.toHaveBeenCalled()
  })

  it('restores the seed on reset', () => {
    const store = createStore()
    store.update('earth', { name: 'Terra' })
    store.remove('mars')
    store.add(moonRecord('earth', 'moon-x'))
    store.reset()
    expect(store.get('earth').name).toBe('Earth')
    expect(store.has('mars')).toBe(true)
    expect(store.has('moon-x')).toBe(false)
    expect(store.getBodies()).toHaveLength(13)
  })

  it('keeps the seed independent from edits', () => {
    const store = createStore()
    store.get('earth').name = 'Hacked'
    store.reset()
    expect(store.get('earth').name).toBe('Earth')
  })

  it('accepts custom seed records', () => {
    const store = createStore([moonRecord('earth', 'only')])
    expect(store.getBodies()).toHaveLength(1)
    store.remove('only')
    store.reset()
    expect(store.has('only')).toBe(true)
  })

  it('stops notifying after unsubscribe', () => {
    const store = createStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    unsubscribe()
    store.update('earth', { name: 'Terra' })
    expect(listener).not.toHaveBeenCalled()
  })
})
