import Image from 'next/image'

import EmptyState from '@components/molecules/EmptyState'

import { games as defaultGames } from '@content/gaming'
import { oyenLines } from '@content/oyen'
import type { IGame } from '@models/game'

export default function GamingPanel({
  games = defaultGames,
}: {
  games?: readonly IGame[]
}) {
  return (
    <div className="border-ink/80 font-pixel text-screen-ink bg-screen rounded-2xl border-[12px] p-4 text-xl">
      <p className="mb-3">▶ SELECT GAME</p>
      {games.length === 0 ? (
        <EmptyState tone="light" message={oyenLines.empty.gaming} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-3">
          {games.map((g) => (
            <li key={g.title} className="rounded bg-white/10 p-3">
              {g.cover && (
                <Image
                  src={g.cover}
                  alt=""
                  width={800}
                  height={600}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="mb-2 w-full rounded"
                />
              )}
              <p>
                {g.nowPlaying ? '★ ' : ''}
                {g.title}
              </p>
              <p className="text-screen-ink-soft text-base">
                {g.platform} · {g.why}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
