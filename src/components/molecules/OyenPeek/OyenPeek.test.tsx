import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useSceneStore } from '@store/useSceneStore'

import OyenPeek from '.'

describe('OyenPeek', () => {
  afterEach(() => act(() => useSceneStore.getState().setTheme('day')))

  it("says the section's line, read as 'Oyen says'", () => {
    render(<OyenPeek slug="contact" animated={false} />)
    expect(screen.getByText(/I'll make sure he reads it/)).toHaveTextContent(
      /^Oyen says: Want to say hi to Satriko\?/,
    )
  })

  it('yawns before the same line at night', () => {
    act(() => useSceneStore.getState().setTheme('night'))
    render(<OyenPeek slug="hiking" animated={false} />)
    expect(
      screen.getByText(/Beside work, Satriko loves climbing mountains/),
    ).toHaveTextContent(
      /^Oyen says: yawn… Beside work, Satriko loves climbing mountains\./,
    )
  })
})
