import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'

import { useSectionNavigation } from './useSectionNavigation'

const nav = vi.hoisted(() => ({ pathname: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }))

describe('useSectionNavigation', () => {
  beforeEach(() => {
    nav.pathname = '/'
    useRoomStore.setState({ openedInApp: false })
    vi.restoreAllMocks()
  })

  it('open from the room pushes a new entry and marks openedInApp', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const { result } = renderHook(() => useSectionNavigation())
    act(() => result.current.open('skills'))
    expect(push).toHaveBeenCalledWith(null, '', '/skills')
    expect(useRoomStore.getState().openedInApp).toBe(true)
  })
  it('open while another panel is open replaces the entry', () => {
    nav.pathname = '/skills'
    const replace = vi.spyOn(window.history, 'replaceState')
    const { result } = renderHook(() => useSectionNavigation())
    act(() => result.current.open('contact'))
    expect(replace).toHaveBeenCalledWith(null, '', '/contact')
  })
  it('close goes back when opened in-app, otherwise replaces with /', () => {
    nav.pathname = '/skills'
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    const replace = vi.spyOn(window.history, 'replaceState')
    useRoomStore.setState({ openedInApp: true })
    const { result, rerender } = renderHook(() => useSectionNavigation())
    act(() => result.current.close())
    expect(back).toHaveBeenCalled()
    useRoomStore.setState({ openedInApp: false })
    rerender()
    act(() => result.current.close())
    expect(replace).toHaveBeenCalledWith(null, '', '/')
  })
  it('linkProps intercepts plain clicks but not modified clicks', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const { result } = renderHook(() => useSectionNavigation())
    const props = result.current.linkProps('resume')
    expect(props.href).toBe('/resume')
    const plain = {
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
    }
    act(() => props.onClick(plain as unknown as React.MouseEvent))
    expect(plain.preventDefault).toHaveBeenCalled()
    expect(push).toHaveBeenCalledTimes(1)
    const meta = { ...plain, metaKey: true, preventDefault: vi.fn() }
    act(() => props.onClick(meta as unknown as React.MouseEvent))
    expect(meta.preventDefault).not.toHaveBeenCalled()
  })
})
