/**
 * SoundManager — sonidos y música con Web Audio API.
 * Usa un GainNode maestro para control de volumen en tiempo real.
 */
export class SoundManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private muted = false
  private musicPlaying = false
  private musicTimeout: ReturnType<typeof setTimeout> | null = null
  private _volume = 0.8

  // ─── Contexto y nodo maestro ──────────────────────────────────────────────

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.muted ? 0 : this._volume
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  private getMaster(): GainNode {
    this.getCtx()
    return this.masterGain!
  }

  // ─── Volumen y mute ───────────────────────────────────────────────────────

  setVolume(v: number) {
    this._volume = v
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.setTargetAtTime(v, this.getCtx().currentTime, 0.05)
    }
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.masterGain) {
      const target = this.muted ? 0 : this._volume
      this.masterGain.gain.setTargetAtTime(target, this.getCtx().currentTime, 0.05)
    }
    if (this.muted) {
      this.stopMusic()
    } else {
      this.startMusic()
    }
  }

  isMuted() { return this.muted }

  // ─── Primitivas ───────────────────────────────────────────────────────────

  private playTone(
    freq: number, duration: number,
    type: OscillatorType = 'square', vol = 0.2, delay = 0
  ) {
    if (this.muted) return
    const ctx  = this.getCtx()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(this.getMaster())
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gain.gain.setValueAtTime(0, ctx.currentTime + delay)
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration + 0.05)
  }

  private playNoise(duration: number, vol = 0.1, delay = 0) {
    if (this.muted) return
    const ctx    = this.getCtx()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
    const data   = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const source = ctx.createBufferSource()
    const gain   = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    source.buffer = buffer
    filter.type = 'bandpass'
    filter.frequency.value = 300
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.getMaster())
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
    source.start(ctx.currentTime + delay)
  }

  private scheduleTone(
    freq: number, duration: number,
    type: OscillatorType, vol: number, startTime: number
  ) {
    if (this.muted) return
    const ctx  = this.getCtx()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(this.getMaster())
    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
    osc.start(startTime)
    osc.stop(startTime + duration + 0.05)
  }

  private scheduleNoise(duration: number, vol: number, startTime: number) {
    if (this.muted) return
    const ctx    = this.getCtx()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
    const data   = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const source = ctx.createBufferSource()
    const gain   = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    source.buffer = buffer
    filter.type = 'highpass'
    filter.frequency.value = 2000
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.getMaster())
    gain.gain.setValueAtTime(vol, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
    source.start(startTime)
  }

  // ─── Música de fondo ──────────────────────────────────────────────────────

  stopMusic() {
  this.musicPlaying = false
  if (this.musicTimeout) {
    clearTimeout(this.musicTimeout)
    this.musicTimeout = null
  }
  // Silencia inmediatamente todos los osciladores ya programados
  if (this.masterGain) {
    this.masterGain.gain.setTargetAtTime(0, this.getCtx().currentTime, 0.05)
  }
}

// Y cuando arranque de nuevo, restaura el volumen:
startMusic() {
  if (this.musicPlaying || this.muted) return
  if (this.masterGain) {
    // Cancelar transiciones pendientes y restaurar volumen instantáneamente
    this.masterGain.gain.cancelScheduledValues(this.getCtx().currentTime)
    this.masterGain.gain.setValueAtTime(this._volume, this.getCtx().currentTime)
  }
  this.musicPlaying = true
  this.playMusicLoop()
}

  private playMusicLoop() {
    if (!this.musicPlaying || this.muted) return
    const ctx  = this.getCtx()
    const now  = ctx.currentTime
    const beat = 60 / 120
    const bar  = beat * 4
    const bars = 8

    const melody: [number, number][] = [
      [523, beat], [659, beat], [784, beat * 0.5], [659, beat * 0.5],
      [523, beat * 2], [392, beat], [440, beat],
      [493, beat], [440, beat], [392, beat], [349, beat],
      [392, beat * 3], [0, beat],
      [659, beat], [784, beat], [880, beat * 0.5], [784, beat * 0.5],
      [659, beat * 2], [523, beat], [587, beat],
      [659, beat], [523, beat], [440, beat], [392, beat],
      [523, beat * 3], [0, beat],
    ]
    let t = 0
    melody.forEach(([freq, dur]) => {
      if (freq > 0) this.scheduleTone(freq, dur * 0.85, 'square', 0.08, now + t)
      t += dur
    })

    const bass: [number, number][] = [
      [130, beat], [0, beat], [130, beat * 0.5], [0, beat * 0.5],
      [98,  beat], [0, beat], [110, beat], [0, beat],
      [123, beat], [0, beat], [98,  beat], [0, beat],
      [98,  beat * 2], [0, beat * 2],
      [165, beat], [0, beat], [165, beat * 0.5], [0, beat * 0.5],
      [130, beat], [0, beat], [146, beat], [0, beat],
      [165, beat], [0, beat], [130, beat], [0, beat],
      [130, beat * 2], [0, beat * 2],
    ]
    t = 0
    bass.forEach(([freq, dur]) => {
      if (freq > 0) this.scheduleTone(freq, dur * 0.7, 'sawtooth', 0.06, now + t)
      t += dur
    })

    const arp1 = [523, 659, 784, 659, 523, 659, 784, 659]
    const arp2 = [392, 523, 659, 523, 392, 523, 659, 523]
    const arpStep = beat * 0.25
    for (let b = 0; b < bars; b++) {
      const pattern = b < 4 ? arp1 : arp2
      pattern.forEach((freq, i) => {
        this.scheduleTone(freq, arpStep * 0.6, 'triangle', 0.04, now + b * bar + i * arpStep)
      })
    }

    for (let b = 0; b < bars; b++) {
      for (let i = 0; i < 4; i++) {
        this.scheduleNoise(0.08, 0.05, now + b * bar + i * beat)
      }
      for (let i = 0; i < 8; i++) {
        this.scheduleNoise(0.03, 0.02, now + b * bar + i * (beat * 0.5) + beat * 0.25)
      }
    }

    const loopMs = bars * bar * 1000
    this.musicTimeout = setTimeout(() => {
      if (this.musicPlaying && !this.muted) this.playMusicLoop()
    }, loopMs - 100)
  }

  // ─── Sonidos de juego ─────────────────────────────────────────────────────

  move() {
    this.playTone(180, 0.06, 'square', 0.12)
    this.playTone(220, 0.06, 'square', 0.08, 0.06)
  }

  turn() {
    this.playTone(440, 0.05, 'sine', 0.12)
    this.playTone(330, 0.05, 'sine', 0.10, 0.05)
  }

  lightOn() {
    this.playTone(660, 0.08, 'sine', 0.25)
    this.playTone(880, 0.12, 'sine', 0.20, 0.08)
  }

  lightOff() {
    this.playTone(440, 0.08, 'sine', 0.15)
    this.playTone(330, 0.10, 'sine', 0.10, 0.08)
  }

  error() {
    this.playTone(150, 0.08, 'sawtooth', 0.2)
    this.playTone(120, 0.15, 'sawtooth', 0.2, 0.08)
    this.playNoise(0.1, 0.08)
  }

  plantReached() {
    const notes = [440, 550, 660, 770, 880]
    notes.forEach((f, i) => {
      this.playTone(f,     0.18, 'sine', 0.3,  i * 0.09)
      this.playTone(f * 2, 0.10, 'sine', 0.1,  i * 0.09)
    })
  }

  loopTick() {
    this.playTone(280, 0.04, 'square', 0.08)
  }

  levelComplete() {
    this.stopMusic()
    const melody = [
      { f: 523,  d: 0.15, t: 0.00 },
      { f: 659,  d: 0.15, t: 0.15 },
      { f: 784,  d: 0.15, t: 0.30 },
      { f: 1047, d: 0.40, t: 0.45 },
      { f: 523,  d: 0.40, t: 0.45 },
      { f: 784,  d: 0.40, t: 0.45 },
    ]
    melody.forEach(n => this.playTone(n.f, n.d, 'sine', 0.35, n.t))
    ;[1047, 1319, 1568].forEach((f, i) => {
      this.playTone(f, 0.6, 'sine', 0.08, 0.45 + i * 0.05)
    })
    setTimeout(() => { if (!this.muted) this.startMusic() }, 1500)
  }

  levelStart() {
    // Solo sonido de jingle, NO arranca música aquí
    this.playTone(330, 0.08, 'square', 0.15, 0.00)
    this.playTone(440, 0.08, 'square', 0.15, 0.09)
    this.playTone(523, 0.15, 'square', 0.15, 0.18)
  }

  buttonClick() {
    this.playTone(440, 0.06, 'sine', 0.12)
  }
}