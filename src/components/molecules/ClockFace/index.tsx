import { clockAngles, formatHHMM, type ClockTime } from '@utils/time'

export default function ClockFace({
  city,
  label,
  time,
}: {
  city: string
  label?: string
  time: ClockTime | null
}) {
  const a = time ? clockAngles(time) : { hour: 300, minute: 60 }
  return (
    <figure className="bg-paper-2 flex flex-col items-center gap-1 rounded-xl p-3">
      <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="#FFF7E8"
          stroke="#B9875A"
          strokeWidth="6"
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="26"
          stroke="#4A3426"
          strokeWidth="6"
          strokeLinecap="round"
          transform={`rotate(${a.hour} 50 50)`}
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="16"
          stroke="#B8553A"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${a.minute} 50 50)`}
        />
        <circle cx="50" cy="50" r="3" fill="#4A3426" />
      </svg>
      <figcaption className="font-display text-center font-bold">
        {city}
        {label ? ` · ${label}` : ''}
        <span className="block font-mono text-lg">
          {time ? formatHHMM(time) : '--:--'}
        </span>
      </figcaption>
    </figure>
  )
}
