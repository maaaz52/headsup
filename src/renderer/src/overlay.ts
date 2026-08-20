import { getCharacter } from './characters'
import { playFlyBySound } from './sound'

const params = new URLSearchParams(window.location.search)
const character = getCharacter(params.get('character') ?? 'panda')
const message = params.get('message') ?? 'Heads up!'
const theme = params.get('theme') ?? 'sunrise'
const soundEnabled = params.get('sound') !== 'false'

const banner = document.getElementById('banner')
const characterEl = document.getElementById('character')
const flight = document.getElementById('flight')

if (banner) {
  banner.textContent = message
  banner.dataset.theme = theme
}
if (characterEl) characterEl.innerHTML = character.svg
document.body.dataset.character = character.id

if (soundEnabled) playFlyBySound(character.id)

const FLY_SPEED = 160
const BANNER_WIDTH = 520
const ENTER_MARGIN = 200
const EXIT_MARGIN = 200

const startX = -(BANNER_WIDTH + ENTER_MARGIN)
const endX = window.innerWidth + EXIT_MARGIN
const distance = endX - startX
const duration = (distance / FLY_SPEED) * 1000
const start = performance.now()

const H = window.innerHeight
const Y_MIN = H * 0.08
const Y_MAX = H * 0.8

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

// Build a random wandering path: pick N random heights across the journey.
// X always moves right at constant speed; Y eases between these heights.
const WAYPOINT_COUNT = 6
const waypoints: number[] = []
for (let i = 0; i < WAYPOINT_COUNT; i++) {
  waypoints.push(rand(Y_MIN, Y_MAX))
}

// smoothstep easing between waypoints for gentle up/down drift
function easeSmooth(t: number): number {
  return t * t * (3 - 2 * t)
}

function sampleY(t: number): number {
  const seg = Math.min(WAYPOINT_COUNT - 1, Math.floor(t * (WAYPOINT_COUNT - 1)))
  const local = t * (WAYPOINT_COUNT - 1) - seg
  const a = waypoints[seg]
  const b = waypoints[Math.min(WAYPOINT_COUNT - 1, seg + 1)]
  return a + (b - a) * easeSmooth(local)
}

// gentle tilt while climbing/descending
const TILT_MAX = 12

function frame(now: number): void {
  const t = Math.min(1, (now - start) / duration)
  const x = startX + t * distance
  const y = sampleY(t)
  const prevY = sampleY(Math.max(0, t - 0.01))
  const slope = (y - prevY) / 0.01
  const tilt = Math.max(-TILT_MAX, Math.min(TILT_MAX, slope * 0.35))

  if (flight) {
    flight.style.transform = `translate(${x}px, ${y}px)`
  }
  if (characterEl) {
    characterEl.style.transform = `rotate(${tilt}deg)`
  }
  if (t < 1) {
    requestAnimationFrame(frame)
  }
}

requestAnimationFrame(frame)
