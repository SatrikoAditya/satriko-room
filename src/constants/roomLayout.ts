import type { ObjectId, Vec3 } from '@interfaces/section'

export type DecorId =
  | 'bed'
  | 'nightstand'
  | 'desk'
  | 'sideTable'
  | 'mug'
  | 'rug'
  | 'beanbag'
  | 'plant'
  | 'door'
  | 'window'
  | 'oyenNight'
  | 'chair'

export interface Placement {
  position: Vec3
  rotationY?: number
  /** In the piece's own axes: width (local x), height, depth (local z). */
  size?: Vec3
}

/**
 * Places a child in its parent's own frame: local x runs along the parent's
 * width and local z toward its front. With the parent turned by `rotationY`,
 * local +x points to world (cos, -sin) and local +z to (sin, cos), so a desk
 * and everything on it move and turn as one.
 */
export function attach(
  parent: Placement,
  [x, y, z]: Vec3,
  yaw = 0,
  size?: Vec3,
): Placement {
  const a = parent.rotationY ?? 0
  const [px, py, pz] = parent.position
  return {
    position: [
      px + x * Math.cos(a) + z * Math.sin(a),
      py + y,
      pz - x * Math.sin(a) + z * Math.cos(a),
    ],
    rotationY: a + yaw,
    ...(size && { size }),
  }
}

// Parents first: what stands on or beside them is attached below.
// The window wall (x = -5) holds the work things, all facing +x into the room.
const FACE_ROOM = Math.PI / 2
const desk: Placement = {
  position: [-4.2, 0, 0.2],
  rotationY: FACE_ROOM,
  size: [3.0, 0.75, 1.2],
}
const sideTable: Placement = {
  position: [-4.45, 0, -2.15],
  rotationY: FACE_ROOM,
  size: [0.9, 0.6, 0.7],
}
const bookshelf: Placement = {
  position: [-4.55, 0, 2.9],
  rotationY: FACE_ROOM,
  size: [1.6, 2.6, 0.5],
}
// Head at the open front edge, as if against the cut-away wall, foot toward the
// TV. The bed is built with its pillow at local -z, so it turns half a circle.
// Its top sits about a unit above the floor, which the 30° camera shows up and
// to the left, so the bed stands 0.6 right of the rug's centre line to look
// centred on the rug and the TV.
const bed: Placement = {
  position: [0.6, 0, 3.15],
  rotationY: Math.PI,
  size: [2.2, 0.6, 3.4],
}
// Beside the head, on the desk side.
const nightstand: Placement = {
  position: [-1.0, 0, 4.25],
  size: [0.8, 0.6, 0.8],
}
const deskTop = desk.size![1]

// Wall-hung items sit flush on the wall faces at x/z = -5.
export const roomLayout: Record<ObjectId | DecorId, Placement> = {
  // window wall (x = -5), from the corner: frames above the printer, the desk
  // under the window, the bookshelf.
  'edu-frames': { position: [-4.965, 3.1, -3.0] },
  window: { position: [-4.95, 3.1, 0.2], size: [0.08, 1.8, 2.4] },
  sideTable,
  printer: attach(sideTable, [0, sideTable.size![1], 0]),
  desk,
  pc: attach(desk, [0, deskTop, -0.3]),
  // Turned toward the camera and the chair, not straight out from the wall.
  'photo-frame': attach(desk, [-0.9, deskTop, 0.2], -0.5),
  mug: attach(desk, [1.1, deskTop, 0.3]),
  // At the end of the desk away from the laptop.
  'desk-lamp': attach(desk, [-1.3, deskTop, -0.3]),
  // Pulled out from the desk and turned toward the room, as if just vacated.
  chair: attach(desk, [0.7, 0, 1.05], -0.6),
  bookshelf,
  radio: attach(bookshelf, [-0.4, bookshelf.size![1], 0]),
  // door wall (z = -5): the hobby wall. The map and gear stand about a unit
  // out of the corner, clear of the printer, with room left before the TV;
  // the clocks hang above the TV.
  'hiking-gear': { position: [-3.7, 0, -4.3], rotationY: Math.PI / 4 },
  'dive-gear': { position: [-2.2, 0, -4.4], rotationY: Math.PI / 4 },
  // y 2.76 lines the frame's bottom edge up with the window's (y 2.2).
  'indonesia-map': { position: [-2.9, 2.76, -4.965], size: [2.0, 1.0, 0.06] },
  tv: { position: [0, 0, -4.63], rotationY: 0 },
  // Above the TV, placed by eye (Satriko): the faces and the city plates under
  // them span y 2.07 to 2.83.
  clocks: { position: [0.15, 2.85, -4.965] },
  'light-switch': { position: [3.5, 2.0, -4.995] },
  mailbox: { position: [3.5, 1.0, -4.995] },
  // Bogor is the City of Rain: an umbrella stand by the door, left of the
  // mailbox (whose hit box starts at x 3.2).
  'umbrella-stand': { position: [2.8, 0, -4.62] },
  door: { position: [4.35, 0, -4.935], size: [1.1, 2.6, 0.12] },
  // floor: the rug and beanbag face the TV, the bed behind them.
  rug: { position: [0, 0.02, -1.3], size: [4.6, 0.04, 3.8] },
  beanbag: { position: [1.1, 0, -1.9] },
  oyen: { position: [-0.7, 0, -1.0], rotationY: Math.PI / 4 },
  bed,
  nightstand,
  'bedside-lamp': attach(nightstand, [0, nightstand.size![1], 0]),
  // Curled on the blanket near the foot, facing the camera.
  oyenNight: attach(bed, [0, 1.0, 0.6], Math.PI / 4 - Math.PI),
  plant: { position: [4.4, 0, 4.2] },
}
