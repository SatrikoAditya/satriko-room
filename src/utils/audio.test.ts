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
  it('rain no-ops without an audio context', () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const a = createAudioManager()
    a.setMuted(false)
    a.unlock()
    expect(() => a.setRain(true)).not.toThrow()
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
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

  describe('rain sound', () => {
    const sources: {
      loop: boolean
      start: ReturnType<typeof vi.fn>
      stop: ReturnType<typeof vi.fn>
    }[] = []
    const gains: { gain: { value: number; ramps: number[] } }[] = []
    const fetchSpy = vi.fn(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      }),
    )
    beforeEach(() => {
      sources.length = 0
      gains.length = 0
      fetchSpy.mockClear()
      vi.stubGlobal('fetch', fetchSpy)
      vi.stubGlobal(
        'AudioContext',
        vi.fn(function () {
          return {
            state: 'running' as AudioContextState,
            currentTime: 0,
            destination: {},
            resume: vi.fn(() => Promise.resolve()),
            decodeAudioData: vi.fn(() => Promise.resolve({ duration: 10.9 })),
            createBufferSource: vi.fn(() => {
              const src = {
                buffer: null,
                loop: false,
                loopStart: 0,
                loopEnd: 0,
                start: vi.fn(),
                stop: vi.fn(),
                connect: (node: unknown) => node,
              }
              sources.push(src)
              return src
            }),
            createGain: vi.fn(() => {
              const ramps: number[] = []
              const g = {
                gain: {
                  value: 0,
                  ramps,
                  cancelScheduledValues: vi.fn(),
                  setValueAtTime: vi.fn(),
                  linearRampToValueAtTime: vi.fn((v: number) => ramps.push(v)),
                },
                connect: (node: unknown) => node,
              }
              gains.push(g)
              return g
            }),
          }
        }),
      )
    })
    afterEach(() => vi.unstubAllGlobals())
    const settle = () => new Promise((r) => setTimeout(r, 0))

    it('stays silent while muted', async () => {
      const a = createAudioManager()
      a.unlock()
      a.setRain(true)
      await settle()
      expect(fetchSpy).not.toHaveBeenCalled()
      expect(sources).toHaveLength(0)
    })

    it('loads the loop once, then loops and fades in', async () => {
      const a = createAudioManager()
      a.setMuted(false)
      a.unlock()
      a.setRain(true)
      a.setRain(true)
      await settle()
      expect(fetchSpy).toHaveBeenCalledTimes(1)
      expect(sources).toHaveLength(1)
      expect(sources[0].loop).toBe(true)
      expect(sources[0].start).toHaveBeenCalled()
      expect(gains[0].gain.ramps.at(-1)).toBeGreaterThan(0)
    })

    it('fades out and stops when the rain ends or sound goes off', async () => {
      const a = createAudioManager()
      a.setMuted(false)
      a.unlock()
      a.setRain(true)
      await settle()
      a.setRain(false)
      expect(gains[0].gain.ramps.at(-1)).toBe(0)
      expect(sources[0].stop).toHaveBeenCalled()
      a.setRain(true)
      expect(sources).toHaveLength(2)
      a.setMuted(true)
      expect(gains[1].gain.ramps.at(-1)).toBe(0)
      expect(sources[1].stop).toHaveBeenCalled()
    })
  })
})
