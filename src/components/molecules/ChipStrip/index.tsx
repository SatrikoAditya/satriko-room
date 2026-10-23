'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@components/shadcn/utils'

/**
 * The list under the Travel map and the Hiking skyline: the keyboard and
 * screen-reader way to pick an item. One sideways-scrolling row on phones that
 * slides to the selected chip; wrapping on desktop.
 */
export default function ChipStrip({
  items,
  selectedId,
  onSelect,
  label,
  className,
}: {
  items: readonly { id: string; label: string }[]
  selectedId: string | null
  onSelect: (id: string) => void
  label: string
  className?: string
}) {
  const listRef = useRef<HTMLUListElement>(null)

  // Keep the selected chip in view when it is picked on the picture above.
  useEffect(() => {
    const list = listRef.current
    const chip = list?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!list || !chip || list.scrollWidth <= list.clientWidth) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    list.scrollTo({
      left: chip.offsetLeft - list.offsetLeft - 16,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }, [selectedId])

  return (
    <ul
      ref={listRef}
      aria-label={label}
      className={cn(
        '-mx-1 flex [scrollbar-width:none] gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-wrap lg:content-start lg:overflow-visible lg:px-0',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.id} className="shrink-0">
          <button
            type="button"
            aria-pressed={item.id === selectedId}
            onClick={() => onSelect(item.id)}
            className="bg-wood/15 font-display aria-pressed:bg-peach min-h-11 rounded-full px-3 text-sm font-bold whitespace-nowrap"
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  )
}
