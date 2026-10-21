import { describe, expect, it } from 'vitest'

import { chunk } from './usePhoneGrid'

describe('chunk', () => {
  it('splits into rows of the given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 3)).toEqual([
      [1, 2, 3],
      [4, 5],
    ])
    expect(chunk([], 3)).toEqual([])
  })
})
