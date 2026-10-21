export const clockZones = [
  { id: 'bogor', city: 'Bogor', timeZone: 'Asia/Jakarta', label: 'WIB' },
  { id: 'singapore', city: 'Singapore', timeZone: 'Asia/Singapore' },
  { id: 'abu-dhabi', city: 'Abu Dhabi', timeZone: 'Asia/Dubai' },
] as const
export const BASE_ZONE = 'Asia/Jakarta'
export const WORK_START = 9 * 60
export const WORK_END = 18 * 60
// Used for the overlap before the live clock starts (server render, first client render).
// None of the zones observe DST, so any instant gives the same overlap as "now".
export const OVERLAP_REFERENCE_ISO = '2026-01-01T00:00:00Z'
