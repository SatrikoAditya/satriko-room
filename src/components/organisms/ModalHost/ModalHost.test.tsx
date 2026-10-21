import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MotionConfig } from 'motion/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRoomStore } from '@store/useRoomStore'

import ModalHost from '.'

const nav = vi.hoisted(() => ({ pathname: '/experience' }))
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }))

const renderHost = () =>
  render(
    <MotionConfig reducedMotion="always">
      <ModalHost />
    </MotionConfig>,
  )

describe('ModalHost', () => {
  beforeEach(() => {
    nav.pathname = '/experience'
    useRoomStore.setState({
      transition: 'idle',
      originRect: null,
      openedInApp: false,
    })
  })
  it('renders the active panel as an accessible dialog and moves focus inside', async () => {
    renderHost()
    const dialog = await screen.findByRole('dialog', {
      name: 'Work experience',
    })
    expect(dialog).toBeInTheDocument()
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    )
    expect(screen.getByText(/Agile Collaboration/)).toBeInTheDocument()
  })
  it('closes with Escape by replacing the URL when not opened in-app', async () => {
    const replace = vi.spyOn(window.history, 'replaceState')
    renderHost()
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(replace).toHaveBeenCalledWith(null, '', '/')
  })
  it('hides the panel while the camera is focusing', () => {
    useRoomStore.setState({ transition: 'focusing' })
    renderHost()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('Escape closes exactly once (replace when not opened in-app)', async () => {
    const replace = vi.spyOn(window.history, 'replaceState')
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    replace.mockClear()
    renderHost()
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(replace).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith(null, '', '/')
    expect(back).not.toHaveBeenCalled()
  })
  it('Escape goes back exactly once when the panel was opened in-app', async () => {
    useRoomStore.setState({ openedInApp: true })
    const replace = vi.spyOn(window.history, 'replaceState')
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    replace.mockClear()
    renderHost()
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(back).toHaveBeenCalledTimes(1)
    expect(replace).not.toHaveBeenCalled()
  })
})
