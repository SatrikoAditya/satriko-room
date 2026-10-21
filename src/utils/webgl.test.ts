import { afterEach, describe, expect, it, vi } from 'vitest'

import { detectWebGL } from './webgl'

describe('detectWebGL', () => {
  afterEach(() => vi.restoreAllMocks())
  it('is false when the browser returns no context (jsdom)', () => {
    expect(detectWebGL()).toBe(false)
  })
  it('is true when a context is returned', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as never,
    )
    expect(detectWebGL()).toBe(true)
  })
  it('releases the probe context so it does not count against the page', () => {
    const loseContext = vi.fn()
    const getExtension = vi.fn(() => ({ loseContext }))
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension,
    } as never)
    expect(detectWebGL()).toBe(true)
    expect(getExtension).toHaveBeenCalledWith('WEBGL_lose_context')
    expect(loseContext).toHaveBeenCalled()
  })
  it('is false when getContext throws', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () => {
        throw new Error('x')
      },
    )
    expect(detectWebGL()).toBe(false)
  })
})
