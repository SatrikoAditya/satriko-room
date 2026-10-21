import type { ReactNode } from 'react'

import { cn } from '@components/shadcn/utils'

import type { ISkillShelf } from '@models/skill'

const colors: Record<ISkillShelf['color'], string> = {
  mint: 'bg-mint',
  sky: 'bg-sky',
  peach: 'bg-peach',
  lavender: 'bg-lavender',
  wood: 'bg-wood text-on-accent',
}
export default function Chip({
  children,
  color = 'peach',
  className,
}: {
  children: ReactNode
  color?: ISkillShelf['color']
  className?: string
}) {
  return (
    <span
      className={cn(
        'font-display text-ink inline-block rounded-full px-3 py-1 text-sm font-bold',
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  )
}
