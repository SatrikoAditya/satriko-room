import { shapeOf } from '@constants/mountainShapes'
import type { IHike } from '@models/hike'
import { formatMetres, mountainPath } from '@utils/hiking'

const W = 600
const H = 300
const BASE = 270
const MAX_PEAK = 200
const MIN_PEAK = 70
// [x, y, r] in the sky, visible only in the night theme.
const STARS = [
  [48, 40, 1.8],
  [120, 86, 1.3],
  [190, 28, 1.5],
  [420, 34, 1.7],
  [490, 80, 1.2],
  [556, 44, 1.8],
  [580, 110, 1.1],
] as const

/** Smoke over a crater, as three soft puffs drifting up and right. */
function Smoke({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true" style={{ fill: 'var(--scene-smoke)' }}>
      <circle cx={x + 3} cy={y - 10} r={6} />
      <circle cx={x + 11} cy={y - 22} r={8} />
      <circle cx={x + 22} cy={y - 34} r={10} />
    </g>
  )
}

/**
 * The selected mountain on its own, in its real shape (decision 57), drawn as
 * tall as its elevation compared with the highest one Satriko climbed. It
 * changes with the mountain picked in the list under it.
 */
export default function MountainScene({
  hike,
  tallestM,
}: {
  hike: IHike
  tallestM: number
}) {
  const shape = shapeOf(hike.id)
  const height = MIN_PEAK + ((MAX_PEAK - MIN_PEAK) * hike.elevationM) / tallestM
  const base = shape.sea ? BASE - 14 : BASE
  const { d, summit, vent } = mountainPath(shape, {
    cx: W / 2,
    base,
    half: 150 + height * 0.45,
    height,
  })
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Illustration of ${hike.name}, ${formatMetres(hike.elevationM)}`}
      className="w-full rounded-xl"
      style={{ background: 'var(--scene-sky)' }}
    >
      <g style={{ fill: 'var(--scene-star)' }}>
        {STARS.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
      {/* Faint far hills behind the mountain. */}
      <path
        d={`M0 ${BASE} L0 205 Q120 170 240 196 T480 186 T600 200 L600 ${BASE} Z`}
        style={{ fill: 'var(--scene-hill)' }}
      />
      <path
        d={d}
        strokeWidth={3}
        strokeLinejoin="round"
        style={{ fill: 'var(--scene-peak)', stroke: 'var(--scene-outline)' }}
      />
      {shape.smoke && <Smoke x={vent.x} y={vent.y} />}
      {shape.sea ? (
        <rect
          x={0}
          y={base - 2}
          width={W}
          height={H - base + 2}
          style={{ fill: 'var(--scene-sea-top)' }}
        />
      ) : (
        <rect
          x={0}
          y={BASE}
          width={W}
          height={H - BASE}
          style={{ fill: 'var(--scene-ground)' }}
        />
      )}
      {/* A flag on the summit, waving once per mountain (still with reduced motion). */}
      <g key={hike.id} transform={`translate(${summit.x} ${summit.y})`}>
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={-30}
          strokeWidth={2.5}
          style={{ stroke: 'var(--ink)' }}
        />
        <path
          className="flag-wave"
          d="M0 -30 L22 -24 L0 -17 Z"
          fill="#B8553A"
        />
      </g>
      <text
        x={W / 2}
        y={Math.max(summit.y - 44, 24)}
        textAnchor="middle"
        className="font-display"
        fontSize={18}
        fontWeight={800}
        style={{ fill: 'var(--ink)' }}
      >
        {`${hike.name} · ${formatMetres(hike.elevationM)}`}
      </text>
    </svg>
  )
}
