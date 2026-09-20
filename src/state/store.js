import { MOONS, PLANETS, SUN } from '../data/defaults.js'

export function defaultRecords() {
  return [SUN, ...PLANETS, ...MOONS].map((record) => ({ ...record }))
}

export function createStore(initialRecords = defaultRecords()) {
  const seed = initialRecords.map((record) => ({ ...record }))
  const bodies = new Map()
  const listeners = new Set()
  let selectedId = null

  function load(records) {
    bodies.clear()
    for (const record of records) {
      bodies.set(record.id, { ...record })
    }
  }

  function emit(kind, id = null) {
    const event = { kind, id }
    for (const listener of listeners) listener(event)
  }

  load(seed)

  return {
    getBodies() {
      return [...bodies.values()]
    },
    get(id) {
      return bodies.get(id)
    },
    has(id) {
      return bodies.has(id)
    },
    add(record) {
      if (bodies.has(record.id)) {
        throw new Error(`Body "${record.id}" already exists`)
      }
      bodies.set(record.id, { ...record })
      emit('add', record.id)
    },
    update(id, changes) {
      const record = bodies.get(id)
      if (!record) return
      Object.assign(record, changes)
      emit('update', id)
    },
    remove(id) {
      if (!bodies.has(id)) return
      const removedIds = new Set([id])
      for (const body of bodies.values()) {
        if (body.parentId === id) removedIds.add(body.id)
      }
      for (const removedId of removedIds) bodies.delete(removedId)
      if (selectedId !== null && removedIds.has(selectedId)) selectedId = null
      emit('remove', id)
    },
    select(id) {
      if (id === selectedId) return
      if (id !== null && !bodies.has(id)) return
      selectedId = id
      emit('select', id)
    },
    getSelection() {
      return selectedId
    },
    reset() {
      load(seed)
      if (selectedId !== null && !bodies.has(selectedId)) selectedId = null
      emit('reset')
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
