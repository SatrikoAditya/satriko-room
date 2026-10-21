import {
  BASE_ZONE,
  clockZones,
  WORK_END,
  WORK_START,
} from '@constants/timezones'
import { formatHHMM, utcOffsetMinutes } from '@utils/time'

const toHHMM = (m: number) =>
  formatHHMM({ h: Math.floor(m / 60), m: m % 60, s: 0 })

export default function OverlapBar({
  window: w,
  now,
}: {
  window: { start: number; end: number } | null
  now: Date | null
}) {
  const base = now ? utcOffsetMinutes(now, BASE_ZONE) : 0
  return (
    <div>
      <ul className="space-y-1">
        {clockZones.map((z) => {
          const shift = now ? utcOffsetMinutes(now, z.timeZone) - base : 0
          const s = WORK_START - shift
          const e = WORK_END - shift
          return (
            <li
              key={z.id}
              className="grid grid-cols-[90px_1fr] items-center gap-2 text-sm"
            >
              <span className="font-display font-bold">{z.city}</span>
              <div className="bg-paper-2 relative h-5 rounded-full">
                <div
                  className="bg-sky absolute h-full rounded-full"
                  style={{
                    left: `${(s / 1440) * 100}%`,
                    width: `${((e - s) / 1440) * 100}%`,
                  }}
                />
              </div>
            </li>
          )
        })}
      </ul>
      <p className="font-display mt-2 font-bold">
        {w
          ? `Overlap: ${toHHMM(w.start)}–${toHHMM(w.end)} WIB`
          : 'No shared working hours'}
      </p>
    </div>
  )
}
