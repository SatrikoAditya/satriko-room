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
  size?: Vec3
}

// Tuned in the Task 19 style test (wall-hung items sit flush on the wall faces at x/z = -5).
export const roomLayout: Record<ObjectId | DecorId, Placement> = {
  // left wall (x = -5)
  'edu-frames': { position: [-4.965, 3.5, 2.0] },
  window: { position: [-4.95, 3.1, -2.0], size: [0.08, 1.8, 2.4] },
  bed: { position: [-3.8, 0, 2.0], size: [2.2, 0.6, 3.4] },
  nightstand: { position: [-4.3, 0, 4.3], size: [0.8, 0.6, 0.8] },
  'bedside-lamp': { position: [-4.3, 0.6, 4.3] },
  // right wall (z = -5)
  desk: { position: [0, 0, -4.2], size: [3.0, 0.75, 1.2] },
  pc: { position: [0, 0.75, -4.5] },
  'photo-frame': { position: [-0.9, 0.75, -4.0], rotationY: 0.35 },
  mug: { position: [1.1, 0.75, -3.9] },
  // Moved to the printer side of the desk to make room for the laptop.
  'desk-lamp': { position: [-1.3, 0.75, -4.5] },
  // Pulled out from the desk and turned toward the room, as if just vacated.
  chair: { position: [0.7, 0, -3.15], rotationY: -0.6 },
  // Centred on the map's height (y 2.76) so the back wall reads as one row:
  // the faces and the city plates under them span y 2.37 to 3.13.
  clocks: { position: [0, 3.15, -4.965] },
  sideTable: { position: [-2.2, 0, -4.3], size: [0.9, 0.6, 0.7] },
  printer: { position: [-2.2, 0.6, -4.3] },
  bookshelf: { position: [2.4, 0, -4.45], size: [1.6, 2.6, 0.5] },
  radio: { position: [2.0, 2.6, -4.45] },
  'light-switch': { position: [3.5, 2.0, -4.995] },
  mailbox: { position: [3.5, 1.0, -4.995] },
  door: { position: [4.35, 0, -4.935], size: [1.1, 2.6, 0.12] },
  // outdoor-hobby corner (where the walls meet): gear on the floor, map above.
  // Both pieces turn to face the camera, which looks in from +x, +z.
  // The backpack's boots sit on its right, so it takes the left-wall side where
  // they stay in view; the narrow dive stand goes against the back wall.
  'hiking-gear': { position: [-4.45, 0, -3.6], rotationY: Math.PI / 4 },
  'dive-gear': { position: [-3.45, 0, -4.4], rotationY: Math.PI / 4 },
  // y 2.76 lines the frame's bottom edge up with the window's (y 2.2).
  'indonesia-map': { position: [-3.8, 2.76, -4.965], size: [2.0, 1.0, 0.06] },
  // floor
  rug: { position: [0.8, 0.02, 0.8], size: [5, 0.04, 4] },
  tv: { position: [-1.2, 0, 1.0], rotationY: Math.PI / 2 },
  beanbag: { position: [1.8, 0, 2.2] },
  oyen: { position: [0.2, 0, 0.6], rotationY: Math.PI / 4 },
  oyenNight: { position: [-3.8, 1.0, 2.0], rotationY: Math.PI / 2 },
  plant: { position: [4.4, 0, 4.2] },
}
