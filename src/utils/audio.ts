import {
  MUSIC_SRC,
  MUSIC_VOLUME,
  RAIN_LOOP_TRIM_SECONDS,
  RAIN_SOUND_FADE_SECONDS,
  RAIN_SRC,
  RAIN_VOLUME,
  SFX,
  SFX_VOLUME,
} from '@constants/audio'

export type SfxName = keyof typeof SFX

export function createAudioManager() {
  let unlocked = false
  let muted = true
  let musicWanted = false
  let music: HTMLAudioElement | null = null
  let ctx: AudioContext | null = null
  const buffers = new Map<SfxName, AudioBuffer>()
  let rainWanted = false
  let rainBuffer: AudioBuffer | null = null
  let rainLoading = false
  let rain: { src: AudioBufferSourceNode; gain: GainNode } | null = null
  const safe = (p: Promise<unknown> | undefined) => {
    p?.catch(() => {})
  }

  const fadeTo = (context: AudioContext, node: GainNode, value: number) => {
    const now = context.currentTime
    node.gain.cancelScheduledValues(now)
    node.gain.setValueAtTime(node.gain.value, now)
    node.gain.linearRampToValueAtTime(value, now + RAIN_SOUND_FADE_SECONDS)
  }
  // A gapless loop through its own gain, faded in and out.
  const syncRain = () => {
    const context = ctx
    if (unlocked && !muted && rainWanted && context) {
      if (rain) return fadeTo(context, rain.gain, RAIN_VOLUME)
      if (rainBuffer) {
        const src = context.createBufferSource()
        const gain = context.createGain()
        gain.gain.value = 0
        src.buffer = rainBuffer
        src.loop = true
        src.loopStart = RAIN_LOOP_TRIM_SECONDS
        src.loopEnd = rainBuffer.duration - RAIN_LOOP_TRIM_SECONDS
        src.connect(gain).connect(context.destination)
        src.start(0, RAIN_LOOP_TRIM_SECONDS)
        rain = { src, gain }
        return fadeTo(context, gain, RAIN_VOLUME)
      }
      if (rainLoading) return
      rainLoading = true
      safe(
        fetch(RAIN_SRC)
          .then((r) => r.arrayBuffer())
          .then((b) => context.decodeAudioData(b))
          .then((buffer) => {
            rainBuffer = buffer
            syncRain()
          })
          .finally(() => {
            rainLoading = false
          }),
      )
    } else if (rain && context) {
      fadeTo(context, rain.gain, 0)
      rain.src.stop(context.currentTime + RAIN_SOUND_FADE_SECONDS)
      rain = null
    }
  }

  const ensureMusic = () => {
    if (!music) {
      music = new Audio(MUSIC_SRC)
      music.loop = true
      music.volume = MUSIC_VOLUME
    }
    return music
  }
  const syncMusic = () => {
    if (!unlocked) return
    if (musicWanted && !muted) safe(ensureMusic().play())
    else music?.pause()
  }

  return {
    /** Call from a user activation. Retries resume() while the context is not running. */
    unlock() {
      unlocked = true
      try {
        ctx ??= new AudioContext()
        if (ctx.state !== 'running') safe(ctx.resume())
      } catch {
        ctx = null
      }
      syncMusic()
      syncRain()
    },
    isRunning() {
      return ctx?.state === 'running'
    },
    setMuted(value: boolean) {
      muted = value
      syncMusic()
      syncRain()
    },
    /** Rain in the window: the loop plays while this is on, sound is on and audio is unlocked. */
    setRain(on: boolean) {
      rainWanted = on
      syncRain()
    },
    startMusic() {
      musicWanted = true
      syncMusic()
    },
    stopMusic() {
      musicWanted = false
      music?.pause()
    },
    playSfx(name: SfxName) {
      const context = ctx
      if (!unlocked || muted || !context) return
      const play = (buffer: AudioBuffer) => {
        const src = context.createBufferSource()
        const gain = context.createGain()
        gain.gain.value = SFX_VOLUME
        src.buffer = buffer
        src.connect(gain).connect(context.destination)
        src.start()
      }
      const cached = buffers.get(name)
      if (cached) return play(cached)
      safe(
        fetch(SFX[name])
          .then((r) => r.arrayBuffer())
          .then((b) => context.decodeAudioData(b))
          .then((buffer) => {
            buffers.set(name, buffer)
            play(buffer)
          }),
      )
    },
  }
}

export const audio = createAudioManager()
