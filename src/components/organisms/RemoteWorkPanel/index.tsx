import { clockZones } from '@constants/timezones'
import { remoteWork } from '@content/remoteWork'

export default function RemoteWorkPanel() {
  return (
    <div>
      <ul className="mb-4 grid gap-3 sm:grid-cols-3">
        {clockZones.map((z) => (
          <li
            key={z.id}
            className="bg-paper-2 font-display rounded-xl p-3 text-center font-bold"
          >
            {z.city}
            <span className="text-ink-muted block text-sm">{z.timeZone}</span>
          </li>
        ))}
      </ul>
      <p>{remoteWork.note}</p>
    </div>
  )
}
