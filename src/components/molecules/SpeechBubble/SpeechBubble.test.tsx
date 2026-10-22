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

  const tailCentre = () => {
    const card = document.querySelector<HTMLElement>('button.stitched')!
    const tail = card.querySelector<HTMLElement>('[data-bubble-tail]')!
    return parseFloat(card.style.left) + parseFloat(tail.style.left) + 8
  }
  it('points its tail at Oyen', () => {
    render(
      <MotionConfig reducedMotion="always">
        <SpeechBubble />
      </MotionConfig>,
    )
    act(() => useSceneStore.getState().setBubble('Meow!'))
    expect(tailCentre()).toBe(300)
  })
  it('keeps the tail on Oyen when the bubble is pushed in from a screen edge', () => {
    useSceneStore.setState({
      oyenAnchor: { x: window.innerWidth - 30, y: 400 },
    })
    render(
      <MotionConfig reducedMotion="always">
        <SpeechBubble />
      </MotionConfig>,
    )
    act(() => useSceneStore.getState().setBubble('Meow!'))
    expect(Math.abs(tailCentre() - (window.innerWidth - 30))).toBeLessThan(10)
  })
})
