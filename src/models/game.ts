export type GamePlatform = 'PS5' | 'PS4' | 'PC'

export interface IGame {
  /** PSN title ID, also the cover's file name. */
  id: string
  title: string
  platform: GamePlatform | null
  /** `/images/gaming/<id>.webp`, or null when the cover could not be saved. */
  cover: string | null
  /** ISO date-time. */
  lastPlayed: string
  playtimeHours: number | null
}

export interface ITrophySummary {
  level: number
  platinum: number
  gold: number
  silver: number
  bronze: number
}

/** What `yarn games:sync` writes to `src/content/gaming.snapshot.json`. */
export interface IGamingSnapshot {
  syncedAt: string | null
  trophies: ITrophySummary | null
  recent: IGame[]
}
