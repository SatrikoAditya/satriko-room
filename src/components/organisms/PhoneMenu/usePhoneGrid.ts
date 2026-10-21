'use client'

import type { KeyboardEvent, RefObject } from 'react'

export const PHONE_COLUMNS = 3

export function usePhoneGrid(gridRef: RefObject<HTMLElement | null>) {
  return function onKeyDown(e: KeyboardEvent) {
    const items = Array.from(
      gridRef.current?.querySelectorAll<HTMLElement>(
        '[role="gridcell"] > a, [role="gridcell"] > button',
      ) ?? [],
    )
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (index < 0) return
    const delta: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: PHONE_COLUMNS,
      ArrowUp: -PHONE_COLUMNS,
    }
    const d = delta[e.key]
    if (d === undefined) return
    e.preventDefault()
    items[Math.min(items.length - 1, Math.max(0, index + d))]?.focus()
  }
}
