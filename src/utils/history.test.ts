import { describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'

import {
  closeSection,
  currentSlug,
  decideClose,
  openFromScene,
  openSection,
  pushPath,
  replacePath,
} from './history'

describe('history', () => {
  it('goes back only when the panel was opened in the app', () => {
    expect(decideClose(true)).toBe('back')
    expect(decideClose(false)).toBe('replace')
  })
  it('pushes and replaces with the native History API', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    pushPath('/skills')
    replacePath('/')
    expect(push).toHaveBeenCalledWith(null, '', '/skills')
    expect(replace).toHaveBeenCalledWith(null, '', '/')
  })
  it('openSection pushes from the room and replaces when switching', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    useRoomStore.setState({ openedInApp: false })
    openSection(null, 'skills')
    expect(push).toHaveBeenCalledWith(null, '', '/skills')
    expect(useRoomStore.getState().openedInApp).toBe(true)
    openSection('skills', 'contact')
    expect(replace).toHaveBeenCalledWith(null, '', '/contact')
    openSection('contact', 'contact')
    expect(replace).toHaveBeenCalledTimes(1)
  })
  it('closeSection goes back when opened in-app, otherwise replaces with /', () => {
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const replace = vi.spyOn(window.history, 'replaceState')
    useRoomStore.setState({ openedInApp: true })
    closeSection('skills')
    expect(back).toHaveBeenCalled()
    useRoomStore.setState({ openedInApp: false })
    closeSection('skills')
    expect(replace).toHaveBeenCalledWith(null, '', '/')
    closeSection(null)
    expect(replace).toHaveBeenCalledTimes(1)
  })
  it('openFromScene reads the slug from window.location', () => {
    window.history.replaceState(null, '', '/about')
    expect(currentSlug()).toBe('about')
    const replace = vi.spyOn(window.history, 'replaceState')
    openFromScene('resume')
    expect(replace).toHaveBeenCalledWith(null, '', '/resume')
    window.history.replaceState(null, '', '/')
  })
})
