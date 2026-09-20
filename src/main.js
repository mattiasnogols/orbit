import * as THREE from 'three'
import Stats from 'stats.js'
import { createScene } from './scene/setup.js'
import { addLighting } from './scene/lighting.js'
import { buildSystem } from './scene/sync.js'
import { createStore, defaultRecords } from './state/store.js'
import { createStressRecords } from './data/stress.js'
import { setScaleMode } from './sim/scaling.js'
import { createSimTime } from './sim/time.js'
import { createTimeControls } from './ui/timeControls.js'
import { createTooltip } from './ui/tooltip.js'
import { createPanel } from './ui/panel.js'
import { createHelp } from './ui/help.js'
import { createPicker } from './interaction/picker.js'
import { createFocus } from './interaction/focus.js'

const params = new URLSearchParams(window.location.search)
const realistic = params.has('realism')
setScaleMode(realistic ? 'realistic' : 'compressed')
const records = defaultRecords()
const stressCount = Number(params.get('bodies') ?? 0)
if (Number.isFinite(stressCount) && stressCount > 0) {
  records.push(...createStressRecords(Math.min(stressCount, 1000)))
}

const { renderer, scene, camera, controls } = createScene()
addLighting(scene)

scene.background = new THREE.Color(0x101820)

const stats = params.has('stats') ? new Stats() : null
if (stats) {
  stats.showPanel(0)
  document.body.append(stats.dom)
}

const store = createStore(records)
const simTime = createSimTime()
const timeControls = createTimeControls(document.getElementById('ui'), simTime)
const tooltip = createTooltip(document.getElementById('tooltip'))
const timer = new THREE.Timer()
timer.connect(document)

let system = buildSystem(scene, store.getBodies())

store.subscribe(({ kind, id }) => {
  if (kind === 'add' || kind === 'remove' || kind === 'reset') {
    system.dispose()
    system = buildSystem(scene, store.getBodies())
    tooltip.hide()
    return
  }
  if (kind === 'update') {
    system.refreshBody(id)
    tooltip.refresh()
  }
})

const picker = createPicker({
  camera,
  domElement: renderer.domElement,
  getPickables: () => system.getPickables(),
  onHover: (entry) => {
    if (entry) tooltip.show(entry.record)
    else tooltip.hide()
  },
  onSelect: (entry) => {
    const record = entry?.record
    store.select(record && record.type !== 'star' ? record.id : null)
  },
})

const focus = createFocus({
  camera,
  controls,
  getBody: (id) => system.getBody(id),
})

createPanel(document.getElementById('ui'), store, {
  onFocus: (id) => focus.focus(id),
  realistic,
  onScaleChange: (value) => {
    setScaleMode(value ? 'realistic' : 'compressed')
    system.dispose()
    system = buildSystem(scene, store.getBodies())
    tooltip.hide()
  },
})

createHelp(document.getElementById('ui'))

window.addEventListener('keydown', (event) => {
  if (event.code !== 'Space') return
  if (['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return
  event.preventDefault()
  simTime.setPaused(!simTime.isPaused())
})

renderer.setAnimationLoop((timestamp) => {
  stats?.begin()
  timer.update(timestamp)
  simTime.advance(timer.getDelta())
  system.update(simTime.getDays())
  focus.update()
  timeControls.update()
  controls.update()
  picker.update()
  renderer.render(scene, camera)
  stats?.end()
})
