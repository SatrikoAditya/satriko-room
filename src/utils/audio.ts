import { MUSIC_SRC, MUSIC_VOLUME, SFX, SFX_VOLUME } from '@constants/audio'

export type SfxName = keyof typeof SFX

export function createAudioManager() {
  let unlocked = false
  let muted = true
  let musicWanted = false
  let music: HTMLAudioElement | null = null
  let ctx: AudioContext | null = null
  const buffers = new Map<SfxName, AudioBuffer>()
  const safe = (p: Promise<unknown> | undefined) => {
    p?.catch(() => {})
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
    unlock() {
      unlocked = true
      try {
        ctx ??= new AudioContext()
        safe(ctx.resume())
      } catch {
        ctx = null
      }
      syncMusic()
    },
    setMuted(value: boolean) {
      muted = value
      syncMusic()
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
