'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Html, Sparkles, useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { Group, Mesh, MeshStandardMaterial } from 'three'

import HoverLabel from '@components/molecules/HoverLabel'

import { useSceneStore } from '@store/useSceneStore'

import { palette } from '@constants/roomPalette'
import type { ObjectId, Vec3 } from '@interfaces/section'

import { useSceneBridge } from '../SceneCanvas/SceneBridge'

/** Pointer travel (px) above which a click counts as the end of a drag. */
const DRAG_CLICK_PX = 6

export interface InteractiveProps {
  id: ObjectId
  label: string
  hitSize: Vec3
  hitOffset?: Vec3
  labelHeight: number
  /** Phones show every tag at all times; small extras (the lamps) opt out to keep the room readable. */
  alwaysLabelOnTouch?: boolean
  /**
   * Phones only: moves the tag (local units, added to [0, labelHeight, 0]) so
   * it stays clear of its neighbours when every tag is shown at once.
   */
  touchLabelOffset?: Vec3
  onActivate: () => void
  children: ReactNode
}

export default function Interactive({
  id,
  label,
  hitSize,
  hitOffset = [0, 0, 0],
  labelHeight,
  alwaysLabelOnTouch = true,
  touchLabelOffset = [0, 0, 0],
  onActivate,
  children,
}: InteractiveProps) {
  const inner = useRef<Group>(null)
  const lift = useRef(0)
  const hovered = useSceneStore((s) => s.hovered === id)
  const hinted = useSceneStore((s) => s.hint === id)
  const { reducedMotion, coarsePointer } = useSceneBridge()
  useCursor(hovered)

  useFrame((_, dt) => {
    const g = inner.current
    if (!g) return
    const target = hovered && !reducedMotion ? 1 : 0
    lift.current += (target - lift.current) * Math.min(1, dt * 12)
    g.position.y = lift.current * 0.08
    const s = 1 + lift.current * 0.03
    g.scale.set(s, s, s)
  })

  useEffect(() => {
    inner.current?.traverse((o) => {
      const mesh = o as Mesh
      if (!mesh.isMesh || mesh.userData.noHighlight) return
      const m = mesh.material as MeshStandardMaterial
      if (!m?.emissive) return
      m.emissive.set(hovered || hinted ? palette.lampGlow : '#000000')
      m.emissiveIntensity = hovered ? 0.18 : hinted ? 0.12 : 0
    })
  }, [hovered, hinted])

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    useSceneStore.getState().setHovered(id)
  }
  const out = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const { hovered: current, setHovered } = useSceneStore.getState()
    if (current === id) setHovered(null)
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // Ending a drag (sliding the zoomed-in room) over an object doesn't open it.
    if (e.delta > DRAG_CLICK_PX) return
    onActivate()
  }

  return (
    <group name={id} onPointerOver={over} onPointerOut={out} onClick={click}>
      <group ref={inner}>{children}</group>
      <mesh position={[...hitOffset]}>
        <boxGeometry args={[...hitSize]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {hinted && (
        <Sparkles
          count={24}
          scale={[hitSize[0] + 0.4, hitSize[1] + 0.4, hitSize[2] + 0.4]}
          position={[...hitOffset]}
          size={5}
          speed={0.5}
          color={palette.lampGlow}
        />
      )}
      {(hovered || (coarsePointer && alwaysLabelOnTouch)) && (
        <Html
          center
          position={
            coarsePointer
              ? [
                  touchLabelOffset[0],
                  labelHeight + touchLabelOffset[1],
                  touchLabelOffset[2],
                ]
              : [0, labelHeight, 0]
          }
          zIndexRange={[20, 0]}
          style={{ pointerEvents: coarsePointer ? 'auto' : 'none' }}
        >
          <HoverLabel
            label={label}
            onClick={coarsePointer ? onActivate : undefined}
          />
        </Html>
      )}
    </group>
  )
}
