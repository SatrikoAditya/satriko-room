import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useSceneStore } from '@store/useSceneStore'

import { useThemeSync } from './useThemeSync'

const mocks = vi.hoisted(() => ({ resolved: 'light' }))
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: mocks.resolved }),
}))

describe('useThemeSync', () => {
  it('mirrors next-themes into the scene store as day/night', () => {
    const { rerender } = renderHook(() => useThemeSync())
    expect(useSceneStore.getState().theme).toBe('day')
    mocks.resolved = 'dark'
    rerender()
    expect(useSceneStore.getState().theme).toBe('night')
  })
})
