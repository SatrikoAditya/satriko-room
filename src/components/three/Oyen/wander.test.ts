import { describe, expect, it } from 'vitest'

import { DEFAULT_CAMERA_OFFSET } from '@constants/camera'
import {
  OYEN_IDLE_MS,
  OYEN_PAUSE_MS,
  OYEN_REST_MS,
  OYEN_WALK_SPEED,
  oyenPaths,
  oyenSpots,
  type OyenSpotId,
} from '@constants/oyen'
import { roomLayout } from '@constants/roomLayout'

import {
  angleDelta,
  neighbours,
  nextPause,
  nextSpot,
  shouldWander,
  stepToward,
  yawToward,
  type WanderConditions,
} from './wander'

/** Small deterministic generator so the random choices are repeatable. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CAT_RADIUS = 0.45
const FLOOR_MARGIN = 0.5
type Box = readonly [number, number, number, number] // xmin, xmax, zmin, zmax

function footprint(id: keyof typeof roomLayout): Box {
  const { position, size } = roomLayout[id]
  const [sx, , sz] = size!
  return [
    position[0] - sx / 2,
    position[0] + sx / 2,
    position[2] - sz / 2,
    position[2] + sz / 2,
  ]
}

// Floor furniture with a size in roomLayout, plus the code-built pieces
// measured from their components (TV stand 1.4 × 0.5 turned 90°, etc.).
const boxes: Record<string, Box> = {
  bed: footprint('bed'),
  nightstand: footprint('nightstand'),
  desk: footprint('desk'),
  sideTable: footprint('sideTable'),
  bookshelf: footprint('bookshelf'),
  tv: [-1.45, -0.95, 0.3, 1.7],
}
const atFloor = (id: keyof typeof roomLayout, radius: number) =>
  [roomLayout[id].position[0], roomLayout[id].position[2], radius] as const
const circles: Record<string, readonly [number, number, number]> = {
  beanbag: atFloor('beanbag', 0.6),
  plant: atFloor('plant', 0.45),
  diveGear: atFloor('dive-gear', 0.4),
  hikingGear: atFloor('hiking-gear', 0.7),
  chair: atFloor('chair', 0.5),
}
// Oyen never stands in front of the desk, so it can't cover the PC.
const deskFront: Box = [-1.6, 1.6, -3.6, -2.6]

const inBox = ([x, z]: readonly [number, number], b: Box, grow = 0) =>
  x > b[0] - grow && x < b[1] + grow && z > b[2] - grow && z < b[3] + grow

function blockedBy(p: readonly [number, number]): string | null {
  if (Math.abs(p[0]) > 5 - FLOOR_MARGIN || Math.abs(p[1]) > 5 - FLOOR_MARGIN)
    return 'floor edge'
  for (const [name, b] of Object.entries(boxes))
    if (inBox(p, b, CAT_RADIUS)) return name
  for (const [name, [x, z, r]] of Object.entries(circles))
    if (Math.hypot(p[0] - x, p[1] - z) < r + CAT_RADIUS) return name
  if (inBox(p, deskFront)) return 'desk front'
  return null
}

describe('Oyen paths', () => {
  const ids = Object.keys(oyenSpots) as OyenSpotId[]

  it('connect every spot to home', () => {
    const seen = new Set<OyenSpotId>(['home'])
    const queue: OyenSpotId[] = ['home']
    while (queue.length > 0)
      for (const n of neighbours(queue.shift()!))
        if (!seen.has(n)) {
          seen.add(n)
          queue.push(n)
        }
    expect([...seen].sort()).toEqual([...ids].sort())
  })

  it('start at the daytime seat', () => {
    expect(oyenSpots.home).toEqual([
      roomLayout.oyen.position[0],
      roomLayout.oyen.position[2],
    ])
  })

  it.each(ids)('place %s on free floor', (id) => {
    expect(blockedBy(oyenSpots[id])).toBeNull()
  })

  it.each(oyenPaths.map(([a, b]) => [`${a} → ${b}`, a, b] as const))(
    'keep %s clear of furniture, the edge and the desk front',
    (_, a, b) => {
      const [ax, az] = oyenSpots[a]
      const [bx, bz] = oyenSpots[b]
      const samples = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.05)
      for (let i = 0; i <= samples; i++) {
        const t = i / samples
        expect(blockedBy([ax + (bx - ax) * t, az + (bz - az) * t])).toBeNull()
      }
    },
  )

  it.each(ids)('keep %s in view of the default camera', (id) => {
    // Seen from the default camera, sideways (u) and depth (d, bigger is farther).
    const [ox, oy, oz] = DEFAULT_CAMERA_OFFSET
    const horizontal = Math.hypot(ox, oz)
    const [fx, fz] = [ox / horizontal, oz / horizontal]
    const tanElevation = oy / horizontal
    const view = ([x, z]: readonly [number, number]) =>
      [x * fz - z * fx, -(x * fx + z * fz)] as const
    const CAT_HEIGHT = 0.8
    const [u, d] = view(oyenSpots[id])
    // Furniture tall enough to hide a cat, with its height (measured from the objects).
    const occluders: [Box, number][] = [
      [boxes.tv, 1.35],
      [boxes.bed, 1.08],
      [boxes.desk, 1.45],
      [boxes.bookshelf, 2.6],
      [boxes.nightstand, 1.1],
      [boxes.sideTable, 0.96],
      ...Object.entries(circles).map(
        ([name, [x, z, r]]) =>
          [
            [x - r, x + r, z - r, z + r] as Box,
            { beanbag: 0.77, plant: 1.1, diveGear: 1.0, hikingGear: 0.8 }[
              name
            ]!,
          ] as [Box, number],
      ),
    ]
    let hidden = 0
    for (const [b, height] of occluders)
      for (let x = b[0]; x <= b[1]; x += 0.05)
        for (let z = b[2]; z <= b[3]; z += 0.05) {
          const [qu, qd] = view([x, z])
          if (Math.abs(qu - u) > 0.35 || qd >= d - 0.35) continue
          hidden = Math.max(hidden, height - (d - qd) * tanElevation)
        }
    // At most the bottom 45% of Oyen may be covered.
    expect(Math.min(hidden, CAT_HEIGHT)).toBeLessThan(CAT_HEIGHT * 0.45)
  })

  it('list each path once, between two different spots', () => {
    const keys = oyenPaths.map(([a, b]) => [a, b].sort().join('|'))
    expect(new Set(keys).size).toBe(keys.length)
    for (const [a, b] of oyenPaths) expect(a).not.toBe(b)
  })
})

describe('nextSpot', () => {
  it('picks a neighbour and does not walk straight back', () => {
    const rng = seeded(1)
    for (let i = 0; i < 200; i++) {
      const spot = nextSpot('home', 'rugFront', rng)
      expect(neighbours('home')).toContain(spot)
      expect(spot).not.toBe('rugFront')
    }
  })

  it('goes back only from a dead end', () => {
    expect(neighbours('printer')).toEqual(['window'])
    expect(nextSpot('printer', 'window', seeded(2))).toBe('window')
  })

  it('repeats the same choices for the same seed', () => {
    const walk = (seed: number) => {
      const rng = seeded(seed)
      let previous: OyenSpotId | null = null
      let spot: OyenSpotId = 'home'
      const route: OyenSpotId[] = []
      for (let i = 0; i < 10; i++) {
        const next = nextSpot(spot, previous, rng)
        previous = spot
        spot = next
        route.push(spot)
      }
      return route
    }
    expect(walk(7)).toEqual(walk(7))
  })
})

describe('nextPause', () => {
  it('stops for 3–8 s with one of the cat behaviours', () => {
    const rng = seeded(3)
    const seen = new Set<string>()
    for (let i = 0; i < 300; i++) {
      const pause = nextPause(1, 4, rng)
      expect(pause.longRest).toBe(false)
      expect(pause.durationMs).toBeGreaterThanOrEqual(OYEN_PAUSE_MS[0])
      expect(pause.durationMs).toBeLessThanOrEqual(OYEN_PAUSE_MS[1])
      seen.add(pause.behaviour)
    }
    expect([...seen].sort()).toEqual(['groom', 'loaf', 'look'])
  })

  it('takes a long loaf once enough hops have passed', () => {
    const pause = nextPause(4, 4, seeded(4))
    expect(pause).toMatchObject({ behaviour: 'loaf', longRest: true })
    expect(pause.durationMs).toBeGreaterThanOrEqual(OYEN_REST_MS[0])
    expect(pause.durationMs).toBeLessThanOrEqual(OYEN_REST_MS[1])
  })
})

describe('stepToward', () => {
  it('turns on the spot before walking when facing away', () => {
    const step = stepToward([0, 0], Math.PI, [0, 2], 0.1)
    expect(step.position).toEqual([0, 0])
    expect(step.moving).toBe(false)
    expect(Math.abs(angleDelta(step.yaw, 0))).toBeLessThan(Math.PI)
  })

  it('walks at most speed × time and arrives without overshooting', () => {
    let position: readonly [number, number] = [0, 0]
    let yaw = 0
    let arrived = false
    for (let i = 0; i < 100 && !arrived; i++) {
      const step = stepToward(position, yaw, [0, 1], 0.1)
      expect(
        Math.hypot(
          step.position[0] - position[0],
          step.position[1] - position[1],
        ),
      ).toBeLessThanOrEqual(OYEN_WALK_SPEED * 0.1 + 1e-9)
      ;({ position, yaw, arrived } = step)
    }
    expect(arrived).toBe(true)
    expect(position).toEqual([0, 1])
  })
})

describe('angles', () => {
  it('wrap the shortest way round', () => {
    expect(angleDelta(0.1, -0.1)).toBeCloseTo(-0.2)
    expect(angleDelta(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(0.2)
  })

  it('point the face (+z) toward a target', () => {
    expect(yawToward([0, 0], [0, 1])).toBeCloseTo(0)
    expect(yawToward([0, 0], [1, 0])).toBeCloseTo(Math.PI / 2)
  })
})

describe('shouldWander', () => {
  const base: WanderConditions = {
    now: 10_000,
    lastActivity: 10_000 - OYEN_IDLE_MS,
    ready: true,
    panelOpen: false,
    talking: false,
    night: false,
    reducedMotion: false,
  }

  it('wanders after the idle time with nothing else going on', () => {
    expect(shouldWander(base)).toBe(true)
    expect(shouldWander({ ...base, lastActivity: base.lastActivity + 1 })).toBe(
      false,
    )
  })

  it.each([
    ['the room is not ready', { ready: false }],
    ['a panel is open', { panelOpen: true }],
    ['Oyen is talking', { talking: true }],
    ['it is night', { night: true }],
    ['reduced motion is on', { reducedMotion: true }],
  ] as const)('stays put when %s', (_, change) => {
    expect(shouldWander({ ...base, ...change })).toBe(false)
  })
})
