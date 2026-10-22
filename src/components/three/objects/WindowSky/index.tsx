'use client'

import { useEffect, useRef, useState } from 'react'
import { RoundedBox, Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { CanvasTexture, Group, Mesh, MeshBasicMaterial } from 'three'

import { clay } from '@components/three/materials'
import { useSceneBridge } from '@components/three/SceneCanvas/SceneBridge'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { SKY_BLEND_SECONDS, SKY_UPDATE_MS } from '@constants/sky'
import { BASE_ZONE } from '@constants/timezones'
import { fadeStep, skyPhase, sunHeight } from '@utils/sky'
import { zonedTime } from '@utils/time'

import { useSkyTexture } from './useSkyTexture'

const minutesNow = () => {
  const t = zonedTime(new Date(), BASE_ZONE)
  return t.h * 60 + t.m
}

export default function WindowSky() {
  const w = roomLayout.window
  const [, H, W] = w.size!
  const [minutes, setMinutes] = useState(minutesNow)
  useEffect(() => {
    const id = window.setInterval(() => setMinutes(minutesNow()), SKY_UPDATE_MS)
    return () => window.clearInterval(id)
  }, [])
  const phase = skyPhase(minutes)
  const texture = useSkyTexture(phase)
  const { reducedMotion } = useSceneBridge()
  // keep the outgoing texture on a front plane that fades out over the new one
  const [shown, setShown] = useState<CanvasTexture>(texture)
  const [previous, setPrevious] = useState<CanvasTexture | null>(null)
  if (shown !== texture) {
    setShown(texture)
    setPrevious(reducedMotion ? null : shown)
  }
  const fade = useRef<Mesh>(null)
  const clouds = useRef<Group>(null)
  const sun = useRef<Mesh>(null)
  // the moon rides high; the sun follows its daily arc (0 at night)
  const height = phase === 'night' ? 0.75 : sunHeight(minutes)

  useFrame((state, dt) => {
    const m = fade.current?.material as MeshBasicMaterial | undefined
    if (m && previous) {
      m.opacity = fadeStep(m.opacity, dt, SKY_BLEND_SECONDS)
      if (m.opacity <= 0) {
        previous.dispose()
        setPrevious(null)
      }
    }
    if (clouds.current) {
      clouds.current.position.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.3
    }
    if (sun.current) {
      sun.current.position.y = -H / 2 + 0.2 + height * (H - 0.5)
    }
  })

  return (
    <group position={[...w.position]} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox args={[W + 0.2, H + 0.2, 0.08]} radius={0.03}>
        <meshStandardMaterial {...clay(palette.cream)} />
      </RoundedBox>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {previous && (
        <mesh ref={fade} key={previous.uuid} position={[0, 0, 0.052]}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial
            map={previous}
            transparent
            opacity={1}
            toneMapped={false}
          />
        </mesh>
      )}
      <mesh ref={sun} position={[W / 3, 0, 0.06]}>
        <circleGeometry args={[0.16, 24]} />
        <meshBasicMaterial
          color={phase === 'night' ? '#fff7d6' : '#ffe27a'}
          toneMapped={false}
        />
      </mesh>
      {phase !== 'night' && (
        <group ref={clouds}>
          {[-0.5, 0.4].map((x, i) => (
            // Flattened into a thin layer (z 0.061 to 0.079): in front of the
            // sun at 0.06, behind the window bars, whose back face is at 0.08.
            <mesh
              key={i}
              position={[x, 0.3 - i * 0.5, 0.07]}
              scale={[1.6, 0.6, 0.04]}
            >
              <sphereGeometry args={[0.22, 12, 8]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
      {phase === 'night' && (
        <Sparkles
          count={30}
          // Stars stay between the sky and the window bars too.
          scale={[W - 0.3, H - 0.3, 0.02]}
          position={[0, 0, 0.065]}
          size={2}
          speed={0.1}
          color="#ffffff"
        />
      )}
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[0.06, H, 0.02]} />
        <meshStandardMaterial {...clay(palette.cream)} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[W, 0.06, 0.02]} />
        <meshStandardMaterial {...clay(palette.cream)} />
      </mesh>
      {[-1, 1].map((s) => (
        <RoundedBox
          key={s}
          args={[0.5, H + 0.3, 0.1]}
          radius={0.04}
          position={[s * (W / 2 + 0.2), 0, 0.1]}
        >
          <meshStandardMaterial {...clay(palette.peach)} />
        </RoundedBox>
      ))}
    </group>
  )
}
