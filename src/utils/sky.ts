import { SKY_BOUNDS } from '@constants/sky'

export type SkyPhase = 'dawn' | 'day' | 'sunset' | 'night'

export function skyPhase(minutesOfDay: number): SkyPhase {
  const m = ((minutesOfDay % 1440) + 1440) % 1440
  if (m < SKY_BOUNDS.dawn) return 'night'
  if (m < SKY_BOUNDS.day) return 'dawn'
  if (m < SKY_BOUNDS.sunset) return 'day'
  if (m < SKY_BOUNDS.night) return 'sunset'
  return 'night'
}

export function sunHeight(minutesOfDay: number): number {
  const rise = 5 * 60 + 50
  const set = 18 * 60
  if (minutesOfDay <= rise || minutesOfDay >= set) return 0
  return Math.sin(((minutesOfDay - rise) / (set - rise)) * Math.PI)
}

export const skyColors: Record<
  SkyPhase,
  { top: string; bottom: string; light: string }
> = {
  dawn: { top: '#7FA8D8', bottom: '#FFC8A2', light: '#ffd9b8' },
  day: { top: '#7FB8E8', bottom: '#CFE9FA', light: '#fff4e0' },
  sunset: { top: '#6A5A9A', bottom: '#FF9A6A', light: '#ffb48a' },
  night: { top: '#0F1A3A', bottom: '#2B3A5C', light: '#9fb4ff' },
}
