import { useRoomStore } from '@store/useRoomStore'

import { slugFromPathname } from '@constants/sections'
import type { SectionSlug } from '@interfaces/section'

export type CloseStrategy = 'back' | 'replace'

export function decideClose(openedInApp: boolean): CloseStrategy {
  return openedInApp ? 'back' : 'replace'
}
export function pushPath(path: string): void {
  window.history.pushState(null, '', path)
}
export function replacePath(path: string): void {
  window.history.replaceState(null, '', path)
}
export function currentSlug(): SectionSlug | null {
  return slugFromPathname(window.location.pathname)
}
export function openSection(
  active: SectionSlug | null,
  slug: SectionSlug,
): void {
  if (active === slug) return
  // The camera director reads the slug when a glide starts, so a second open
  // mid-glide (or during the entering swoop) would frame the wrong object.
  const { phase, transition } = useRoomStore.getState()
  if (transition === 'focusing' || phase === 'entering') return
  if (active === null) {
    useRoomStore.getState().setOpenedInApp(true)
    pushPath(`/${slug}`)
  } else {
    replacePath(`/${slug}`)
  }
}
export function closeSection(active: SectionSlug | null): void {
  if (active === null) return
  if (useRoomStore.getState().transition === 'closing') return // already on its way out
  const strategy = decideClose(useRoomStore.getState().openedInApp)
  useRoomStore.getState().setOpenedInApp(false)
  if (strategy === 'back') window.history.back()
  else replacePath('/')
}
/** For code inside the R3F <Canvas>, where Next's router context is unavailable. */
export function openFromScene(slug: SectionSlug): void {
  openSection(currentSlug(), slug)
}
