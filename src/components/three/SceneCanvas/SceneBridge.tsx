'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface SceneBridgeValue {
  toggleTheme: () => void
  reducedMotion: boolean
  coarsePointer: boolean
}

const SceneBridgeContext = createContext<SceneBridgeValue | null>(null)

export function SceneBridgeProvider({
  value,
  children,
}: {
  value: SceneBridgeValue
  children: ReactNode
}) {
  return (
    <SceneBridgeContext.Provider value={value}>
      {children}
    </SceneBridgeContext.Provider>
  )
}

export function useSceneBridge(): SceneBridgeValue {
  const value = useContext(SceneBridgeContext)
  if (!value)
    throw new Error('useSceneBridge must be used inside <SceneCanvas>')
  return value
}
