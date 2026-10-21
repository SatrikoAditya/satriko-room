import { act, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import RemoteWorkPanel from '.'

describe('RemoteWorkPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-21T05:04:09Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('server-renders the real overlap window before the clocks start', () => {
    const html = renderToString(<RemoteWorkPanel />)
    expect(html).toContain('Overlap: 12:00–17:00 WIB')
    expect(html).not.toContain('No shared working hours')
  })
  it('shows the three live times and the overlap window after mount', () => {
    render(<RemoteWorkPanel />)
    act(() => {
      vi.advanceTimersByTime(1100)
    })
    expect(screen.getByText('12:04')).toBeInTheDocument() // Bogor
    expect(screen.getByText('13:04')).toBeInTheDocument() // Singapore
    expect(screen.getByText('09:04')).toBeInTheDocument() // Abu Dhabi
    expect(screen.getByText(/Overlap: 12:00–17:00 WIB/)).toBeInTheDocument()
  })
})
