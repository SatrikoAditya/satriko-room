import { render, screen } from '@testing-library/react'
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
      'Sound on',
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
})
