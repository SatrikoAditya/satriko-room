'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

import { useSceneStore } from '@store/useSceneStore'

// Mirrors next-themes (source of truth for the UI palette) into the scene store.
export function useThemeSync() {
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    useSceneStore
      .getState()
      .setTheme(resolvedTheme === 'dark' ? 'night' : 'day')
  }, [resolvedTheme])
}
