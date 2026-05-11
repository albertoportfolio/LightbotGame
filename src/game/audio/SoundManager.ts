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
  // Bandera: música solicitada pero el AudioContext está suspendido (móvil sin gesto aún)
  private pendingMusic = false
  // Caché de buffers de ruido blanco por duración (en ms). El loop de música genera
  // ~96 ruidos por iteración; sin caché eso eran ~370k floats/16s asignados al GC.
  private noiseBuffers = new Map<number, AudioBuffer>()

  // ─── Contexto y nodo maestro ──────────────────────────────────────────────

  // Inicializa (lazy) el AudioContext y el GainNode maestro; reanuda si estaba suspendido
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

  // Devuelve el GainNode maestro (asegurando que el contexto está creado)
  private getMaster(): GainNode {
    this.getCtx()
    return this.masterGain!
  }

  // ─── Volumen y mute ───────────────────────────────────────────────────────

  // Ajusta el volumen maestro en tiempo real (0.0 a 1.0)
  setVolume(v: number) {
    this._volume = v
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.setTargetAtTime(v, this.getCtx().currentTime, 0.05)
    }
  }

  // Alterna mute/unmute y reanuda la música si se desmutea
  toggleMute() {
  this.muted = !this.muted
  if (this.masterGain) {
    const target = this.muted ? 0 : this._volume
    this.masterGain.gain.cancelScheduledValues(this.getCtx().currentTime)
    this.masterGain.gain.setTargetAtTime(target, this.getCtx().currentTime, 0.05)
  }
  if (!this.muted && !this.musicPlaying) {
    this.startMusic()
  }
}

  // Devuelve true si el audio está silenciado
  isMuted() { return this.muted }

  // ─── Primitivas ───────────────────────────────────────────────────────────

  // Reproduce un tono (oscillator) con frecuencia, duración, tipo de onda y volumen
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

  // Devuelve un buffer de ruido blanco cacheado por duración (clave en ms).
  // Si no existe, lo crea una vez y lo reutiliza para todas las invocaciones futuras
  // con la misma duración — clave para el rendimiento del loop de música en móvil.
  private getNoiseBuffer(duration: number): AudioBuffer {
    const key = Math.round(duration * 1000)
    let buf = this.noiseBuffers.get(key)
    if (!buf) {
      const ctx = this.getCtx()
      const samples = Math.max(1, Math.round(ctx.sampleRate * duration))
      buf = ctx.createBuffer(1, samples, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1
      this.noiseBuffers.set(key, buf)
    }
    return buf
  }

  // Genera ruido blanco filtrado (bandpass) — usado para efectos percusivos
  private playNoise(duration: number, vol = 0.1, delay = 0) {
    if (this.muted) return
    const ctx    = this.getCtx()
    const buffer = this.getNoiseBuffer(duration)
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

  // Programa un tono para un momento futuro (startTime absoluto) — usado en la melodía de fondo
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

  // Programa ruido (hi-hat/percusión) para un momento futuro — usado en el ritmo de la música
  private scheduleNoise(duration: number, vol: number, startTime: number) {
    if (this.muted) return
    const ctx    = this.getCtx()
    const buffer = this.getNoiseBuffer(duration)
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

  // Detiene la música de fondo: cancela el timeout del loop y hace fade out lineal (cancelable)
  stopMusic() {
  this.musicPlaying = false
  this.pendingMusic = false
  if (this.musicTimeout) {
    clearTimeout(this.musicTimeout)
    this.musicTimeout = null
  }
  if (this.masterGain) {
    const ctx = this.getCtx()
    const now = ctx.currentTime
    const current = this.masterGain.gain.value
    // linearRamp en vez de setTargetAtTime: el primero es cancelable por cancelScheduledValues,
    // el segundo no — su curva exponencial seguiría hacia 0 aunque luego restauremos el volumen.
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setValueAtTime(current, now)
    this.masterGain.gain.linearRampToValueAtTime(0, now + 0.3)
  }
}


// Y cuando arranque de nuevo, restaura el volumen:
// Arranca la música de fondo si no está ya sonando y no está muteado
startMusic() {
  // Cancelar el timeout de levelComplete si arranca música antes
  if (this.levelCompleteTimeout) {
    clearTimeout(this.levelCompleteTimeout)
    this.levelCompleteTimeout = null
  }

  if (this.musicPlaying || this.muted) return

  const ctx = this.getCtx()
  // Móvil: si el contexto sigue suspendido (aún no hay gesto del usuario que lo desbloquee),
  // aplaza el arranque y reintenta cuando el contexto pase a 'running'. Si arrancáramos ahora,
  // los osciladores se programarían contra un reloj congelado y nunca sonarían.
  if (ctx.state === 'suspended') {
    this.pendingMusic = true
    const onState = () => {
      if (ctx.state === 'running' && this.pendingMusic && !this.muted) {
        this.pendingMusic = false
        ctx.removeEventListener('statechange', onState)
        this.restoreMasterGain()
        this.musicPlaying = true
        this.playMusicLoop()
      }
    }
    ctx.addEventListener('statechange', onState)
    return
  }

  this.restoreMasterGain()
  this.musicPlaying = true
  this.playMusicLoop()
}

// Restablece el masterGain al volumen actual cancelando cualquier fade en curso.
// Anchor (setValueAtTime con valor actual) + linearRamp para evitar saltos audibles
// y para garantizar que un setTargetAtTime previo deje de afectar el gain.
private restoreMasterGain() {
  if (!this.masterGain) return
  const ctx = this.getCtx()
  const now = ctx.currentTime
  const current = this.masterGain.gain.value
  this.masterGain.gain.cancelScheduledValues(now)
  this.masterGain.gain.setValueAtTime(current, now)
  this.masterGain.gain.linearRampToValueAtTime(this._volume, now + 0.05)
}

/**
 * Desbloquea el AudioContext en navegadores móviles (iOS Safari, Chrome Android).
 * DEBE invocarse desde un handler de evento de usuario (pointerdown, touchstart, click).
 * Una vez desbloqueado, todo el audio (música y SFX) puede sonar libremente.
 */
unlock(): void {
  const ctx = this.getCtx()
  if (ctx.state === 'running') return
  const buffer = ctx.createBuffer(1, 1, 22050)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start(0)
}

  // Loop principal de la música: programa 8 compases de melodía, bajo, arpegio y percusión, y se auto-reprograma
  private playMusicLoop() {
    if (!this.musicPlaying) return

    if (this.muted) {
    this.musicTimeout = setTimeout(() => {
      if (this.musicPlaying) this.playMusicLoop()
    }, 100)
    return
  }
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
      if (this.musicPlaying) this.playMusicLoop()
    }, loopMs - 100)
  }

  // ─── Sonidos de juego ─────────────────────────────────────────────────────

  // SFX: sonido corto al avanzar una celda
  move() {
    this.playTone(180, 0.06, 'square', 0.12)
    this.playTone(220, 0.06, 'square', 0.08, 0.06)
  }

  // SFX: sonido al girar el robot
  turn() {
    this.playTone(440, 0.05, 'sine', 0.12)
    this.playTone(330, 0.05, 'sine', 0.10, 0.05)
  }

  // SFX: sonido ascendente al encender una luz o copiar variable exitosamente
  lightOn() {
    this.playTone(660, 0.08, 'sine', 0.25)
    this.playTone(880, 0.12, 'sine', 0.20, 0.08)
  }

  // SFX: sonido descendente al apagar una luz
  lightOff() {
    this.playTone(440, 0.08, 'sine', 0.15)
    this.playTone(330, 0.10, 'sine', 0.10, 0.08)
  }

  // SFX: sonido grave + ruido al fallar un movimiento (choque con muro, etc.)
  error() {
    this.playTone(150, 0.08, 'sawtooth', 0.2)
    this.playTone(120, 0.15, 'sawtooth', 0.2, 0.08)
    this.playNoise(0.1, 0.08)
  }

  // SFX: fanfarria corta al pisar una planta (victoria por planta)
  plantReached() {
    const notes = [440, 550, 660, 770, 880]
    notes.forEach((f, i) => {
      this.playTone(f,     0.18, 'sine', 0.3,  i * 0.09)
      this.playTone(f * 2, 0.10, 'sine', 0.1,  i * 0.09)
    })
  }

  // SFX: tick corto al reiniciar una iteración del bucle
  loopTick() {
    this.playTone(280, 0.04, 'square', 0.08)
  }

  private levelCompleteTimeout: ReturnType<typeof setTimeout> | null = null
 // SFX: melodía de victoria que suena encima de la música de fondo
 levelComplete() {
  // ← NO tocar musicPlaying ni musicTimeout
  // El loop sigue corriendo en segundo plano

  if (this.levelCompleteTimeout) {
    clearTimeout(this.levelCompleteTimeout)
    this.levelCompleteTimeout = null
  }

  // Melodía de victoria suena encima de la música
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
}

  // SFX: jingle corto de 3 notas al cargar un nivel nuevo
  levelStart() {
    // Solo sonido de jingle, NO arranca música aquí
    this.playTone(330, 0.08, 'square', 0.15, 0.00)
    this.playTone(440, 0.08, 'square', 0.15, 0.09)
    this.playTone(523, 0.15, 'square', 0.15, 0.18)
  }

  // SFX: click de botón de UI
  buttonClick() {
    this.playTone(440, 0.06, 'sine', 0.12)
  }
}