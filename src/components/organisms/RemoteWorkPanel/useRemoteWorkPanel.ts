'use client'

import { useEffect, useState } from 'react'

import {
  BASE_ZONE,
  clockZones,
  OVERLAP_REFERENCE_ISO,
  WORK_END,
  WORK_START,
} from '@constants/timezones'
import { overlapWindow, zonedTime, type ClockTime } from '@utils/time'

// A constant, so the server render and the first client render agree.
const REFERENCE = new Date(OVERLAP_REFERENCE_ISO)

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
  // Live once mounted; until then the fixed reference instant (same result, no DST).
  const at = now ?? REFERENCE
  const overlap = overlapWindow(
    at,
    clockZones.map((z) => z.timeZone),
    BASE_ZONE,
    WORK_START,
    WORK_END,
  )
  return { times, overlap, at }
}
