import { describe, expect, it } from 'vitest'

import { attach, type Placement } from './roomLayout'

const close = (a: readonly number[], b: readonly number[]) =>
  a.forEach((v, i) => expect(v).toBeCloseTo(b[i]))

describe('attach', () => {
  it('offsets a child in the parent’s frame when the parent faces +z', () => {
    const parent: Placement = { position: [1, 0, -4] }
    const child = attach(parent, [0.5, 0.75, -0.3], 0.2)
    close(child.position, [1.5, 0.75, -4.3])
    expect(child.rotationY).toBeCloseTo(0.2)
  })

  it('turns the offset with the parent: facing +x, local +x points to -z and local +z to +x', () => {
    const parent: Placement = { position: [-4, 0, 0], rotationY: Math.PI / 2 }
    close(attach(parent, [1, 0, 0]).position, [-4, 0, -1])
    close(attach(parent, [0, 0, 1]).position, [-3, 0, 0])
    expect(attach(parent, [0, 0, 0], -0.6).rotationY).toBeCloseTo(
      Math.PI / 2 - 0.6,
    )
  })

  it('keeps the child’s own size', () => {
    const child = attach({ position: [0, 0, 0] }, [0, 0, 0], 0, [1, 2, 3])
    expect(child.size).toEqual([1, 2, 3])
  })
})
