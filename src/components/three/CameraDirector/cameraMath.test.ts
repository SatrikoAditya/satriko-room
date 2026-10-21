import { Box3, Vector3 } from 'three'
import { describe, expect, it } from 'vitest'

import { fitIsometric, lookAtArgs } from './cameraMath'

describe('lookAtArgs', () => {
  it('returns camera position then target', () => {
    expect(lookAtArgs([0, 1, 0], [10, 8, 10])).toEqual([10, 9, 10, 0, 1, 0])
  })
})

describe('fitIsometric', () => {
  it('keeps the look direction and fits the box inside the viewport', () => {
    const box = new Box3(new Vector3(-5, 0, -5), new Vector3(5, 6, 5))
    const pad = {
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
    }
    const { args, zoom } = fitIsometric(
      box,
      [0, 1, 0],
      [10, 8, 10],
      1000,
      800,
      pad,
    )
    expect(zoom).toBeGreaterThan(0)
    // direction from camera to target is unchanged by the centring shift
    expect(args[3] - args[0]).toBeCloseTo(-10)
    expect(args[4] - args[1]).toBeCloseTo(-8)
    expect(args[5] - args[2]).toBeCloseTo(-10)
  })
})
