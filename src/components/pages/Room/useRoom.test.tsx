import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'

import { useRoom } from './useRoom'

const nav = vi.hoisted(() => ({ pathname: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }))

describe('useRoom', () => {
  beforeEach(() => {
    nav.pathname = '/'
    useRoomStore.setState({
      phase: 'loading',
      transition: 'idle',
      originRect: null,
    })
    useSceneStore.setState({ sceneReady: false })
    vi.useRealTimers()
  })
  it('a direct link skips the gate and shows the panel at once', () => {
    nav.pathname = '/experience'
    const { result } = renderHook(() => useRoom('experience'))
    expect(result.current.showLoader).toBe(false)
    expect(useRoomStore.getState().phase).toBe('ready')
    expect(result.current.transition).toBe('idle')
  })
  it('opening in-app focuses when the scene is ready, otherwise opens directly', () => {
    useSceneStore.setState({ sceneReady: true })
    const { rerender } = renderHook(() => useRoom(null))
    nav.pathname = '/skills'
    rerender()
    expect(useRoomStore.getState().transition).toBe('focusing')
    useSceneStore.setState({ sceneReady: false })
    nav.pathname = '/'
    rerender()
    expect(useRoomStore.getState().transition).toBe('closing')
    nav.pathname = '/contact'
    rerender()
    expect(useRoomStore.getState().transition).toBe('open')
  })
  it('never stays in focusing longer than FOCUS_TIMEOUT_MS', () => {
    vi.useFakeTimers()
    useSceneStore.setState({ sceneReady: true })
    const { rerender } = renderHook(() => useRoom(null))
    nav.pathname = '/skills'
    rerender()
    act(() => {
      vi.advanceTimersByTime(1600)
    })
    expect(useRoomStore.getState().transition).toBe('open')
  })
})
