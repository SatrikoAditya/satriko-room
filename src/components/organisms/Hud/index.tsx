'use client'

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  CircleQuestionMark,
  FileDown,
  Mail,
  Minimize2,
  Moon,
  Settings2,
  Smartphone,
  Sun,
  Tag,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import Button from '@components/atoms/Button'
import IconButton from '@components/atoms/IconButton'
import HelpSheet from '@components/organisms/HelpSheet'
import PhoneMenu from '@components/organisms/PhoneMenu'

import { useLabelStore } from '@store/useLabelStore'
import { useSceneStore } from '@store/useSceneStore'
import { useSoundStore } from '@store/useSoundStore'
import { useActiveSection } from '@hooks/useActiveSection'
import { useIsCoarsePointer } from '@hooks/useIsCoarsePointer'
import { useSectionNavigation } from '@hooks/useSectionNavigation'

import { site } from '@constants/site'
import { audio } from '@utils/audio'

const subscribeNever = () => () => {}

/**
 * One control in the Settings menu. On phones it fades and slides in after
 * the one above it while the menu is open, and is hidden (out of the tab
 * order) while it's closed; from sm up it simply shows.
 */
function Slot({ index, children }: { index: number; children: ReactNode }) {
  return (
    <div
      style={{ transitionDelay: `${index * 45}ms` }}
      className="max-sm:invisible max-sm:-translate-y-2 max-sm:opacity-0 max-sm:transition-all max-sm:duration-200 max-sm:group-data-[open=true]:visible max-sm:group-data-[open=true]:translate-y-0 max-sm:group-data-[open=true]:opacity-100"
    >
      {children}
    </div>
  )
}

export default function Hud() {
  const { linkProps } = useSectionNavigation()
  const active = useActiveSection()
  const zoomedIn = useSceneStore((s) => s.zoomedIn)
  const { resolvedTheme, setTheme } = useTheme()
  const master = useSoundStore((s) => s.master)
  const toggleMaster = useSoundStore((s) => s.toggleMaster)
  const touchLabels = useLabelStore((s) => s.touchLabels)
  const toggleTouchLabels = useLabelStore((s) => s.toggleTouchLabels)
  const coarsePointer = useIsCoarsePointer()
  const [phoneOpen, setPhoneOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  // Tapping outside the Settings menu or pressing Esc closes it.
  useEffect(() => {
    if (!settingsOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!settingsRef.current?.contains(e.target as Node))
        setSettingsOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [settingsOpen])
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
  useEffect(() => {
    useSoundStore.getState().hydrate()
    useLabelStore.getState().hydrate()
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
        {zoomedIn && active === null && (
          <IconButton
            label="Reset view"
            onClick={() => useSceneStore.getState().requestResetView()}
          >
            <Minimize2 />
          </IconButton>
        )}
        {/* Phones fold Labels, Sound and the theme into a Settings menu that
            drops down (decision 58); from sm up they sit in one row. */}
        <div ref={settingsRef} className="relative">
          <IconButton
            label="Settings"
            aria-expanded={settingsOpen}
            aria-controls="hud-settings"
            onClick={() => setSettingsOpen((o) => !o)}
            className="sm:hidden"
          >
            <Settings2 />
          </IconButton>
          <div
            id="hud-settings"
            data-open={settingsOpen}
            className="group flex gap-2 max-sm:absolute max-sm:top-full max-sm:right-0 max-sm:mt-2 max-sm:flex-col"
          >
            {/* Phones show every tag at once; this hides them to see the room. */}
            {coarsePointer && active === null && (
              <Slot index={0}>
                <IconButton
                  label="Labels"
                  pressed={touchLabels}
                  onClick={toggleTouchLabels}
                  className={touchLabels ? undefined : 'opacity-70'}
                >
                  <Tag />
                </IconButton>
              </Slot>
            )}
            <Slot index={1}>
              <IconButton
                label="Sound"
                pressed={master}
                onClick={() => {
                  audio.unlock()
                  toggleMaster()
                }}
              >
                {master ? <Volume2 /> : <VolumeX />}
              </IconButton>
            </Slot>
            <Slot index={2}>
              <IconButton
                label={night ? 'Switch to day' : 'Switch to night'}
                onClick={() => setTheme(night ? 'light' : 'dark')}
              >
                {night ? <Sun /> : <Moon />}
              </IconButton>
            </Slot>
          </div>
        </div>
        {/* Help stays one tap away on phones too. */}
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
      <PhoneMenu open={phoneOpen} onOpenChange={setPhoneOpen} />
      <HelpSheet open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  )
}
