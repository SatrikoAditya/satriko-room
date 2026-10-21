import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'

import { useIdleHint } from './useIdleHint'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

describe('useIdleHint', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.localStorage.clear()
    useRoomStore.setState({ phase: 'ready' })
    useSceneStore.setState({ hint: null, bubble: null })
  })
  afterEach(() => vi.useRealTimers())
  it('hints the PC after 8s on a first visit, and stops once the visitor interacts', () => {
    renderHook(() => useIdleHint())
    act(() => {
      vi.advanceTimersByTime(8100)
    })
    expect(useSceneStore.getState().hint).toBe('pc')
    expect(useSceneStore.getState().bubble).toMatch(/try the PC/)
    act(() => {
      window.dispatchEvent(new Event('pointerdown'))
    })
    expect(useSceneStore.getState().hint).toBeNull()
    act(() => {
      vi.advanceTimersByTime(20000)
    })
    expect(useSceneStore.getState().hint).toBeNull()
  })
  it('does nothing on a returning visit', () => {
    window.localStorage.setItem('room:interacted', 'true')
    renderHook(() => useIdleHint())
    act(() => {
      vi.advanceTimersByTime(9000)
    })
    expect(useSceneStore.getState().hint).toBeNull()
  })
})
