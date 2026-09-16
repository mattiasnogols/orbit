import { DAYS_PER_SECOND } from '../config.js'

const MIN_SPEED = 0.1
const MAX_SPEED = 10
const SLIDER_MAX = 1000
const PRESETS = [0.1, 1, 10]

function speedToSlider(speed) {
  const t = Math.log(speed / MIN_SPEED) / Math.log(MAX_SPEED / MIN_SPEED)
  return Math.round(t * SLIDER_MAX)
}

function sliderToSpeed(value) {
  const t = value / SLIDER_MAX
  return MIN_SPEED * Math.pow(MAX_SPEED / MIN_SPEED, t)
}

function clampSpeed(speed) {
  return Math.min(Math.max(speed, MIN_SPEED), MAX_SPEED)
}

function formatElapsed(days) {
  if (days < 365.26) return `${days.toFixed(1)} days elapsed`
  return `${(days / 365.26).toFixed(2)} Earth years elapsed`
}

export function createTimeControls(container, simTime) {
  const root = document.createElement('div')
  root.className = 'time-controls'

  const playPause = document.createElement('button')
  playPause.type = 'button'

  const slower = document.createElement('button')
  slower.type = 'button'
  slower.textContent = '−'

  const slider = document.createElement('input')
  slider.type = 'range'
  slider.min = '0'
  slider.max = String(SLIDER_MAX)
  slider.step = '1'
  slider.setAttribute('aria-label', 'Simulation speed')

  const faster = document.createElement('button')
  faster.type = 'button'
  faster.textContent = '+'

  const reset = document.createElement('button')
  reset.type = 'button'
  reset.textContent = 'Reset'

  const readout = document.createElement('span')
  readout.className = 'time-readout'

  const presetButtons = PRESETS.map((preset) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = `${preset}×`
    button.addEventListener('click', () => {
      simTime.setSpeed(preset)
      sync()
    })
    return button
  })

  playPause.addEventListener('click', () => {
    simTime.setPaused(!simTime.isPaused())
    sync()
  })

  slower.addEventListener('click', () => {
    simTime.setSpeed(clampSpeed(simTime.getSpeed() / 2))
    sync()
  })

  faster.addEventListener('click', () => {
    simTime.setSpeed(clampSpeed(simTime.getSpeed() * 2))
    sync()
  })

  slider.addEventListener('input', () => {
    simTime.setSpeed(sliderToSpeed(Number(slider.value)))
    updateReadout()
  })

  reset.addEventListener('click', () => simTime.reset())

  root.append(playPause, slower, slider, faster, ...presetButtons, reset, readout)
  container.append(root)

  function updateReadout() {
    const speed = simTime.getSpeed()
    const rate = simTime.isPaused() ? 0 : DAYS_PER_SECOND * speed
    readout.textContent = `${speed.toFixed(2)}× · ${rate.toFixed(2)} days/s · ${formatElapsed(simTime.getDays())}`
  }

  function sync() {
    playPause.textContent = simTime.isPaused() ? 'Play' : 'Pause'
    if (document.activeElement !== slider) {
      slider.value = String(speedToSlider(simTime.getSpeed()))
    }
    updateReadout()
  }

  function update() {
    playPause.textContent = simTime.isPaused() ? 'Play' : 'Pause'
    if (document.activeElement !== slider) {
      const target = speedToSlider(simTime.getSpeed())
      if (Number(slider.value) !== target) slider.value = String(target)
    }
    updateReadout()
  }

  sync()

  return { update }
}
