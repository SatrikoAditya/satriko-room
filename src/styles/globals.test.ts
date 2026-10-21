import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(__dirname, 'globals.css'), 'utf8')
const tokens = [
  '--paper',
  '--paper-2',
  '--ink',
  '--ink-muted',
  '--wood',
  '--wood-dark',
  '--mint',
  '--sky',
  '--peach',
  '--lavender',
  '--accent',
  '--accent-soft',
  '--on-accent',
  '--bg-top',
  '--bg-bottom',
]

describe('globals.css theme tokens', () => {
  it('defines every token for the light theme (:root)', () => {
    const root = css.split(':root')[1].split('}')[0]
    for (const t of tokens) expect(root).toContain(`${t}:`)
  })
  it('redefines every token for the night theme', () => {
    const night = css.split(`[data-theme='night'] {`)[1].split('}')[0]
    for (const t of tokens) expect(night).toContain(`${t}:`)
  })
  it('exposes tokens to Tailwind and keys the dark variant on data-theme', () => {
    expect(css).toContain('@theme inline')
    expect(css).toContain('--color-paper: var(--paper)')
    expect(css).toContain(`@custom-variant dark`)
  })
})
