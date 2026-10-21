import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createAudioManager } from './audio'

describe('audio manager', () => {
  const play = vi.fn().mockResolvedValue(undefined)
  const pause = vi.fn()
  beforeEach(() => {
    play.mockClear()
    pause.mockClear()
    vi.stubGlobal(
      'Audio',
      vi.fn(function () {
        return { play, pause, loop: false, volume: 1, currentTime: 0 }
      }),
    )
  })
  it('never plays music before unlock and plays after', () => {
    const a = createAudioManager()
    a.setMuted(false)
    a.startMusic()
    expect(play).not.toHaveBeenCalled()
    a.unlock()
    expect(play).toHaveBeenCalledTimes(1)
  })
  it('stays silent while muted (the default)', () => {
    const a = createAudioManager()
    a.unlock()
    a.startMusic()
    expect(play).not.toHaveBeenCalled()
  })
  it('mute pauses music and unmute resumes it', () => {
    const a = createAudioManager()
    a.setMuted(false)
    a.unlock()
    a.startMusic()
    a.setMuted(true)
    expect(pause).toHaveBeenCalled()
    a.setMuted(false)
    expect(play).toHaveBeenCalledTimes(2)
  })
  it('swallows playback errors', async () => {
    play.mockRejectedValueOnce(new Error('NotAllowedError'))
    const a = createAudioManager()
    a.setMuted(false)
    a.unlock()
    expect(() => a.startMusic()).not.toThrow()
    await Promise.resolve()
  })
  it('playSfx no-ops without an audio context', () => {
    const a = createAudioManager()
    a.unlock()
    expect(() => a.playSfx('tick')).not.toThrow()
  })
})
