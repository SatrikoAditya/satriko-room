'use client'

import { X } from 'lucide-react'

import IconButton from '@components/atoms/IconButton'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'

import { helpContent } from '@content/help'

export default function HelpSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-40 bg-[#2b2238]/35" />
        <DialogContent
          aria-describedby={undefined}
          className="stitched rounded-frame bg-paper fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-6 shadow-2xl outline-none"
        >
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="font-display text-2xl font-extrabold">
              How to explore
            </DialogTitle>
            <DialogClose asChild>
              <IconButton label="Close help">
                <X />
              </IconButton>
            </DialogClose>
          </div>
          <ul className="my-3 list-disc pl-5">
            {helpContent.explore.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <h3 className="font-display font-extrabold">Keyboard</h3>
          <ul className="my-3 list-disc pl-5">
            {helpContent.keyboard.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="my-3">{helpContent.sound}</p>
          <h3 className="font-display font-extrabold">Credits</h3>
          <ul className="my-3 list-disc pl-5">
            {helpContent.credits.map((c) => (
              <li key={c.name}>
                <a
                  className="underline"
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.name}
                </a>{' '}
                by {c.by} ({c.license})
              </li>
            ))}
          </ul>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
