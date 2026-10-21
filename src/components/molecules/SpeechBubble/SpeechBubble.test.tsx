import { act, render, screen } from '@testing-library/react'
import { MotionConfig } from 'motion/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSceneStore } from '@store/useSceneStore'

import SpeechBubble from '.'

describe('SpeechBubble', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useSceneStore.setState({ bubble: null, oyenAnchor: { x: 300, y: 400 } })
  })
  afterEach(() => vi.useRealTimers())
  it('announces the full line to assistive tech immediately and hides after 6s', () => {
    render(
      <MotionConfig reducedMotion="always">
        <SpeechBubble />
      </MotionConfig>,
    )
    act(() => useSceneStore.getState().setBubble('Meow! Welcome.'))
    expect(screen.getByRole('status')).toHaveTextContent('Meow! Welcome.')
    act(() => {
      vi.advanceTimersByTime(6500)
    })
    expect(useSceneStore.getState().bubble).toBeNull()
  })
})
