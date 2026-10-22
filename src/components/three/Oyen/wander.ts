// Pure helpers for Oyen's wandering: where to go, how long to stop, and how to step.
import {
  OYEN_HOPS_BEFORE_REST,
  OYEN_IDLE_MS,
  OYEN_PAUSE_MS,
  OYEN_REST_MS,
  OYEN_TURN_SPEED,
  OYEN_WALK_ANGLE,
  OYEN_WALK_SPEED,
  oyenPaths,
  oyenPauseWeights,
  type OyenPause,
  type OyenSpotId,
} from '@constants/oyen'

/** Returns a number in [0, 1), like `Math.random`. */
export type Rng = () => number
export type FloorPoint = readonly [number, number] // x, z

export interface Pause {
  behaviour: OyenPause
  durationMs: number
  longRest: boolean
}

export interface Step {
  position: [number, number]
  yaw: number
  /** True once Oyen stands on the target. */
  arrived: boolean
  /** False while Oyen only turns on the spot. */
  moving: boolean
}

export interface WanderConditions {
  now: number
  lastActivity: number
  ready: boolean
  panelOpen: boolean
  talking: boolean
  night: boolean
  reducedMotion: boolean
}

const between = (range: readonly [number, number], rng: Rng) =>
  range[0] + (range[1] - range[0]) * rng()

export function neighbours(spot: OyenSpotId): OyenSpotId[] {
  return oyenPaths.flatMap(([a, b]) =>
    a === spot ? [b] : b === spot ? [a] : [],
  )
}

/** A random neighbouring spot; Oyen only walks straight back from a dead end. */
export function nextSpot(
  current: OyenSpotId,
  previous: OyenSpotId | null,
  rng: Rng,
): OyenSpotId {
  const options = neighbours(current)
  const fresh = options.filter((spot) => spot !== previous)
  const pool = fresh.length > 0 ? fresh : options
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))]
}

/** How many hops before the next long rest. */
export function hopsBeforeRest(rng: Rng): number {
  return Math.round(between(OYEN_HOPS_BEFORE_REST, rng))
}

/** What Oyen does at the spot it just reached. */
export function nextPause(
  hopsSinceRest: number,
  restAfter: number,
  rng: Rng,
): Pause {
  if (hopsSinceRest >= restAfter)
    return {
      behaviour: 'loaf',
      durationMs: between(OYEN_REST_MS, rng),
      longRest: true,
    }
  let roll = rng()
  let behaviour: OyenPause = 'look'
  for (const [name, weight] of Object.entries(oyenPauseWeights) as [
    OyenPause,
    number,
  ][]) {
    behaviour = name
    if (roll < weight) break
    roll -= weight
  }
  return {
    behaviour,
    durationMs: between(OYEN_PAUSE_MS, rng),
    longRest: false,
  }
}

/** Shortest signed turn from one angle to another, in (-π, π]. */
export function angleDelta(from: number, to: number): number {
  const full = Math.PI * 2
  const d = (((to - from) % full) + full) % full
  return d > Math.PI ? d - full : d
}

/** The yaw that turns Oyen's face (+z in its own space) from one point toward another. */
export function yawToward(from: FloorPoint, to: FloorPoint): number {
  return Math.atan2(to[0] - from[0], to[1] - from[1])
}

/** One frame of walking: turn toward the target, and move once roughly facing it. */
export function stepToward(
  position: FloorPoint,
  yaw: number,
  target: FloorPoint,
  dt: number,
  speed: number = OYEN_WALK_SPEED,
): Step {
  const dx = target[0] - position[0]
  const dz = target[1] - position[1]
  const distance = Math.hypot(dx, dz)
  if (distance < 1e-6)
    return {
      position: [target[0], target[1]],
      yaw,
      arrived: true,
      moving: false,
    }
  const turn = angleDelta(yaw, Math.atan2(dx, dz))
  const maxTurn = OYEN_TURN_SPEED * dt
  const nextYaw = yaw + Math.max(-maxTurn, Math.min(maxTurn, turn))
  if (Math.abs(turn) > OYEN_WALK_ANGLE)
    return {
      position: [position[0], position[1]],
      yaw: nextYaw,
      arrived: false,
      moving: false,
    }
  const travel = speed * dt
  if (travel >= distance)
    return {
      position: [target[0], target[1]],
      yaw: nextYaw,
      arrived: true,
      moving: true,
    }
  return {
    position: [
      position[0] + (dx / distance) * travel,
      position[1] + (dz / distance) * travel,
    ],
    yaw: nextYaw,
    arrived: false,
    moving: travel > 0,
  }
}

/** Oyen wanders only in the day, in a ready room with no panel, bubble or recent activity. */
export function shouldWander(c: WanderConditions): boolean {
  return (
    c.ready &&
    !c.panelOpen &&
    !c.talking &&
    !c.night &&
    !c.reducedMotion &&
    c.now - c.lastActivity >= OYEN_IDLE_MS
  )
}
