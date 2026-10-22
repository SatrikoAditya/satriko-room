'use client'

import { Suspense } from 'react'
import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useTheme } from 'next-themes'
import { NeutralToneMapping, PCFShadowMap } from 'three'

import CameraDirector from '@components/three/CameraDirector'
import Room from '@components/three/Room'
import Lighting from '@components/three/Room/Lighting'
import RoomObjects from '@components/three/RoomObjects'

import { useSceneStore } from '@store/useSceneStore'
import { useIsCoarsePointer } from '@hooks/useIsCoarsePointer'
import { usePrefersReducedMotion } from '@hooks/usePrefersReducedMotion'

import {
  DEFAULT_CAMERA_OFFSET as O,
  DEFAULT_CAMERA_TARGET as T,
} from '@constants/camera'

import { SceneBridgeProvider } from './SceneBridge'
import SceneErrorBoundary from './SceneErrorBoundary'
import SceneReady from './SceneReady'
import ShadowRefresh from './ShadowRefresh'

export default function SceneCanvas() {
  const tier = useSceneStore((s) => s.tier)
  const { resolvedTheme, setTheme } = useTheme()
  const reducedMotion = usePrefersReducedMotion()
  const coarsePointer = useIsCoarsePointer()
  const bridge = {
    toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    reducedMotion,
    coarsePointer,
  }
  return (
    <div aria-hidden="true" className="absolute inset-0" data-testid="scene">
      <SceneErrorBoundary
        onError={() => useSceneStore.getState().setWebgl('lost')}
      >
        <Canvas
          orthographic
          camera={{
            zoom: 60,
            position: [T[0] + O[0], T[1] + O[1], T[2] + O[2]],
            near: -100,
            far: 200,
          }}
          dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
          shadows={tier === 'high' ? { type: PCFShadowMap } : false}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            // Neutral keeps the palette's pastels; R3F's default ACES greys them (Task 19).
            toneMapping: NeutralToneMapping,
          }}
          onCreated={({ gl, camera }) => {
            camera.lookAt(T[0], T[1], T[2])
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault()
              useSceneStore.getState().setWebgl('lost')
            })
          }}
        >
          <SceneBridgeProvider value={bridge}>
            <PerformanceMonitor
              onDecline={() => useSceneStore.getState().setTier('low')}
              flipflops={1}
            />
            <Suspense fallback={null}>
              <Lighting />
              <Room />
              <RoomObjects />
              <CameraDirector />
              <SceneReady />
              <ShadowRefresh />
            </Suspense>
          </SceneBridgeProvider>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
