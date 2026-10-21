'use client'

import { useCallback, useMemo } from 'react'
import type { MouseEvent } from 'react'

import type { SectionSlug } from '@interfaces/section'
import { closeSection, openSection, replacePath } from '@utils/history'

import { useActiveSection } from './useActiveSection'

const isModified = (e: MouseEvent) =>
  e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey

export function useSectionNavigation() {
  const active = useActiveSection()
  const switchTo = useCallback(
    (slug: SectionSlug) => {
      if (active !== slug) replacePath(`/${slug}`)
    },
    [active],
  )
  const open = useCallback(
    (slug: SectionSlug) => openSection(active, slug),
    [active],
  )
  const close = useCallback(() => closeSection(active), [active])

  const linkProps = useCallback(
    (slug: SectionSlug) => ({
      href: `/${slug}`,
      onClick: (e: MouseEvent) => {
        if (isModified(e)) return
        e.preventDefault()
        open(slug)
      },
    }),
    [open],
  )

  return useMemo(
    () => ({ open, close, switchTo, linkProps }),
    [open, close, switchTo, linkProps],
  )
}
