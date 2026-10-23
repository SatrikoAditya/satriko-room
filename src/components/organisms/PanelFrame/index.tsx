'use client'

import type { CSSProperties, ReactNode } from 'react'
import { X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import IconButton from '@components/atoms/IconButton'
import StitchedLabel from '@components/atoms/StitchedLabel'
import OyenPeek from '@components/molecules/OyenPeek'
import { cn } from '@components/shadcn/utils'
import {
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog'

import { useSceneStore } from '@store/useSceneStore'

import type { Section } from '@interfaces/section'
import type { Rect } from '@interfaces/ui'
import { growTransform, MOBILE_BREAKPOINT } from '@utils/modalRect'

export interface PanelFrameProps {
  section: Section
  children: ReactNode
  onClose: () => void
  originRect: Rect | null
  finalRect: Rect | null
}

const themeClass: Record<Section['theme'], string> = {
  scrapbook: 'bg-paper',
  monitor: 'bg-paper',
  whiteboard: 'bg-paper',
  shelf: 'bg-paper',
  frames: 'bg-paper-2',
  tv: 'bg-paper',
  map: 'bg-paper',
  journal: 'bg-paper-2',
  logbook: 'bg-sky/30',
  clocks: 'bg-paper',
  envelope: 'bg-peach/40',
  paper: 'bg-paper-2',
}

export default function PanelFrame({
  section,
  children,
  onClose,
  originRect,
  finalRect: to,
}: PanelFrameProps) {
  const reduced = useReducedMotion()
  const tier = useSceneStore((s) => s.tier)
  const animated = to !== null && !reduced
  const from =
    animated && originRect
      ? growTransform(originRect, to)
      : { x: 0, y: 0, scaleX: 0.92, scaleY: 0.92 }
  const isSheet = to !== null && to.width + 2 * to.x < MOBILE_BREAKPOINT
  const Icon = section.icon
  const layout: CSSProperties = to
    ? { left: to.x, top: to.y, width: to.width, height: to.height }
    : {
        left: '50%',
        top: '50%',
        width: 'min(80vw, 1100px)',
        height: '80vh',
        translate: '-50% -50%',
      }

  return (
    <>
      <DialogOverlay asChild forceMount>
        <motion.div
          className={cn(
            'fixed inset-0 z-40 bg-[#2b2238]/35',
            tier === 'high' && 'backdrop-blur-[4px]',
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      </DialogOverlay>
      <DialogContent
        asChild
        forceMount
        aria-describedby={undefined}
        onCloseAutoFocus={() => {
          // The opener (e.g. a phone tile) may be gone by now; fall back to the phone button.
          setTimeout(() => {
            const a = document.activeElement
            if (!a || a === document.body)
              document
                .querySelector<HTMLElement>('[aria-label="Open phone menu"]')
                ?.focus()
          }, 0)
        }}
      >
        <motion.div
          className={cn(
            'stitched rounded-frame fixed z-50 flex flex-col shadow-[0_20px_60px_rgb(74_52_38/0.25)] outline-none',
            themeClass[section.theme],
          )}
          style={{ ...layout, transformOrigin: '0 0' }}
          initial={animated ? { ...from, opacity: 0.6 } : false}
          animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }}
          exit={animated ? { ...from, opacity: 0 } : { opacity: 0 }}
          transition={
            animated
              ? { type: 'spring', stiffness: 260, damping: 24, mass: 0.9 }
              : { duration: 0.15 }
          }
          drag={isSheet ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120) onClose()
          }}
        >
          {/* Oyen climbs the panel and introduces it (decision 62). */}
          <OyenPeek slug={section.slug} animated={animated} />
          {isSheet && (
            <div
              aria-hidden="true"
              className="bg-wood/50 mx-auto mt-2 h-1.5 w-12 rounded-full"
            />
          )}
          <div className="flex items-center justify-between gap-3 px-5 pt-4">
            <DialogTitle asChild>
              <h2 className="m-0">
                <StitchedLabel className="text-xl">
                  <Icon size={20} /> {section.title}
                </StitchedLabel>
              </h2>
            </DialogTitle>
            <IconButton label="Close" onClick={onClose}>
              <X />
            </IconButton>
          </div>
          {/* Focusable so keyboard users can scroll panels without links (axe scrollable-region-focusable). */}
          <motion.div
            role="region"
            aria-label={section.title}
            tabIndex={0}
            className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-6"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: animated ? 0.25 : 0, duration: 0.15 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            {children}
          </motion.div>
        </motion.div>
      </DialogContent>
    </>
  )
}
