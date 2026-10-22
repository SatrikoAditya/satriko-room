import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'

import { useVisitorActivity } from './useVisitorActivity'

describe('useVisitorActivity', () => {
  let now = 1000
  beforeEach(() => {
    now = 1000
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    useRoomStore.setState({ phase: 'loading' })
    useSceneStore.setState({ lastActivity: 0 })
  })
  afterEach(() => vi.restoreAllMocks())

  it('starts the clock on mount', () => {
    renderHook(() => useVisitorActivity())
    expect(useSceneStore.getState().lastActivity).toBe(1000)
  })

  it('counts clicks, taps and key presses but not mouse movement', () => {
    renderHook(() => useVisitorActivity())
    now = 2000
    act(() => {
      window.dispatchEvent(new Event('mousemove'))
      window.dispatchEvent(new Event('pointermove'))
    })
    expect(useSceneStore.getState().lastActivity).toBe(1000)
    act(() => window.dispatchEvent(new Event('pointerdown')))
    expect(useSceneStore.getState().lastActivity).toBe(2000)
    now = 3000
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })))
    expect(useSceneStore.getState().lastActivity).toBe(3000)
  })

  it('restarts the clock when the room becomes ready', () => {
    renderHook(() => useVisitorActivity())
    now = 5000
    act(() => useRoomStore.getState().setPhase('ready'))
    expect(useSceneStore.getState().lastActivity).toBe(5000)
  })

  it('stops listening on unmount', () => {
    const { unmount } = renderHook(() => useVisitorActivity())
    unmount()
    now = 9000
    act(() => window.dispatchEvent(new Event('pointerdown')))
    expect(useSceneStore.getState().lastActivity).toBe(1000)
  })
})
