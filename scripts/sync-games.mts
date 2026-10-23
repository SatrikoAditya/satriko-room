// Saves a snapshot of Satriko's PlayStation games for the Gaming panel
// (decision 52). Usage: yarn games:sync, with PSN_NPSSO in .env.local.
// Writes src/content/gaming.snapshot.json and the covers in
// public/images/gaming/. Nothing is written unless every PSN call succeeds,
// and the NPSSO and tokens are never printed.
import { existsSync } from 'node:fs'
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  getUserPlayedGames,
  getUserTrophyProfileSummary,
} from 'psn-api'
import sharp from 'sharp'

import { formatDay } from '../src/utils/dates'
import {
  coverFileName,
  FETCH_LIMIT,
  GAME_CATEGORIES,
  toSnapshot,
} from '../src/utils/games'

const root = join(import.meta.dirname, '..')
const snapshotPath = join(root, 'src', 'content', 'gaming.snapshot.json')
const coverDir = join(root, 'public', 'images', 'gaming')
// Covers show about 300 CSS px wide on desktop, so 512 px stays sharp on 2×
// screens; smaller PSN icons are kept at their own size.
const COVER_SIZE = 512

const RENEW_STEPS = `To renew it:
  1. Sign in at https://www.playstation.com
  2. In the same browser, open https://ca.account.sony.com/api/v1/ssocookie
     and copy the 64-character "npsso" value.
  3. Put it in .env.local as PSN_NPSSO=... and run yarn games:sync again.
Treat it like your password: never commit or share it.`

function fail(message: string): never {
  console.error(`${message}\n\n${RENEW_STEPS}`)
  process.exit(1)
}

const envFile = join(root, '.env.local')
if (existsSync(envFile)) process.loadEnvFile(envFile)
const npsso = process.env.PSN_NPSSO?.trim()
if (!npsso) fail('PSN_NPSSO is not set in .env.local.')

let auth: { accessToken: string }
try {
  const code = await exchangeNpssoForAccessCode(npsso)
  auth = await exchangeAccessCodeForAuthTokens(code)
} catch {
  fail('PlayStation did not accept the NPSSO: it has probably expired.')
}

let snapshot: ReturnType<typeof toSnapshot>
let played: Awaited<ReturnType<typeof getUserPlayedGames>>['titles']
try {
  const [games, summary] = await Promise.all([
    getUserPlayedGames(auth, 'me', {
      limit: FETCH_LIMIT,
      offset: 0,
      categories: GAME_CATEGORIES.join(','),
    }),
    getUserTrophyProfileSummary(auth, 'me'),
  ])
  played = games.titles
  snapshot = toSnapshot({ played, summary, now: new Date() })
} catch {
  console.error(
    'Signed in, but PlayStation did not return the games. Try again later.',
  )
  process.exit(1)
}

// Stage the covers first, so a failure leaves the old ones in place.
const staging = await mkdtemp(join(tmpdir(), 'games-sync-'))
try {
  // Snapshot IDs are the cover file names without .webp (see toSnapshot).
  const imageUrlById = new Map(
    played.map((t) => [
      coverFileName(t.titleId).replace(/\.webp$/, ''),
      t.imageUrl,
    ]),
  )
  for (const game of snapshot.recent) {
    try {
      const res = await fetch(imageUrlById.get(game.id) ?? '')
      if (!res.ok) throw new Error(String(res.status))
      await sharp(Buffer.from(await res.arrayBuffer()))
        .resize(COVER_SIZE, COVER_SIZE, {
          fit: 'cover',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(join(staging, `${game.id}.webp`))
    } catch {
      console.warn(`No cover saved for "${game.title}".`)
      game.cover = null
    }
  }

  await rm(coverDir, { recursive: true, force: true })
  await mkdir(coverDir, { recursive: true })
  await cp(staging, coverDir, { recursive: true })
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`)
} finally {
  await rm(staging, { recursive: true, force: true })
}

console.log(
  `Synced ${snapshot.recent.length} games and the trophy summary (level ${snapshot.trophies?.level}) on ${formatDay(snapshot.syncedAt!)}.\n` +
    'Review them, then commit src/content/gaming.snapshot.json and public/images/gaming/.',
)
