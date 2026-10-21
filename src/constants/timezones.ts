export const clockZones = [
  { id: 'bogor', city: 'Bogor', timeZone: 'Asia/Jakarta', label: 'WIB' },
  { id: 'singapore', city: 'Singapore', timeZone: 'Asia/Singapore' },
  { id: 'abu-dhabi', city: 'Abu Dhabi', timeZone: 'Asia/Dubai' },
] as const
export const BASE_ZONE = 'Asia/Jakarta'
export const WORK_START = 9 * 60
export const WORK_END = 18 * 60
