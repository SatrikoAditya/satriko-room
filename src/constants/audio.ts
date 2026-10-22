export const SFX = {
  tick: '/audio/tick.mp3',
  pop: '/audio/pop.mp3',
  whoosh: '/audio/whoosh.mp3',
  switch: '/audio/switch.mp3',
  printer: '/audio/printer.mp3',
  meow: '/audio/meow.mp3',
  radio: '/audio/radio.mp3',
} as const
export const MUSIC_SRC = '/audio/music-cozy.mp3'
export const MUSIC_VOLUME = 0.35
export const SFX_VOLUME = 0.5
/** The window's rain loop (CC0, see CREDITS.md), played while it rains and sound is on. */
export const RAIN_SRC = '/audio/rain.mp3'
export const RAIN_VOLUME = 0.3
export const RAIN_SOUND_FADE_SECONDS = 1.5
/** Skipped at both ends of the loop, past any encoder padding, so it loops without a gap. */
export const RAIN_LOOP_TRIM_SECONDS = 0.05
