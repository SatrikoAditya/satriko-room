import { roomLayout } from './roomLayout'

export type OyenSpotId =
  | 'home'
  | 'rugFront'
  | 'tvView'
  | 'hobbyCorner'
  | 'printer'
  | 'deskCorner'
  | 'deskSide'
  | 'bookshelf'
  | 'bedFoot'
  | 'bedSide'
  | 'frontRight'
  | 'middleRight'
  | 'beanbag'
  | 'clocks'
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
  // the rug, the TV and the hobby corner
  rugFront: [0.4, 0.0],
  tvView: [-1.0, -3.2],
  hobbyCorner: [-1.6, -3.3],
  // along the window wall: the printer, the desk, the bookshelf
  printer: [-3.1, -2.7],
  deskCorner: [-2.0, -1.3],
  deskSide: [-2.4, 1.6],
  bookshelf: [-3.3, 3.6],
  // beside the bed, toward the front
  bedFoot: [2.4, 0.6],
  bedSide: [2.4, 2.6],
  frontRight: [2.4, 4.0],
  // the open right side: beanbag, clocks, door
  middleRight: [3.0, -0.3],
  beanbag: [2.6, -1.5],
  clocks: [2.6, -3.8],
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
  ['home', 'deskCorner'],
  ['home', 'deskSide'],
  ['rugFront', 'bedFoot'],
  ['rugFront', 'middleRight'],
  ['tvView', 'hobbyCorner'],
  ['hobbyCorner', 'printer'],
  ['printer', 'deskCorner'],
  ['deskCorner', 'deskSide'],
  ['deskSide', 'bookshelf'],
  ['bedFoot', 'bedSide'],
  ['bedFoot', 'middleRight'],
  ['bedSide', 'frontRight'],
  ['middleRight', 'beanbag'],
  ['middleRight', 'door'],
  ['beanbag', 'clocks'],
  ['clocks', 'door'],
]
