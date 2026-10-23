import type { IDive } from '@models/dive'
import { depthScaleMax, formatDepth } from '@utils/diving'

const W = 600
const H = 240
const SURFACE = 34
const BOTTOM = 226
const LEFT = 52

/**
 * A cross-section of the sea, darker with depth, with each dive as a marker at
 * its rough depth. Markers are pointer and touch only: the list under the
 * chart is the keyboard and screen-reader control (decision 56).
 */
export default function DepthChart({
  dives,
  selectedId,
  onSelect,
}: {
  dives: readonly IDive[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const maxDepth = depthScaleMax(dives)
  const yOf = (m: number) => SURFACE + ((BOTTOM - SURFACE) * m) / maxDepth
  const spacing = (W - LEFT) / Math.max(dives.length, 1)
  const markers = dives.map((dive, i) => ({
    dive,
    x: LEFT + spacing * (i + 0.5),
    y: yOf(dive.depthM),
  }))
  const selected = markers.find((m) => m.dive.id === selectedId)
  // The label goes on whichever side of the marker has room (about 8.5 px
  // per character at this size).
  const label = selected
    ? `${selected.dive.site} · ${formatDepth(selected.dive.depthM)}`
    : ''
  const labelLeft = !!selected && selected.x + 18 + label.length * 8.5 > W - 6
  const ticks = Array.from({ length: maxDepth / 5 }, (_, i) => (i + 1) * 5)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Depth chart of the dives Satriko has done"
      className="w-full rounded-xl"
      style={{ background: 'var(--scene-sky)' }}
    >
      <defs>
        <linearGradient id="sea-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--scene-sea-top)' }} />
          <stop offset="1" style={{ stopColor: 'var(--scene-sea-deep)' }} />
        </linearGradient>
      </defs>
      <path
        d={`M0 ${SURFACE} Q75 ${SURFACE - 6} 150 ${SURFACE} T300 ${SURFACE} T450 ${SURFACE} T600 ${SURFACE} L600 ${H} L0 ${H} Z`}
        fill="url(#sea-depth)"
      />
      {ticks.map((m) => (
        <g key={m} style={{ fill: 'var(--scene-depth-ink)' }}>
          <line
            x1={LEFT - 6}
            x2={W}
            y1={yOf(m)}
            y2={yOf(m)}
            strokeDasharray="4 6"
            style={{ stroke: 'var(--scene-depth-ink)' }}
            opacity={0.35}
          />
          <text x={8} y={yOf(m) + 5} fontSize={13} className="font-display">
            {m} m
          </text>
        </g>
      ))}
      {markers.map(({ dive, x, y }) => {
        const isSelected = dive.id === selectedId
        return (
          <circle
            key={dive.id}
            cx={x}
            cy={y}
            r={isSelected ? 12 : 8}
            fill="#F2A03D"
            stroke="#FFF7E8"
            strokeWidth={2.5}
            onClick={() => onSelect(dive.id)}
            style={{ cursor: 'pointer' }}
          >
            <title>{`${dive.site}, ${formatDepth(dive.depthM)}`}</title>
          </circle>
        )
      })}
      {selected && (
        <g key={selected.dive.id}>
          {/* Bubbles rise from the selected diver a few times (none with reduced motion). */}
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              className="bubble-rise"
              style={{ animationDelay: `${i * 0.35}s` }}
              cx={selected.x + (i - 1) * 5}
              cy={selected.y - 18 - i * 9}
              r={2.5 + i * 0.6}
              fill="none"
              stroke="#FFF7E8"
              strokeWidth={1.5}
            />
          ))}
          <text
            x={labelLeft ? selected.x - 18 : selected.x + 18}
            y={selected.y + 5}
            textAnchor={labelLeft ? 'end' : 'start'}
            fontSize={15}
            fontWeight={800}
            className="font-display"
            fill="#FFF7E8"
            stroke="#1B2233"
            strokeWidth={3}
            paintOrder="stroke"
          >
            {label}
          </text>
        </g>
      )}
    </svg>
  )
}
