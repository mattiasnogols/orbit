import { DAYS_PER_SECOND } from '../config.js'

const MIN_SPEED = 0.1
const MAX_SPEED = 10000
const READOUT_INTERVAL_MS = 100

function clampSpeed(speed) {
  return Math.min(Math.max(speed, MIN_SPEED), MAX_SPEED)
}

function formatSpeed(speed) {
  return String(Number(speed.toFixed(2)))
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

  const speedInput = document.createElement('input')
  speedInput.type = 'number'
  speedInput.min = String(MIN_SPEED)
  speedInput.max = String(MAX_SPEED)
  speedInput.step = '0.1'
  speedInput.value = formatSpeed(simTime.getSpeed())
  speedInput.setAttribute('aria-label', 'Simulation speed multiplier')

  const faster = document.createElement('button')
  faster.type = 'button'
  faster.textContent = '+'

  const reset = document.createElement('button')
  reset.type = 'button'
  reset.textContent = 'Reset'

  const readout = document.createElement('span')
  readout.className = 'time-readout'

  let lastReadoutTime = -Infinity

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

  speedInput.addEventListener('input', () => {
    const value = Number(speedInput.value)
    if (Number.isFinite(value) && value > 0) {
      simTime.setSpeed(value)
      updateReadout()
    }
  })

  speedInput.addEventListener('change', () => {
    const value = Number(speedInput.value)
    simTime.setSpeed(Number.isFinite(value) && value > 0 ? value : 1)
    sync()
  })

  reset.addEventListener('click', () => simTime.reset())

  root.append(playPause, slower, speedInput, faster, reset, readout)
  container.append(root)

  function updateReadout() {
    const speed = simTime.getSpeed()
    const rate = simTime.isPaused() ? 0 : DAYS_PER_SECOND * speed
    const text = `${formatSpeed(speed)}× · ${rate.toFixed(2)} days/s · ${formatElapsed(simTime.getDays())}`
    if (readout.textContent !== text) readout.textContent = text
  }

  function syncPlayPause() {
    const label = simTime.isPaused() ? 'Play' : 'Pause'
    if (playPause.textContent !== label) playPause.textContent = label
  }

  function sync() {
    syncPlayPause()
    if (document.activeElement !== speedInput) {
      speedInput.value = formatSpeed(simTime.getSpeed())
    }
    updateReadout()
  }

  function update() {
    syncPlayPause()
    if (document.activeElement !== speedInput) {
      const display = formatSpeed(simTime.getSpeed())
      if (speedInput.value !== display) speedInput.value = display
    }
    const now = performance.now()
    if (now - lastReadoutTime < READOUT_INTERVAL_MS) return
    lastReadoutTime = now
    updateReadout()
  }

  sync()

  return { update }
}
