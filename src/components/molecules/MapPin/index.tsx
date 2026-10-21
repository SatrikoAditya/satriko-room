import type { ITravelPin } from '@models/travel'

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
      <circle
        r={selected ? 14 : 10}
        fill="#B8553A"
        stroke="#FFF7E8"
        strokeWidth={3}
        role="button"
        tabIndex={0}
        aria-label={pin.place}
        onClick={() => onSelect(pin.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect(pin.id)
        }}
        style={{ cursor: 'pointer' }}
      />
    </g>
  )
}
