import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'
import { useSceneStore } from '@store/useSceneStore'

import Loader from '.'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

describe('Loader', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    useRoomStore.setState({ phase: 'loading' })
    useSceneStore.setState({ webgl: 'unknown', sceneReady: false, progress: 0 })
  })
  afterEach(() => vi.useRealTimers())

  it('opens the gate with a simple-view button when WebGL is unsupported', () => {
    useSceneStore.setState({ webgl: 'unsupported' })
    render(<Loader onEnter={() => {}} />)
    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(useRoomStore.getState().phase).toBe('gate')
    expect(
      screen.getByRole('button', { name: 'Enter (simple view)' }),
    ).toHaveFocus()
  })
  it('waits for the scene and the minimum time, then offers Enter', async () => {
    useSceneStore.setState({ webgl: 'supported' })
    const onEnter = vi.fn()
    render(<Loader onEnter={onEnter} />)
    act(() => {
      useSceneStore.setState({ sceneReady: true, progress: 100 })
    })
    act(() => {
      vi.advanceTimersByTime(700)
    })
    const button = screen.getByRole('button', { name: 'Enter the room' })
    expect(button).toHaveFocus()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    await user.click(button)
    expect(onEnter).toHaveBeenCalled()
  })
})
