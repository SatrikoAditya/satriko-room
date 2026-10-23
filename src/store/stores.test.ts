// src/store/stores.test.ts
import { beforeEach, describe, expect, it } from 'vitest'

import { STORAGE_KEYS } from '@constants/storage'

import { useLabelStore } from './useLabelStore'
import { useRoomStore } from './useRoomStore'
import { useSceneStore } from './useSceneStore'
import { useSoundStore } from './useSoundStore'

describe('stores', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useSoundStore.setState({ master: false, music: false })
  })
  it('room store starts idle and loading', () => {
    const s = useRoomStore.getState()
    expect([s.phase, s.transition, s.originRect, s.openedInApp]).toEqual([
      'loading',
      'idle',
      null,
      false,
    ])
    s.setTransition('focusing')
    expect(useRoomStore.getState().transition).toBe('focusing')
  })
  it('scene store defaults', () => {
    const s = useSceneStore.getState()
    expect([
      s.hovered,
      s.tier,
      s.webgl,
      s.theme,
      s.sceneReady,
      s.progress,
    ]).toEqual([null, 'high', 'unknown', 'day', false, 0])
  })
  it('sound store persists the master flag and hydrates it', () => {
    useSoundStore.getState().setMaster(true)
    expect(
      JSON.parse(window.localStorage.getItem(STORAGE_KEYS.sound)!),
    ).toEqual({ master: true })
    useSoundStore.setState({ master: false })
    useSoundStore.getState().hydrate()
    expect(useSoundStore.getState().master).toBe(true)
  })
  it('sound is on by default, and a saved "off" is kept', () => {
    window.localStorage.removeItem(STORAGE_KEYS.sound)
    useSoundStore.getState().hydrate()
    expect(useSoundStore.getState().master).toBe(true)
    useSoundStore.getState().setMaster(false)
    useSoundStore.setState({ master: true })
    useSoundStore.getState().hydrate()
    expect(useSoundStore.getState().master).toBe(false)
  })
  it('hydrate tolerates a stored null and non-object values (back to on)', () => {
    window.localStorage.setItem(STORAGE_KEYS.sound, 'null')
    expect(() => useSoundStore.getState().hydrate()).not.toThrow()
    expect(useSoundStore.getState().master).toBe(true)
    window.localStorage.setItem(STORAGE_KEYS.sound, '{"master":"yes"}')
    useSoundStore.getState().hydrate()
    expect(useSoundStore.getState().master).toBe(true)
  })
  it('toggleMaster off also silences music', () => {
    useSoundStore.setState({ master: true, music: true })
    useSoundStore.getState().toggleMaster()
    expect(useSoundStore.getState()).toMatchObject({
      master: false,
      music: true,
    })
  })
  it('label store hides phone tags by default, persists showing them and hydrates', () => {
    localStorage.clear()
    useLabelStore.setState({ touchLabels: true })
    useLabelStore.getState().hydrate()
    expect(useLabelStore.getState().touchLabels).toBe(false)
    useLabelStore.getState().toggleTouchLabels()
    expect(useLabelStore.getState().touchLabels).toBe(true)
    useLabelStore.setState({ touchLabels: false })
    useLabelStore.getState().hydrate()
    expect(useLabelStore.getState().touchLabels).toBe(true)
    useLabelStore.getState().toggleTouchLabels()
  })
})
