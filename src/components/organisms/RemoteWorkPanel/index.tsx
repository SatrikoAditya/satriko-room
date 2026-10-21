'use client'

import ClockFace from '@components/molecules/ClockFace'

import { clockZones } from '@constants/timezones'
import { remoteWork } from '@content/remoteWork'

import OverlapBar from './OverlapBar'
import { useRemoteWorkPanel } from './useRemoteWorkPanel'

export default function RemoteWorkPanel() {
  const { times, overlap, at } = useRemoteWorkPanel()
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {clockZones.map((z) => (
          <ClockFace
            key={z.id}
            city={z.city}
            label={'label' in z ? z.label : undefined}
            time={times[z.id]}
          />
        ))}
      </div>
      <OverlapBar window={overlap} at={at} />
      <p>{remoteWork.note}</p>
    </div>
  )
}
