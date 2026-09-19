import { SUN, PLANETS } from '../data/defaults.js'

function defaultRecords() {
  return [SUN, ...PLANETS].map((record) => ({ ...record }))
}

export function createStore(initialRecords = defaultRecords()) {
  const seed = initialRecords.map((record) => ({ ...record }))
  const bodies = new Map()
  const listeners = new Set()

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
      if (!bodies.delete(id)) return
      emit('remove', id)
    },
    reset() {
      load(seed)
      emit('reset')
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
