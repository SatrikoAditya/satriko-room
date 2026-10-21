'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  CircleQuestionMark,
  FileDown,
  Mail,
  Moon,
  Smartphone,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import Button from '@components/atoms/Button'
import IconButton from '@components/atoms/IconButton'
import HelpSheet from '@components/organisms/HelpSheet'
import PhoneMenu from '@components/organisms/PhoneMenu'

import { useSoundStore } from '@store/useSoundStore'
import { useSectionNavigation } from '@hooks/useSectionNavigation'

import { site } from '@constants/site'

const subscribeNever = () => () => {}

export default function Hud() {
  const { linkProps } = useSectionNavigation()
  const { resolvedTheme, setTheme } = useTheme()
  const master = useSoundStore((s) => s.master)
  const toggleMaster = useSoundStore((s) => s.toggleMaster)
  const [phoneOpen, setPhoneOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
  useEffect(() => {
    useSoundStore.getState().hydrate()
  }, [])
  const night = mounted && resolvedTheme === 'dark'
  const about = linkProps('about')
  return (
    <div data-testid="hud">
      <a
        {...about}
        className="stitched bg-paper font-display fixed top-4 left-4 z-30 rounded-xl px-3 py-2 text-sm font-bold shadow-md"
      >
        {site.name}{' '}
        <span className="text-ink-muted hidden sm:inline">· {site.title}</span>
      </a>
      <div className="fixed top-4 right-4 z-30 flex gap-2">
        <IconButton label="Sound" pressed={master} onClick={toggleMaster}>
          {master ? <Volume2 /> : <VolumeX />}
        </IconButton>
        <IconButton
          label={night ? 'Switch to day' : 'Switch to night'}
          onClick={() => setTheme(night ? 'light' : 'dark')}
        >
          {night ? <Sun /> : <Moon />}
        </IconButton>
        <IconButton label="Help" onClick={() => setHelpOpen(true)}>
          <CircleQuestionMark />
        </IconButton>
      </div>
      <div className="max-sm:border-wood/30 max-sm:bg-paper/90 fixed right-4 bottom-4 z-30 flex items-center gap-2 max-sm:inset-x-0 max-sm:right-0 max-sm:bottom-0 max-sm:justify-around max-sm:border-t max-sm:p-2 max-sm:backdrop-blur">
        <Button variant="ghost" {...linkProps('resume')}>
          <FileDown size={18} /> Resume
        </Button>
        <IconButton
          label="Open phone menu"
          onClick={() => setPhoneOpen(true)}
          className="bg-accent text-on-accent h-14 w-14"
        >
          <Smartphone />
        </IconButton>
        <Button variant="ghost" {...linkProps('contact')}>
          <Mail size={18} /> Contact
        </Button>
      </div>
      <PhoneMenu
        open={phoneOpen}
        onOpenChange={setPhoneOpen}
        onHelp={() => setHelpOpen(true)}
      />
      <HelpSheet open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  )
}
