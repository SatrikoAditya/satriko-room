// Each mountain's silhouette for the Hiking skyline and journal page
// (decision 57), drawn from its real profile. Points run left to right between
// the two base corners: x from -1 to 1 across the mountain's width, y from 0
// (base) to 1 (summit). The outline is smoothed between them.
export interface IMountainShape {
  points: readonly (readonly [x: number, y: number])[]
  /** A wisp of smoke over an active crater. */
  smoke?: boolean
  /** Where the smoke rises from (the crater), if not the summit. */
  vent?: readonly [x: number, y: number]
  /** Rises straight from the sea (an island volcano). */
  sea?: boolean
}

export const genericMountain: IMountainShape = {
  points: [
    [-0.5, 0.45],
    [-0.1, 0.95],
    [0, 1],
    [0.1, 0.95],
    [0.5, 0.45],
  ],
}

export const mountainShapes: Record<string, IMountainShape> = {
  // A long massif of several summits; Salak I is the highest.
  salak: {
    points: [
      [-0.75, 0.4],
      [-0.45, 0.85],
      [-0.3, 1],
      [-0.12, 0.8],
      [0.08, 0.93],
      [0.3, 0.72],
      [0.5, 0.78],
      [0.75, 0.4],
    ],
  },
  // A smoking crater rim, cut by a notch.
  gede: {
    points: [
      [-0.6, 0.45],
      [-0.25, 0.9],
      [-0.1, 1],
      [0.02, 0.86],
      [0.14, 0.97],
      [0.5, 0.5],
    ],
    smoke: true,
    vent: [0.02, 0.86],
  },
  // Gede's twin: a clean, rounded cone.
  pangrango: {
    points: [
      [-0.55, 0.42],
      [-0.2, 0.9],
      [0, 1],
      [0.2, 0.9],
      [0.55, 0.42],
    ],
  },
  // A broken, open crater with a jagged rim.
  papandayan: {
    points: [
      [-0.75, 0.38],
      [-0.45, 0.78],
      [-0.28, 1],
      [-0.12, 0.68],
      [0.05, 0.84],
      [0.2, 0.62],
      [0.38, 0.88],
      [0.65, 0.45],
    ],
    smoke: true,
    vent: [-0.12, 0.68],
  },
  // Tall and symmetric, with a small flat crater on top.
  ciremai: {
    points: [
      [-0.6, 0.38],
      [-0.18, 0.92],
      [-0.07, 1],
      [0.07, 1],
      [0.18, 0.92],
      [0.6, 0.38],
    ],
  },
  // A steep, sharp pyramid.
  cikuray: {
    points: [
      [-0.62, 0.22],
      [-0.32, 0.58],
      [-0.04, 0.97],
      [0, 1],
      [0.04, 0.97],
      [0.32, 0.58],
      [0.62, 0.22],
    ],
  },
  // A huge, broad cone with a wide summit and a smoking crater.
  slamet: {
    points: [
      [-0.8, 0.32],
      [-0.45, 0.78],
      [-0.18, 0.98],
      [0.18, 0.98],
      [0.45, 0.78],
      [0.8, 0.32],
    ],
    smoke: true,
  },
  // Twin summits with a saddle between them.
  merbabu: {
    points: [
      [-0.65, 0.42],
      [-0.32, 0.92],
      [-0.16, 1],
      [0, 0.8],
      [0.16, 0.95],
      [0.32, 0.88],
      [0.65, 0.42],
    ],
  },
  // A broad massif with several gentle tops.
  lawu: {
    points: [
      [-0.8, 0.38],
      [-0.5, 0.78],
      [-0.28, 0.9],
      [-0.06, 1],
      [0.16, 0.88],
      [0.36, 0.94],
      [0.65, 0.55],
    ],
  },
  // A small, narrow ridge of bumps, like a camel's back.
  andong: {
    points: [
      [-0.75, 0.45],
      [-0.48, 0.88],
      [-0.26, 0.74],
      [0, 1],
      [0.26, 0.76],
      [0.48, 0.86],
      [0.75, 0.42],
    ],
  },
  // A wide caldera: a flat top with a deep notch, smoking.
  raung: {
    points: [
      [-0.8, 0.38],
      [-0.5, 0.84],
      [-0.34, 0.98],
      [-0.22, 1],
      [-0.1, 0.8],
      [0.1, 0.8],
      [0.22, 0.98],
      [0.36, 0.96],
      [0.5, 0.84],
      [0.8, 0.38],
    ],
    smoke: true,
    vent: [0, 0.8],
  },
  // Two rounded humps (Kawi and Butak).
  kawi: {
    points: [
      [-0.7, 0.48],
      [-0.38, 0.94],
      [-0.18, 1],
      [0.04, 0.78],
      [0.3, 0.9],
      [0.62, 0.48],
    ],
  },
  // A low, jagged rim around its crater.
  kelud: {
    points: [
      [-0.72, 0.42],
      [-0.46, 0.84],
      [-0.3, 1],
      [-0.14, 0.72],
      [0.1, 0.8],
      [0.3, 0.95],
      [0.62, 0.48],
    ],
  },
  // A truncated cone with a wide, smoking crater, on a flat sand sea.
  bromo: {
    points: [
      [-0.95, 0.06],
      [-0.62, 0.14],
      [-0.42, 0.68],
      [-0.28, 0.97],
      [-0.14, 1],
      [-0.05, 0.94],
      [0.05, 0.94],
      [0.14, 1],
      [0.28, 0.97],
      [0.42, 0.68],
      [0.62, 0.14],
      [0.95, 0.06],
    ],
    smoke: true,
    vent: [0, 0.94],
  },
  // A symmetric island cone rising from the sea.
  'api-banda': {
    points: [
      [-0.6, 0.3],
      [-0.22, 0.9],
      [0, 1],
      [0.22, 0.9],
      [0.6, 0.3],
    ],
    smoke: true,
    sea: true,
  },
}

export const shapeOf = (id: string) => mountainShapes[id] ?? genericMountain
