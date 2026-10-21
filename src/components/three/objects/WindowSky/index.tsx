'use client'

import { useEffect, useRef, useState } from 'react'
import { RoundedBox, Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshStandardMaterial } from 'three'

import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { SKY_BLEND_SECONDS, SKY_UPDATE_MS } from '@constants/sky'
import { BASE_ZONE } from '@constants/timezones'
import { skyPhase, sunHeight } from '@utils/sky'
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
  const sky = useRef<Mesh>(null)
  const clouds = useRef<Group>(null)
  const sun = useRef<Mesh>(null)
  // the moon rides high; the sun follows its daily arc (0 at night)
  const height = phase === 'night' ? 0.75 : sunHeight(minutes)

  useFrame((state, dt) => {
    const m = sky.current?.material as MeshStandardMaterial | undefined
    if (m && m.map !== texture) {
      m.opacity = Math.max(0, m.opacity - dt / SKY_BLEND_SECONDS)
      if (m.opacity <= 0) {
        m.map = texture
        m.needsUpdate = true
      }
    } else if (m && m.opacity < 1) {
      m.opacity = Math.min(1, m.opacity + dt / SKY_BLEND_SECONDS)
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
      <mesh ref={sky} position={[0, 0, 0.05]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={1}
          roughness={1}
        />
      </mesh>
      <mesh ref={sun} position={[W / 3, 0, 0.06]}>
        <circleGeometry args={[0.16, 24]} />
        <meshStandardMaterial
          color={phase === 'night' ? '#fff7d6' : '#ffe27a'}
          emissive={phase === 'night' ? '#fff7d6' : '#ffd25a'}
          emissiveIntensity={0.8}
        />
      </mesh>
      {phase !== 'night' && (
        <group ref={clouds}>
          {[-0.5, 0.4].map((x, i) => (
            <mesh
              key={i}
              position={[x, 0.3 - i * 0.5, 0.07]}
              scale={[1.6, 0.6, 1]}
            >
              <sphereGeometry args={[0.22, 12, 8]} />
              <meshStandardMaterial color="#ffffff" roughness={1} />
            </mesh>
          ))}
        </group>
      )}
      {phase === 'night' && (
        <Sparkles
          count={30}
          scale={[W - 0.3, H - 0.3, 0.05]}
          position={[0, 0, 0.07]}
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
