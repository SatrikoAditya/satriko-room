import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import SceneErrorBoundary from './SceneErrorBoundary'

const Boom = () => {
  throw new Error('gl exploded')
}

describe('SceneErrorBoundary', () => {
  it('reports the error and renders nothing', () => {
    const onError = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(
      <SceneErrorBoundary onError={onError}>
        <Boom />
      </SceneErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'gl exploded' }),
    )
    expect(container).toBeEmptyDOMElement()
  })
})
