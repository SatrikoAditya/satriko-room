import type {
  UserPlayedGamesResponse,
  UserTrophyProfileSummaryResponse,
} from 'psn-api'

import type { GamePlatform, IGame, IGamingSnapshot } from '@models/game'

/** How many recently played games the snapshot keeps (decision 52). */
export const RECENT_GAMES = 6

export const GAMING_IMAGE_DIR = '/images/gaming'

/** PSN categories that are games; apps like Netflix or YouTube are left out. */
export const GAME_CATEGORIES = ['ps5_native_game', 'ps4_game', 'pspc_game']

/** How many titles the sync asks for, so 6 games remain after dropping apps. */
export const FETCH_LIMIT = 30

type PlayedTitle = UserPlayedGamesResponse['titles'][number]

/** Whole hours from an ISO 8601 duration ("PT228H56M33S" → 229). */
export function parsePlayDuration(duration: string): number | null {
  const m =
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(
      duration,
    )
  if (!m || duration === 'P' || duration.endsWith('T')) return null
  const [, d, h, min, s] = m.map((v) => Number(v ?? 0))
  const seconds = d * 86400 + h * 3600 + min * 60 + s
  if (seconds <= 0) return null
  return Math.max(1, Math.round(seconds / 3600))
}

export function platformOf(category: string): GamePlatform | null {
  if (category === 'ps5_native_game') return 'PS5'
  if (category === 'ps4_game') return 'PS4'
  if (category === 'pspc_game') return 'PC'
  return null
}

export function coverFileName(titleId: string) {
  return `${titleId.replace(/[^A-Za-z0-9_-]/g, '')}.webp`
}

/**
 * Maps the PSN responses to the snapshot. Only games are kept (not media apps),
 * and only the listed fields are copied, so account details (account ID,
 * Online ID) can never reach the site.
 */
export function toSnapshot({
  played,
  summary,
  now,
}: {
  played: readonly PlayedTitle[]
  summary: UserTrophyProfileSummaryResponse
  now: Date
}): IGamingSnapshot {
  const recent: IGame[] = played
    .filter((t) => platformOf(t.category) !== null)
    .slice(0, RECENT_GAMES)
    .map((t) => ({
      id: coverFileName(t.titleId).replace(/\.webp$/, ''),
      title: t.localizedName || t.name,
      platform: platformOf(t.category),
      cover: `${GAMING_IMAGE_DIR}/${coverFileName(t.titleId)}`,
      lastPlayed: t.lastPlayedDateTime,
      playtimeHours: parsePlayDuration(t.playDuration),
    }))
  const { platinum, gold, silver, bronze } = summary.earnedTrophies
  return {
    syncedAt: now.toISOString(),
    trophies: {
      level: Number(summary.trophyLevel) || 0,
      platinum,
      gold,
      silver,
      bronze,
    },
    recent,
  }
}
