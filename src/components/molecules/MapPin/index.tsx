import { PIN_RADIUS, PIN_RADIUS_SELECTED } from '@constants/travel'
import type { ITravelPin } from '@models/travel'

/**
 * A pin for pointer and touch only: the place list under the map is the
 * keyboard and screen-reader way to pick a place, so the map can stay one
 * labelled image instead of 30 extra tab stops.
 */
export default function MapPin({
  pin,
  x,
  y,
  selected,
  onSelect,
}: {
  pin: ITravelPin
  x: number
  y: number
  selected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* The selected pin grows, and hops once (no hop with reduced motion). */}
      <g
        key={selected ? 'on' : 'off'}
        className={selected ? 'pin-bounce' : undefined}
      >
        <circle
          r={selected ? PIN_RADIUS_SELECTED : PIN_RADIUS}
          fill="#B8553A"
          stroke="#FFF7E8"
          strokeWidth={2.5}
          data-place={pin.id}
          onClick={() => onSelect(pin.id)}
          style={{ cursor: 'pointer' }}
        >
          <title>{pin.place}</title>
        </circle>
      </g>
    </g>
  )
}
