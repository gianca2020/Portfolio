/**
 * The iPod "clicker", synthesised with Web Audio (no audio files).
 *
 * Public API: `soundEngine.unlock()`, `.click()`, `.press()`, `.setMuted()`, `.muted`.
 * Nothing touches Web Audio until `unlock()` runs from a user gesture, and every
 * call is a silent no-op when audio is missing, blocked or not yet unlocked.
 */

interface Voice {
  /** Band-pass centre of the noise burst (Hz) — the "tick". */
  band: number
  q: number
  noiseGain: number
  /** Time for the tick to decay to silence (s). */
  decay: number
  /** A short sine under the tick for a little body — the "tock". */
  tone: number
  toneGain: number
  toneDecay: number
}

/** Wheel detent: bright, dry and very short. */
const CLICK: Voice = { band: 3300, q: 1.2, noiseGain: 0.9, decay: 0.013, tone: 1450, toneGain: 0.12, toneDecay: 0.005 }
/** Button press: softer and lower. */
const PRESS: Voice = { band: 2100, q: 0.9, noiseGain: 0.6, decay: 0.018, tone: 1000, toneGain: 0.1, toneDecay: 0.008 }

const MASTER_GAIN = 0.3
const ATTACK = 0.0005
const SILENCE = 0.0001
/** ±5% filter/tone variation so repeated ticks don't sound machine-made. */
const JITTER = 0.05
/** Calls closer than this (ms) are dropped, so a fast spin never turns into a buzz. */
const MIN_INTERVAL_MS = 12
const NOISE_SECONDS = 0.1
/** Events that grant user activation, used to retry an unlock that came too early. */
const ACTIVATION_EVENTS = ['pointerup', 'touchend', 'click', 'keydown'] as const

type AudioContextCtor = new (options?: AudioContextOptions) => AudioContext

function audioContextCtor(): AudioContextCtor | undefined {
  const scope = globalThis as typeof globalThis & { webkitAudioContext?: AudioContextCtor }
  return scope.AudioContext ?? scope.webkitAudioContext
}

class SoundEngine {
  muted = false

  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private unsupported = false
  private awaitingActivation = false
  private lastPlayed = -Infinity

  /** Create / resume the audio context. Call from a user gesture; safe to call repeatedly. */
  unlock(): void {
    if (typeof window === 'undefined' || this.unsupported) return
    // Touch `pointerdown` doesn't count as activation yet (the tap's `pointerup` does). Creating the
    // context now would leave it suspended and log an autoplay warning, so wait for the real gesture.
    const activation = navigator.userActivation
    if (activation && !activation.hasBeenActive) {
      this.retryOnActivation()
      return
    }
    let ctx: AudioContext | null
    try {
      ctx = this.ctx ?? this.createContext()
    } catch {
      this.unsupported = true
      return
    }
    if (!ctx || ctx.state === 'running' || ctx.state === 'closed') return
    try {
      // Older WebKit returns undefined rather than a promise; a refusal is simply retried on the next gesture.
      Promise.resolve(ctx.resume()).catch(() => {})
    } catch {
      // Same: retried on the next gesture.
    }
  }

  /** Wheel detent. */
  click(): void {
    this.play(CLICK)
  }

  /** Button press (MENU, Select, ⏮ ⏭ ⏯). */
  press(): void {
    this.play(PRESS)
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (!this.ctx || !this.master) return
    try {
      // Also silences a tick that is already sounding.
      this.master.gain.setTargetAtTime(muted ? 0 : MASTER_GAIN, this.ctx.currentTime, 0.004)
    } catch {
      // Ignore: muted state still gates scheduling.
    }
  }

  private createContext(): AudioContext | null {
    const Ctor = audioContextCtor()
    if (!Ctor) {
      this.unsupported = true
      return null
    }
    const ctx = new Ctor({ latencyHint: 'interactive' })
    const master = ctx.createGain()
    master.gain.value = this.muted ? 0 : MASTER_GAIN
    master.connect(ctx.destination)

    // One buffer of white noise, reused by every tick (each starts at a random offset).
    const noise = ctx.createBuffer(1, Math.round(ctx.sampleRate * NOISE_SECONDS), ctx.sampleRate)
    const samples = noise.getChannelData(0)
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1

    this.ctx = ctx
    this.master = master
    this.noise = noise
    return ctx
  }

  private retryOnActivation() {
    if (this.awaitingActivation) return
    this.awaitingActivation = true
    const retry = () => {
      if (!navigator.userActivation.hasBeenActive) return
      for (const type of ACTIVATION_EVENTS) window.removeEventListener(type, retry, true)
      this.awaitingActivation = false
      this.unlock()
    }
    for (const type of ACTIVATION_EVENTS) window.addEventListener(type, retry, true)
  }

  private play(voice: Voice) {
    const { ctx, master, noise } = this
    if (this.muted || !ctx || !master || !noise || ctx.state !== 'running') return

    const now = performance.now()
    if (now - this.lastPlayed < MIN_INTERVAL_MS) return
    this.lastPlayed = now

    try {
      const t = ctx.currentTime
      const vary = 1 + (Math.random() * 2 - 1) * JITTER

      // Tick: a noise burst through a band-pass, ~0.5 ms attack, exponential decay.
      const source = ctx.createBufferSource()
      source.buffer = noise
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = voice.band * vary
      filter.Q.value = voice.q
      const tickGain = ctx.createGain()
      envelope(tickGain.gain, t, voice.noiseGain, voice.decay)
      source.connect(filter).connect(tickGain).connect(master)
      const offset = Math.random() * (noise.duration - voice.decay - 0.01)
      source.start(t, offset)
      source.stop(t + voice.decay + 0.005)
      source.onended = () => {
        source.disconnect()
        filter.disconnect()
        tickGain.disconnect()
      }

      // Tock: a few milliseconds of sine for body.
      const tone = ctx.createOscillator()
      tone.frequency.value = voice.tone * vary
      const toneGain = ctx.createGain()
      envelope(toneGain.gain, t, voice.toneGain, voice.toneDecay)
      tone.connect(toneGain).connect(master)
      tone.start(t)
      tone.stop(t + voice.toneDecay + 0.005)
      tone.onended = () => {
        tone.disconnect()
        toneGain.disconnect()
      }
    } catch {
      // Audio must never break input.
    }
  }
}

function envelope(gain: AudioParam, t: number, peak: number, decay: number) {
  gain.setValueAtTime(0, t)
  gain.linearRampToValueAtTime(peak, t + ATTACK)
  gain.exponentialRampToValueAtTime(SILENCE, t + decay)
}

export const soundEngine = new SoundEngine()
