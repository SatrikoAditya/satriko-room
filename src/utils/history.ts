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
  if (active === null) {
    useRoomStore.getState().setOpenedInApp(true)
    pushPath(`/${slug}`)
  } else {
    replacePath(`/${slug}`)
  }
}
export function closeSection(active: SectionSlug | null): void {
  if (active === null) return
  const strategy = decideClose(useRoomStore.getState().openedInApp)
  useRoomStore.getState().setOpenedInApp(false)
  if (strategy === 'back') window.history.back()
  else replacePath('/')
}
/** For code inside the R3F <Canvas>, where Next's router context is unavailable. */
export function openFromScene(slug: SectionSlug): void {
  openSection(currentSlug(), slug)
}
