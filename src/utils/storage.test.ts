// src/utils/storage.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'

import { readJSON, writeJSON } from './storage'

describe('storage', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })
  it('round-trips JSON values', () => {
    writeJSON('k', { a: 1 })
    expect(readJSON('k', { a: 0 })).toEqual({ a: 1 })
  })
  it('returns the fallback for missing keys and invalid JSON', () => {
    expect(readJSON('missing', 'x')).toBe('x')
    window.localStorage.setItem('bad', '{oops')
    expect(readJSON('bad', 'x')).toBe('x')
  })
  it('never throws when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => writeJSON('k', 1)).not.toThrow()
    expect(readJSON('k', 'fallback')).toBe('fallback')
  })
})
