'use client'

import { AnimatePresence } from 'motion/react'

import PanelFrame from '@components/organisms/PanelFrame'
import { Dialog, DialogPortal } from '@/components/ui/dialog'

import { useRoomStore } from '@store/useRoomStore'
import { useActiveSection } from '@hooks/useActiveSection'
import { useSectionNavigation } from '@hooks/useSectionNavigation'
import { useViewportSize } from '@hooks/useViewportSize'

import { sectionBySlug } from '@constants/sections'
import { finalRect } from '@utils/modalRect'

import { panelComponents } from './panels'

export default function ModalHost() {
  const active = useActiveSection()
  const transition = useRoomStore((s) => s.transition)
  const originRect = useRoomStore((s) => s.originRect)
  const { close } = useSectionNavigation()
  const viewport = useViewportSize()
  const shown = active && transition !== 'focusing' ? active : null
  const to = viewport ? finalRect(viewport.width, viewport.height) : null

  return (
    <Dialog
      open={shown !== null}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogPortal forceMount>
        <AnimatePresence
          mode="wait"
          onExitComplete={() => {
            const s = useRoomStore.getState()
            if (s.transition === 'closing') s.setTransition('idle')
          }}
        >
          {shown && (
            <PanelFrame
              key={shown}
              section={sectionBySlug(shown)}
              onClose={close}
              originRect={originRect}
              finalRect={to}
            >
              {(() => {
                const Panel = panelComponents[shown]
                return <Panel />
              })()}
            </PanelFrame>
          )}
        </AnimatePresence>
      </DialogPortal>
    </Dialog>
  )
}
