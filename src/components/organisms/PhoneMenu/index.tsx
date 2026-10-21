'use client'

import { useRef } from 'react'
import { CircleQuestionMark } from 'lucide-react'
import { motion } from 'motion/react'

import PhoneAppTile from '@components/molecules/PhoneAppTile'
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'

import { useBogorTime } from '@hooks/useBogorTime'
import { useSectionNavigation } from '@hooks/useSectionNavigation'

import { sections } from '@constants/sections'
import { formatHHMM } from '@utils/time'

import { usePhoneGrid } from './usePhoneGrid'

export default function PhoneMenu({
  open,
  onOpenChange,
  onHelp,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHelp: () => void
}) {
  const { linkProps } = useSectionNavigation()
  const time = useBogorTime()
  const gridRef = useRef<HTMLDivElement>(null)
  const onKeyDown = usePhoneGrid(gridRef)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-40 bg-[#2b2238]/20" />
        <DialogContent asChild aria-describedby={undefined}>
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
            <DialogTitle className="font-display my-3 text-xl font-extrabold">
              Hi! Where to?
            </DialogTitle>
            <div
              ref={gridRef}
              role="grid"
              aria-label="Sections"
              onKeyDown={onKeyDown}
              className="grid grid-cols-3 gap-2"
            >
              {sections.map((s) => {
                const p = linkProps(s.slug)
                return (
                  <div key={s.slug} role="gridcell">
                    <PhoneAppTile
                      section={s}
                      href={p.href}
                      onClick={(e) => {
                        p.onClick(e)
                        if (e.defaultPrevented) onOpenChange(false)
                      }}
                    />
                  </div>
                )
              })}
              <div role="gridcell">
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false)
                    onHelp()
                  }}
                  className="focus-visible:ring-accent flex min-h-11 w-full flex-col items-center gap-1 rounded-2xl p-2 outline-none focus-visible:ring-4"
                >
                  <span className="bg-paper-2 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm">
                    <CircleQuestionMark size={26} />
                  </span>
                  <span className="font-display text-xs font-bold">Help</span>
                </button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
