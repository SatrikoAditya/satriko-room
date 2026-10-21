'use client'

import { useEffect, useState } from 'react'

import {
  BASE_ZONE,
  clockZones,
  WORK_END,
  WORK_START,
} from '@constants/timezones'
import { overlapWindow, zonedTime, type ClockTime } from '@utils/time'

export function useRemoteWorkPanel() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  const times: Record<string, ClockTime | null> = {}
  for (const z of clockZones) {
    times[z.id] = now ? zonedTime(now, z.timeZone) : null
  }
  const overlap = now
    ? overlapWindow(
        now,
        clockZones.map((z) => z.timeZone),
        BASE_ZONE,
        WORK_START,
        WORK_END,
      )
    : null
  return { times, overlap, now }
}
