import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

  describe('with an AudioContext', () => {
    const contexts: { state: AudioContextState; resume: () => void }[] = []
    beforeEach(() => {
      contexts.length = 0
      vi.stubGlobal(
        'AudioContext',
        vi.fn(function () {
          const c = {
            state: 'suspended' as AudioContextState,
            resume: vi.fn(() => Promise.resolve()),
          }
          contexts.push(c)
          return c
        }),
      )
    })
    afterEach(() => vi.unstubAllGlobals())

    it('is not running until the context reports running', () => {
      const a = createAudioManager()
      expect(a.isRunning()).toBe(false)
      a.unlock()
      expect(contexts).toHaveLength(1)
      expect(a.isRunning()).toBe(false)
      contexts[0].state = 'running'
      expect(a.isRunning()).toBe(true)
    })
    it('retries resume() on a later unlock while the context is suspended', () => {
      const a = createAudioManager()
      a.unlock()
      a.unlock()
      expect(contexts).toHaveLength(1)
      expect(contexts[0].resume).toHaveBeenCalledTimes(2)
      contexts[0].state = 'running'
      a.unlock()
      expect(contexts[0].resume).toHaveBeenCalledTimes(2)
    })
  })
})
