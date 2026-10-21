export interface ClockTime {
  h: number
  m: number
  s: number
}

const partsOf = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0)
  return { h: get('hour') % 24, m: get('minute'), s: get('second') }
}

export function zonedTime(date: Date, timeZone: string): ClockTime {
  return partsOf(date, timeZone)
}

export function clockAngles(t: ClockTime) {
  return { hour: ((t.h % 12) + t.m / 60) * 30, minute: (t.m + t.s / 60) * 6 }
}

export function utcOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') % 24,
    get('minute'),
    get('second'),
  )
  return Math.round((asUtc - date.getTime()) / 60000)
}

export function overlapWindow(
  date: Date,
  zones: readonly string[],
  baseZone: string,
  workStart = 9 * 60,
  workEnd = 18 * 60,
) {
  const base = utcOffsetMinutes(date, baseZone)
  let start = workStart
  let end = workEnd
  for (const zone of zones) {
    const shift = utcOffsetMinutes(date, zone) - base // minutes this zone is ahead of base
    start = Math.max(start, workStart - shift)
    end = Math.min(end, workEnd - shift)
  }
  return start < end ? { start, end } : null
}

export function formatHHMM(t: ClockTime): string {
  return `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`
}
