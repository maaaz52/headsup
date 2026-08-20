let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function playTone(
  audio: AudioContext,
  freqStart: number,
  freqEnd: number,
  duration: number,
  volume: number,
  when = 0,
  type: OscillatorType = 'sine'
): void {
  const t0 = audio.currentTime + when
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freqStart, t0)
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + duration)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

export function playFlyBySound(characterId: string): void {
  try {
    const audio = getCtx()
    if (audio.state === 'suspended') void audio.resume()

    // engine drone
    const t0 = audio.currentTime
    const drone = audio.createOscillator()
    const droneGain = audio.createGain()
    drone.type = 'sawtooth'
    drone.frequency.setValueAtTime(70, t0)
    drone.frequency.linearRampToValueAtTime(110, t0 + 2.2)
    droneGain.gain.setValueAtTime(0.0001, t0)
    droneGain.gain.exponentialRampToValueAtTime(0.05, t0 + 0.3)
    droneGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.6)
    drone.connect(droneGain)
    droneGain.connect(audio.destination)
    drone.start(t0)
    drone.stop(t0 + 2.7)

    // character call at the start
    if (characterId === 'rocket') {
      playTone(audio, 320, 640, 0.18, 0.12, 0.05, 'triangle')
      playTone(audio, 640, 320, 0.22, 0.1, 0.28, 'triangle')
    } else if (characterId === 'bird') {
      playTone(audio, 880, 1320, 0.12, 0.09, 0.05, 'sine')
      playTone(audio, 990, 1480, 0.12, 0.09, 0.22, 'sine')
      playTone(audio, 1320, 1760, 0.16, 0.08, 0.39, 'sine')
    } else if (characterId === 'fox') {
      playTone(audio, 520, 780, 0.14, 0.09, 0.05, 'sine')
      playTone(audio, 700, 1040, 0.12, 0.08, 0.24, 'sine')
    } else if (characterId === 'cat') {
      playTone(audio, 700, 980, 0.18, 0.08, 0.05, 'sawtooth')
      playTone(audio, 420, 560, 0.14, 0.07, 0.28, 'sine')
    } else if (characterId === 'owl') {
      playTone(audio, 380, 380, 0.16, 0.1, 0.05, 'triangle')
      playTone(audio, 380, 380, 0.2, 0.1, 0.24, 'triangle')
    } else if (characterId === 'dino') {
      playTone(audio, 260, 390, 0.22, 0.11, 0.05, 'sawtooth')
      playTone(audio, 390, 240, 0.24, 0.1, 0.3, 'sawtooth')
    } else if (characterId === 'sloth') {
      playTone(audio, 200, 200, 0.24, 0.1, 0.05, 'sine')
      playTone(audio, 200, 260, 0.2, 0.09, 0.34, 'sine')
    } else {
      playTone(audio, 440, 660, 0.1, 0.09, 0.05, 'sine')
      playTone(audio, 660, 440, 0.16, 0.09, 0.2, 'sine')
    }
  } catch {
    // audio is best-effort; never crash the fly-by
  }
}
