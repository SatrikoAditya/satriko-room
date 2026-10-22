'use client'

import { useRef } from 'react'
import { X } from 'lucide-react'
import { motion } from 'motion/react'

import IconButton from '@components/atoms/IconButton'
import PhoneAppTile from '@components/molecules/PhoneAppTile'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'

import { useBogorTime } from '@hooks/useBogorTime'
import { useSectionNavigation } from '@hooks/useSectionNavigation'

import { sections } from '@constants/sections'
import { formatHHMM } from '@utils/time'

import { chunk, PHONE_COLUMNS, usePhoneGrid } from './usePhoneGrid'

// Every section has a tile; Help lives on the HUD's "?" button.
export default function PhoneMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { linkProps } = useSectionNavigation()
  const time = useBogorTime()
  const gridRef = useRef<HTMLDivElement>(null)
  const onKeyDown = usePhoneGrid(gridRef)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-40 bg-[#2b2238]/20" />
        <DialogContent
          asChild
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            // Start on the first app (not the close button) so arrow keys work at once.
            e.preventDefault()
            gridRef.current?.querySelector<HTMLElement>('a, button')?.focus()
          }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="border-ink/80 bg-paper fixed right-4 bottom-20 z-50 flex h-[560px] w-[320px] max-w-[calc(100vw-2rem)] flex-col rounded-[36px] border-8 p-4 shadow-2xl outline-none max-sm:right-0 max-sm:bottom-0 max-sm:h-[90dvh] max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none"
          >
            <div className="font-display text-ink-muted flex justify-between text-xs font-bold">
              <span>{time ? `${formatHHMM(time)} WIB` : 'WIB'}</span>
              <span aria-hidden="true">▂▄▆ 🔋</span>
            </div>
            <div className="my-3 flex items-center justify-between gap-2">
              <DialogTitle className="font-display text-xl font-extrabold">
                Hi! Where to?
              </DialogTitle>
              <DialogClose asChild>
                <IconButton label="Close menu">
                  <X />
                </IconButton>
              </DialogClose>
            </div>
            <div
              ref={gridRef}
              role="grid"
              aria-label="Sections"
              onKeyDown={onKeyDown}
              className="grid grid-cols-3 gap-2"
            >
              {chunk(sections, PHONE_COLUMNS).map((row, r) => (
                <div key={r} role="row" className="contents">
                  {row.map((section) => {
                    const p = linkProps(section.slug)
                    return (
                      <div key={section.slug} role="gridcell">
                        <PhoneAppTile
                          section={section}
                          href={p.href}
                          onClick={(e) => {
                            p.onClick(e)
                            if (e.defaultPrevented) onOpenChange(false)
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
