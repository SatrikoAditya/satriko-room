import type { UserTrophyProfileSummaryResponse } from 'psn-api'
import { describe, expect, it } from 'vitest'

import {
  coverFileName,
  parsePlayDuration,
  platformOf,
  RECENT_GAMES,
  toSnapshot,
} from './games'

const title = (n: number, extra: Record<string, unknown> = {}) => ({
  titleId: `PPSA0000${n}_00`,
  name: `Game ${n}`,
  localizedName: `Game ${n}`,
  imageUrl: `https://image.example/${n}.png`,
  localizedImageUrl: `https://image.example/${n}.png`,
  category: 'ps5_native_game',
  service: 'none_purchased',
  playCount: 3,
  concept: {
    id: n,
    titleIds: [],
    name: `Game ${n}`,
    media: { audios: [], videos: [], images: [] },
  },
  media: {},
  firstPlayedDateTime: '2026-01-01T00:00:00Z',
  lastPlayedDateTime: '2026-10-20T12:00:00Z',
  playDuration: 'PT10H30M0S',
  ...extra,
})

// psn-api types `platinum` as 0 | 1 (its per-game counts), but the profile
// summary returns the account's total.
const summary = {
  accountId: '1234567890',
  trophyLevel: '312',
  progress: 40,
  tier: 4,
  earnedTrophies: { platinum: 5, gold: 40, silver: 120, bronze: 600 },
} as unknown as UserTrophyProfileSummaryResponse

describe('parsePlayDuration', () => {
  it('rounds to whole hours', () => {
    expect(parsePlayDuration('PT228H56M33S')).toBe(229)
    expect(parsePlayDuration('PT10H29M59S')).toBe(10)
  })
  it('counts minutes and days', () => {
    expect(parsePlayDuration('P1DT2H')).toBe(26)
    expect(parsePlayDuration('PT90M')).toBe(2)
  })
  it('shows at least 1 h once played, and null for none or junk', () => {
    expect(parsePlayDuration('PT5M')).toBe(1)
    expect(parsePlayDuration('PT0S')).toBeNull()
    expect(parsePlayDuration('')).toBeNull()
    expect(parsePlayDuration('ten hours')).toBeNull()
  })
})

describe('platformOf', () => {
  it('maps PSN categories', () => {
    expect(platformOf('ps5_native_game')).toBe('PS5')
    expect(platformOf('ps4_game')).toBe('PS4')
    expect(platformOf('pspc_game')).toBe('PC')
    expect(platformOf('unknown')).toBeNull()
  })
})

describe('coverFileName', () => {
  it('keeps only safe characters', () => {
    expect(coverFileName('CUSA01433_00')).toBe('CUSA01433_00.webp')
    expect(coverFileName('../evil/x y')).toBe('evilxy.webp')
  })
})

describe('toSnapshot', () => {
  const now = new Date('2026-10-23T03:00:00Z')

  it('keeps the latest games and the trophy counts', () => {
    const played = Array.from({ length: 8 }, (_, i) => title(i + 1))
    const snap = toSnapshot({ played, summary, now })
    expect(snap.syncedAt).toBe('2026-10-23T03:00:00.000Z')
    expect(snap.trophies).toEqual({
      level: 312,
      platinum: 5,
      gold: 40,
      silver: 120,
      bronze: 600,
    })
    expect(snap.recent).toHaveLength(RECENT_GAMES)
    expect(snap.recent[0]).toEqual({
      id: 'PPSA00001_00',
      title: 'Game 1',
      platform: 'PS5',
      cover: '/images/gaming/PPSA00001_00.webp',
      lastPlayed: '2026-10-20T12:00:00Z',
      playtimeHours: 11,
    })
  })

  it('never copies account details', () => {
    const played = [title(1, { onlineId: 'satriko', accountId: '999' })]
    const json = JSON.stringify(toSnapshot({ played, summary, now }))
    expect(json).not.toMatch(/accountId|onlineId|1234567890|satriko|999/)
  })

  it('prefers the localized name', () => {
    const snap = toSnapshot({
      played: [title(1, { localizedName: 'Spider-Man' })],
      summary,
      now,
    })
    expect(snap.recent[0].title).toBe('Spider-Man')
  })
})
