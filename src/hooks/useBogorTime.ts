'use client'

import { useEffect, useState } from 'react'

import { BASE_ZONE } from '@constants/timezones'
import { zonedTime, type ClockTime } from '@utils/time'

export function useBogorTime(): ClockTime | null {
  const [time, setTime] = useState<ClockTime | null>(null)
  useEffect(() => {
    const tick = () => setTime(zonedTime(new Date(), BASE_ZONE))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])
  return time
}
