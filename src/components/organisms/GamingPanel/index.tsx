import Image from 'next/image'
import { Gamepad2 } from 'lucide-react'

import EmptyState from '@components/molecules/EmptyState'

import { gaming } from '@content/gaming'
import { oyenLines } from '@content/oyen'
import type { IGame, IGamingSnapshot, ITrophySummary } from '@models/game'
import { formatDay } from '@utils/dates'

// The screen is dark in both themes, so the trophy colours are fixed too.
const grades = [
  { key: 'platinum', label: 'Platinum', dot: 'bg-[#8fd3ff]' },
  { key: 'gold', label: 'Gold', dot: 'bg-[#f2c94c]' },
  { key: 'silver', label: 'Silver', dot: 'bg-[#c4c8cf]' },
  { key: 'bronze', label: 'Bronze', dot: 'bg-[#d08a4e]' },
] as const

function TrophyStrip({ trophies }: { trophies: ITrophySummary }) {
  return (
    <dl
      aria-label="Trophies"
      className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1"
    >
      <div className="flex gap-1">
        <dt className="sr-only">Trophy level</dt>
        <dd>
          <span aria-hidden="true">LV </span>
          {trophies.level}
        </dd>
      </div>
      {grades.map((g) => (
        <div key={g.key} title={g.label} className="flex items-center gap-1.5">
          <dt className="flex items-center">
            <span
              aria-hidden="true"
              className={`inline-block size-3 rounded-full ${g.dot}`}
            />
            <span className="sr-only">{g.label}</span>
          </dt>
          <dd>{trophies[g.key]}</dd>
        </div>
      ))}
    </dl>
  )
}

function GameCard({ game, nowPlaying }: { game: IGame; nowPlaying: boolean }) {
  return (
    // A row with a small cover on phones, a card with a square cover from sm up.
    <li className="flex gap-3 rounded bg-white/10 p-3 sm:block">
      {game.cover ? (
        <Image
          src={game.cover}
          alt=""
          width={512}
          height={512}
          sizes="(min-width: 640px) 25vw, 80px"
          className="aspect-square w-20 shrink-0 rounded object-cover sm:mb-2 sm:w-full"
        />
      ) : (
        <div
          aria-hidden="true"
          className="bg-lavender flex aspect-square w-20 shrink-0 items-center justify-center rounded sm:mb-2 sm:w-full"
        >
          <Gamepad2 size={40} className="text-ink/60" />
        </div>
      )}
      <div className="min-w-0">
        <p>
          {nowPlaying && <span aria-label="Now playing">★ </span>}
          {game.title}
        </p>
        <p className="text-screen-ink-soft text-base">
          {[
            game.platform,
            `Last played ${formatDay(game.lastPlayed)}`,
            game.playtimeHours !== null && `${game.playtimeHours} h played`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </li>
  )
}

export default function GamingPanel({
  data = gaming,
}: {
  data?: IGamingSnapshot
}) {
  const empty = data.recent.length === 0 && data.trophies === null
  return (
    <div className="border-ink/80 font-pixel text-screen-ink bg-screen rounded-2xl border-[12px] p-4 text-xl">
      <p className="mb-3">▶ SELECT GAME</p>
      {empty ? (
        <EmptyState tone="light" message={oyenLines.empty.gaming} />
      ) : (
        <>
          {data.trophies && <TrophyStrip trophies={data.trophies} />}
          {data.recent.length > 0 && (
            <ul
              aria-label="Recently played"
              className="grid gap-3 sm:grid-cols-3"
            >
              {data.recent.map((g, i) => (
                <GameCard key={g.id} game={g} nowPlaying={i === 0} />
              ))}
            </ul>
          )}
          {data.syncedAt && (
            <p className="text-screen-ink-soft mt-3 text-base">
              Synced {formatDay(data.syncedAt)}
            </p>
          )}
        </>
      )}
    </div>
  )
}
