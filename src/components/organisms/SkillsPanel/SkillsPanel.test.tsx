import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import SkillsPanel from '.'

const notes = () => screen.queryAllByRole('note')

describe('SkillsPanel "Used at" notes', () => {
  afterEach(cleanup)

  it('opens one note at a time', async () => {
    const user = userEvent.setup()
    render(<SkillsPanel />)
    await user.click(screen.getByRole('button', { name: 'Node.js' }))
    expect(notes()).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'NestJS' }))
    expect(notes()).toHaveLength(1)
    expect(notes()[0]).toHaveTextContent('Jitera')
    expect(screen.getByRole('button', { name: 'Node.js' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('button', { name: 'NestJS' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('closes the note when clicking outside it', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <p>Outside the panel</p>
        <SkillsPanel />
      </div>,
    )
    await user.click(screen.getByRole('button', { name: 'Python' }))
    expect(notes()).toHaveLength(1)
    await user.click(screen.getByText('Languages & Runtimes'))
    expect(notes()).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: 'Python' }))
    await user.click(screen.getByText('Outside the panel'))
    expect(notes()).toHaveLength(0)
  })

  it('keeps the note open when clicking inside it, and closes it from its book', async () => {
    const user = userEvent.setup()
    render(<SkillsPanel />)
    const book = screen.getByRole('button', { name: 'TypeScript' })
    await user.click(book)
    await user.click(screen.getByText('Used at'))
    expect(notes()).toHaveLength(1)
    await user.click(book)
    expect(notes()).toHaveLength(0)
  })
})
