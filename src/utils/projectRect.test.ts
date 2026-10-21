import { describe, expect, it } from 'vitest'

import { ndcPointsToRect } from './projectRect'

describe('ndcPointsToRect', () => {
  it('maps the full NDC square onto the whole viewport', () => {
    expect(
      ndcPointsToRect(
        [
          { x: -1, y: 1 },
          { x: 1, y: -1 },
        ],
        800,
        600,
      ),
    ).toEqual({ x: 0, y: 0, width: 800, height: 600 })
  })
  it('flips y and takes the bounding box of all points', () => {
    expect(
      ndcPointsToRect(
        [
          { x: 0, y: 0 },
          { x: 0.5, y: 0.5 },
          { x: 0.25, y: 0.1 },
        ],
        200,
        100,
      ),
    ).toEqual({ x: 100, y: 25, width: 50, height: 25 })
  })
})
