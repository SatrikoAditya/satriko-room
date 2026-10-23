import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Hud from '.'

const mocks = vi.hoisted(() => ({ setTheme: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light', setTheme: mocks.setTheme }),
}))

describe('Hud', () => {
  beforeEach(() => mocks.setTheme.mockClear())
  it('shows the name tag and the always-visible controls', () => {
    render(<Hud />)
    expect(
      screen.getByRole('link', { name: /Satriko Aditya/ }),
    ).toHaveAttribute('href', '/about')
    for (const name of [
      'Sound',
      'Switch to night',
      'Help',
      'Resume',
      'Contact',
      'Open phone menu',
    ])
      expect(
        screen.getByRole(
          name === 'Resume' || name === 'Contact' ? 'link' : 'button',
          { name },
        ),
      ).toBeInTheDocument()
  })
  it('keeps one Sound label and reports the state with aria-pressed', async () => {
    // Sound is on by default (decision 60).
    window.localStorage.clear()
    render(<Hud />)
    const sound = screen.getByRole('button', { name: 'Sound' })
    await waitFor(() => expect(sound).toHaveAttribute('aria-pressed', 'true'))
    await userEvent.click(sound)
    expect(screen.getByRole('button', { name: 'Sound' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await userEvent.click(sound)
    expect(sound).toHaveAttribute('aria-pressed', 'true')
  })
  it('toggles the theme', async () => {
    render(<Hud />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to night' }),
    )
    expect(mocks.setTheme).toHaveBeenCalledWith('dark')
  })
  it('opens the phone with 12 tiles and supports arrow-key movement', async () => {
    render(<Hud />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Open phone menu' }),
    )
    const grid = await screen.findByRole('grid', { name: 'Sections' })
    const tiles = screen.getAllByRole('gridcell')
    expect(tiles).toHaveLength(12)
    tiles[0].querySelector<HTMLElement>('a,button')!.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(tiles[1].querySelector('a,button'))
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(tiles[4].querySelector('a,button'))
    expect(grid).toBeInTheDocument()
  })
  it('the phone menu has its own close button outside the grid', async () => {
    render(<Hud />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Open phone menu' }),
    )
    const close = await screen.findByRole('button', { name: 'Close menu' })
    // Focus starts on the first app, not on the close button.
    await waitFor(() =>
      expect(
        screen.getAllByRole('gridcell')[0].querySelector('a'),
      ).toHaveFocus(),
    )
    expect(
      within(screen.getByRole('grid', { name: 'Sections' })).queryByRole(
        'button',
        { name: 'Close menu' },
      ),
    ).toBeNull()
    expect(screen.getAllByRole('gridcell')).toHaveLength(12)
    await userEvent.click(close)
    expect(screen.queryByRole('grid', { name: 'Sections' })).toBeNull()
  })
  it('the help sheet has a close button', async () => {
    render(<Hud />)
    await userEvent.click(screen.getByRole('button', { name: 'Help' }))
    await screen.findByRole('dialog', { name: 'How to explore' })
    await userEvent.click(screen.getByRole('button', { name: 'Close help' }))
    expect(screen.queryByRole('dialog', { name: 'How to explore' })).toBeNull()
  })
  it('phone grid has rows of three cells', async () => {
    render(<Hud />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Open phone menu' }),
    )
    const rows = await screen.findAllByRole('row')
    expect(rows).toHaveLength(4)
    for (const row of rows)
      expect(within(row).getAllByRole('gridcell')).toHaveLength(3)
  })
  it('on a touch screen, shows a Labels switch that hides the tags', async () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
    try {
      render(<Hud />)
      const labels = await screen.findByRole('button', { name: 'Labels' })
      expect(labels).toHaveAttribute('aria-pressed', 'true')
      await userEvent.click(labels)
      expect(labels).toHaveAttribute('aria-pressed', 'false')
      await userEvent.click(labels)
    } finally {
      window.matchMedia = original
    }
  })
  it('has no Labels switch with a mouse', () => {
    render(<Hud />)
    expect(screen.queryByRole('button', { name: 'Labels' })).toBeNull()
  })
  it('the Settings menu opens and closes on Esc or a tap outside', async () => {
    render(<Hud />)
    const settings = screen.getByRole('button', { name: 'Settings' })
    expect(settings).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(settings)
    expect(settings).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById('hud-settings')).toHaveAttribute(
      'data-open',
      'true',
    )
    await userEvent.keyboard('{Escape}')
    expect(settings).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(settings)
    await userEvent.click(document.body)
    expect(settings).toHaveAttribute('aria-expanded', 'false')
  })
})
