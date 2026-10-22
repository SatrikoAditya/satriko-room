'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  type AmbientLight,
  type DirectionalLight,
  type HemisphereLight,
  type Mesh,
  type MeshStandardMaterial,
  type PointLight,
} from 'three'

import { useSceneStore } from '@store/useSceneStore'

import { roomLayout } from '@constants/roomLayout'
import type { LampId } from '@interfaces/section'

import { useSceneBridge } from '../SceneCanvas/SceneBridge'
import { lightingPresets, THEME_BLEND_SECONDS } from './lightingPresets'

const day = lightingPresets.day
const tmp = new Color()

// Lights are physically based (r155+) and tone-mapped with Neutral (see SceneCanvas),
// so albedos render close to the palette at about unit light. The hemisphere carries
// most of the wall light: walls get half sky + half ground.
// Every frame the lights blend toward the active theme preset (instant with reduced motion).
export default function Lighting() {
  const hemi = useRef<HemisphereLight>(null)
  const sun = useRef<DirectionalLight>(null)
  const moon = useRef<DirectionalLight>(null)
  const amb = useRef<AmbientLight>(null)
  const { reducedMotion } = useSceneBridge()
  // Start already on the active theme's preset so a night start never flashes day.
  const [start] = useState(
    () => lightingPresets[useSceneStore.getState().theme],
  )

  useFrame((state, dt) => {
    const { theme, lampsOn } = useSceneStore.getState()
    const p = lightingPresets[theme]
    const lampTarget = (o: { userData: { lampId?: LampId } }) =>
      o.userData.lampId && lampsOn[o.userData.lampId] ? p.lamp : 0
    const k = reducedMotion ? 1 : Math.min(1, dt / THEME_BLEND_SECONDS)
    if (hemi.current) {
      hemi.current.intensity += (p.hemiIntensity - hemi.current.intensity) * k
      hemi.current.color.lerp(tmp.set(p.hemiSky), k)
      hemi.current.groundColor.lerp(tmp.set(p.hemiGround), k)
    }
    if (sun.current) {
      sun.current.intensity += (p.sunIntensity - sun.current.intensity) * k
      sun.current.color.lerp(tmp.set(p.sunColor), k)
    }
    if (amb.current)
      amb.current.intensity += (p.ambient - amb.current.intensity) * k
    if (moon.current)
      moon.current.intensity += (p.moon - moon.current.intensity) * k
    state.scene.traverse((o) => {
      if (o.name === 'lampLight') {
        const l = o as PointLight
        l.intensity += (lampTarget(o) - l.intensity) * k
      } else if (o.name === 'lampShade') {
        const m = (o as Mesh).material as MeshStandardMaterial
        m.emissiveIntensity +=
          (lampTarget(o) / lightingPresets.night.lamp - m.emissiveIntensity) * k
      } else if (o.name === 'pcScreen' || o.name === 'tvScreen') {
        // Each screen keeps its own day glow; night scales it by the preset ratio.
        const m = (o as Mesh).material as MeshStandardMaterial
        const base = (o.userData.dayGlow ??= m.emissiveIntensity) as number
        const target = base * (p.screenGlow / day.screenGlow)
        m.emissiveIntensity += (target - m.emissiveIntensity) * k
      }
    })
  })

  return (
    <>
      <hemisphereLight
        ref={hemi}
        args={[start.hemiSky, start.hemiGround, start.hemiIntensity]}
      />
      <directionalLight
        ref={sun}
        position={[-6, 9, 3]}
        intensity={start.sunIntensity}
        color={start.sunColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-intensity={0.8}
      />
      <directionalLight
        ref={moon}
        // Moonlight comes in through the window.
        position={[-8, 6, roomLayout.window.position[2]]}
        intensity={0}
        color="#9fb4ff"
      />
      <ambientLight ref={amb} intensity={start.ambient} />
    </>
  )
}
