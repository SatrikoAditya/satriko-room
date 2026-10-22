import { roomLayout } from './roomLayout'

export type OyenSpotId =
  | 'home'
  | 'rugFront'
  | 'tvView'
  | 'beanbag'
  | 'rugCorner'
  | 'frontEdge'
  | 'bedSide'
  | 'bedFoot'
  | 'window'
  | 'middleBack'
  | 'printer'
  | 'bookshelf'
  | 'door'

/** What Oyen does when it stops at a spot. */
export type OyenPause = 'look' | 'groom' | 'loaf'

/** Quiet time (no click, tap or key press) before Oyen starts to wander. */
export const OYEN_IDLE_MS = 6000
/** Walking speed in room units per second (the room is 10 units wide). */
export const OYEN_WALK_SPEED = 0.7
/** Turning speed in radians per second. */
export const OYEN_TURN_SPEED = 3.5
/** Oyen turns on the spot until it faces within this angle (radians) of where it is going. */
export const OYEN_WALK_ANGLE = 0.35
/** Time to ease from walking to a halt, or from a halt to full speed. */
export const OYEN_STOP_SECONDS = 0.3
/** A normal stop at a spot, in milliseconds. */
export const OYEN_PAUSE_MS = [3000, 8000] as const
/** A long rest (lying down) after a few hops, in milliseconds. */
export const OYEN_REST_MS = [15000, 30000] as const
/** How many hops Oyen makes between long rests. */
export const OYEN_HOPS_BEFORE_REST = [3, 5] as const
/** The stretch after getting up from a loaf. */
export const OYEN_STRETCH_MS = 1000
/** How often each normal stop is chosen (they add up to 1). */
export const oyenPauseWeights: Readonly<Record<OyenPause, number>> = {
  look: 0.4,
  groom: 0.3,
  loaf: 0.3,
}

/** Floor spots (x, z) Oyen walks between. `home` is its daytime seat on the rug. */
export const oyenSpots: Readonly<
  Record<OyenSpotId, readonly [number, number]>
> = {
  home: [roomLayout.oyen.position[0], roomLayout.oyen.position[2]],
  rugFront: [1.6, 0.0],
  tvView: [0.3, 2.4],
  beanbag: [2.9, 2.9],
  rugCorner: [3.0, 1.2],
  frontEdge: [1.4, 4.0],
  bedSide: [-2.1, 2.5],
  bedFoot: [-2.0, 4.3],
  window: [-1.8, -1.6],
  middleBack: [0.6, -1.5],
  printer: [-2.3, -3.1],
  bookshelf: [2.6, -3.4],
  door: [3.6, -2.3],
}

/**
 * Straight paths between spots that clear the furniture, the floor edge and
 * the strip in front of the desk (checked by Oyen/wander.test.ts). No spot sits
 * where furniture hides it from the default camera (also tested).
 */
export const oyenPaths: readonly (readonly [OyenSpotId, OyenSpotId])[] = [
  ['home', 'rugFront'],
  ['home', 'tvView'],
  ['home', 'rugCorner'],
  ['home', 'middleBack'],
  ['rugFront', 'tvView'],
  ['rugFront', 'rugCorner'],
  ['rugFront', 'middleBack'],
  ['rugFront', 'door'],
  ['tvView', 'frontEdge'],
  ['tvView', 'bedSide'],
  ['tvView', 'bedFoot'],
  ['beanbag', 'rugCorner'],
  ['beanbag', 'frontEdge'],
  ['bedSide', 'bedFoot'],
  ['window', 'middleBack'],
  ['window', 'printer'],
  ['middleBack', 'bookshelf'],
  ['middleBack', 'door'],
  ['bookshelf', 'door'],
]
