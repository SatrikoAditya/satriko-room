# Gaming: implementation plan for the PSN snapshot

## Context

The Gaming panel (`/gaming`, the TV) is empty. Satriko approved the design in decision #52, already written into docs 02, 05, 07, 08 and the README. A local `yarn games:sync` reads Satriko's NPSSO from `.env.local` and writes a committed snapshot of the **last 6 recently played games** and the **trophy summary**, with the covers saved as `.webp`. The panel renders that snapshot statically. The Online ID is never shown.

This plan builds it. After approval, a copy goes to `docs/plans/2026-10-23-gaming-psn-snapshot.md`, following [[project-setup-choices]].

**Satriko has to run the first real sync.** It needs their PlayStation sign-in. The repo ships an **empty snapshot**, so the panel keeps its empty state until then.

**Change to the docs:** the script becomes `scripts/sync-games.mts`, run with `tsx` the way `yarn poster` already runs. That lets it reuse the typed helpers in `src/utils/`. Docs 02, 05 and 07 and the README say `.mjs`, so they get updated.

## Steps

### 1. Model and helpers (TDD)

**`src/models/game.ts`** replaces the old `IGame`. Its `why` and `nowPlaying` fields aren't used anywhere.

```ts
export type GamePlatform = 'PS5' | 'PS4' | 'PC'
export interface IGame {
  id: string                      // PSN titleId, also the cover's file name
  title: string
  platform: GamePlatform | null
  cover: string | null            // /images/gaming/<id>.webp
  lastPlayed: string              // ISO date-time
  playtimeHours: number | null
}
export interface ITrophySummary { level: number; platinum: number; gold: number; silver: number; bronze: number }
export interface IGamingSnapshot { syncedAt: string | null; trophies: ITrophySummary | null; recent: IGame[] }
```

**`src/utils/games.ts`** holds pure helpers, written test-first in `games.test.ts`:

| Helper | What it does |
| --- | --- |
| `parsePlayDuration('PT228H56M33S')` | Returns whole hours, rounded (229). `'PT0S'` or junk returns `null`. More than 0 but under 1 h returns 1 |
| `platformOf(category)` | `ps5_native_game` → PS5, `ps4_game` → PS4, `pspc_game` → PC, anything else → `null` |
| `coverFileName(titleId)` | A safe file name, `[A-Z0-9_-]` only |
| `toSnapshot({ played, summary, now })` | Takes the first 6 titles and maps them to `IGame`. Copies **only** the listed fields, so `accountId`, `onlineId` and the like can't leak. `trophyLevel` is parsed as a number |

**`src/utils/dates.ts`** gains `formatDay(iso)`, which returns "20 Oct 2026" (en-GB, Asia/Jakarta time zone). It's tested in `dates.test.ts`.

### 2. Content

- **`src/content/gaming.snapshot.json`** is committed empty: `{ "syncedAt": null, "trophies": null, "recent": [] }`.
- **`src/content/gaming.ts`** imports the JSON (`resolveJsonModule` is already on) and exports `gaming: IGamingSnapshot`. The old `games` and `platforms` exports are dropped.
- **`src/content/content.test.ts`** gets two changes:
  - The privacy blob uses `gaming`.
  - A new test checks two things:
    - No key or value in the snapshot matches `/accountId|onlineId|npsso|accessToken|refreshToken/i`.
    - Every `recent` item has exactly the `IGame` keys.

### 3. The sync script: `scripts/sync-games.mts`

**Setup:**
- Add `"games:sync": "tsx scripts/sync-games.mts"` to `package.json`.
- Run `yarn add -D psn-api`.
- Load `.env.local` with `process.loadEnvFile` when the file exists.

**Flow:**
1. **No `PSN_NPSSO`:** print the 3 renewal steps from doc 05 and exit 1.
2. **Exchange the NPSSO:** call `exchangeNpssoForAccessCode`, then `exchangeAccessCodeForAuthTokens`. On failure, print "the NPSSO has expired" plus the steps, and exit 1.
   - It prints only fixed messages, never the error body or tokens.
3. **Fetch:** `Promise.all` of `getUserPlayedGames(auth, 'me', { limit: 6 })` and `getUserTrophyProfileSummary(auth, 'me')`, then `toSnapshot`.
4. **Stage the covers:** download each `imageUrl` into a temp directory from `mkdtemp`. Resize with `sharp` to a 256×256 `.webp` at quality 80.
   - If any download fails, that game gets `cover: null` instead of the whole sync failing.
5. **Commit the result, only after everything succeeds:**
   - Replace `public/images/gaming/` with the staged covers, which removes stale ones.
   - Write the JSON with 2-space indent and a trailing newline.
   - Nothing is written before this point, so a failure changes no files.
6. **Print:** "Synced 6 games and the trophy summary (level N) on 23 Oct 2026. Review, then commit `src/content/gaming.snapshot.json` and `public/images/gaming/`."

**Budget:** `scripts/check-budgets.mjs` gets a row for `public/images/gaming` `.webp`, limited to **300 KB**. Six covers come to about 15–30 KB each.

### 4. The panel: `src/components/organisms/GamingPanel/index.tsx`

**Behaviour:**
- It stays server-safe and pure. Its signature becomes `({ data = gaming }: { data?: IGamingSnapshot })`.
- It shows the empty state (`oyenLines.empty.gaming`) when `recent` is empty and `trophies` is null.

**Layout** inside the existing TV bezel (`▶ SELECT GAME`, `font-pixel`, `text-screen-ink`):
- **Trophy strip:** "LV 312" plus four counts with small coloured dots: platinum, gold, silver, bronze.
  - It's a `<dl>`, so screen readers hear "Trophy level 312", "Platinum 5" and so on.
- **Cards**, in the grid `sm:grid-cols-3`:
  - The `next/image` cover at 256×256, or the pastel `Gamepad2` tile the way the Projects panel falls back.
  - The title, with ★ on the first one and an `aria-label` of "Now playing".
  - A PS5/PS4/PC chip, "Last played 20 Oct 2026", and "229 h played" (left out when null).
- **Footer:** "Synced 23 Oct 2026" in `text-screen-ink-soft`.

**Tests in `panels.test.tsx`** use a fixture snapshot:
- the trophy strip
- 2 cards, one without a cover
- ★ on the first card
- the footer date
- the empty state

### 5. e2e and docs

**e2e:**
- `e2e/direct-links.spec.ts`: the gaming row matches `/SELECT GAME/`, which is present whether the snapshot is empty or synced.
- `a11y.spec.ts` already scans `/gaming`.

**Docs** (the `.mjs` → `.mts` rename plus the budget):

| File | Change |
| --- | --- |
| doc 02 | The scripts line, and `src/utils/games.ts` |
| doc 05 | The script name |
| doc 07 | A budget row for the gaming covers, and the Unit row for `games.ts` |
| `README.md` | The step 6 command, and the budgets list |
| `CREDITS.md` | A row: covers in `public/images/gaming/` are the games' official PlayStation title icons, © their publishers, saved by `yarn games:sync` to identify the games |

## Verification

**Unit tests:** `games.test.ts`, `dates.test.ts`, the content privacy and shape tests, and `panels.test.tsx`.

**Script without a sign-in:**
- With no `.env.local`, `yarn games:sync` prints the steps, exits 1, and `git status` shows no changes.
- With `PSN_NPSSO=bad`, it prints the expired message, exits 1, changes no files, and the output contains no token.

**Visual check on port 3001:**
1. Temporarily write a fixture snapshot locally: 3 games, one with a sample `.webp`.
2. `yarn build && yarn start -p 3001`.
3. Screenshot `/gaming` on desktop and on a Pixel 7, day and night.
4. Restore the empty snapshot.

**Full check:**
- `node_modules/.bin/prettier --check`, then `yarn lint && yarn typecheck && yarn test && yarn build && yarn budgets`.
- The e2e on port 3001. Re-run any timeout on its own with `--workers=1`.

**Rules:** use Node 24 via `export PATH="$HOME/.nvm/versions/node/v24.22.0/bin:$PATH"`. Never touch port 3000.

**Hand-off:**
- Leave everything uncommitted and give a one-line commit message.
- Satriko then puts the NPSSO in `.env.local` and runs `yarn games:sync`. I'll review the result with them: no Online ID in the JSON, and the covers look right.
