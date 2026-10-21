import type { ReactNode } from 'react'

import { cn } from '@components/shadcn/utils'

export default function StitchedLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'stitched bg-paper-2 font-display text-ink inline-flex items-center gap-2 rounded-xl px-3 py-1 font-bold shadow-sm',
        className,
      )}
    >
      {children}
    </span>
  )
}
