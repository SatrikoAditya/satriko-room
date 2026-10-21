'use client'

import { useEffect } from 'react'

import { useSceneStore } from '@store/useSceneStore'

import { detectWebGL } from '@utils/webgl'

export function useWebGLSupport() {
  useEffect(() => {
    const { webgl, setWebgl } = useSceneStore.getState()
    if (webgl === 'unknown')
      setWebgl(detectWebGL() ? 'supported' : 'unsupported')
  }, [])
}
