import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import CopyEmailButton from '.'

describe('CopyEmailButton', () => {
  it('copies the email and shows "Copied!"', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<CopyEmailButton email="satrikoaditya@gmail.com" />)
    await userEvent.click(screen.getByRole('button', { name: /copy email/i }))
    expect(writeText).toHaveBeenCalledWith('satrikoaditya@gmail.com')
    expect(await screen.findByText('Copied!')).toBeInTheDocument()
  })
  it('falls back to a hint when the clipboard is unavailable', async () => {
    Object.assign(navigator, { clipboard: undefined })
    render(<CopyEmailButton email="satrikoaditya@gmail.com" />)
    await userEvent.click(screen.getByRole('button', { name: /copy email/i }))
    expect(await screen.findByText(/⌘\/Ctrl\+C/)).toBeInTheDocument()
  })
})
