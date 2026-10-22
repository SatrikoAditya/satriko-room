'use client'

import { Html, RoundedBox } from '@react-three/drei'
import { DoubleSide } from 'three'

import Interactive from '@components/three/Interactive'

import { useSceneStore } from '@store/useSceneStore'

import { roomLayout as L } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { site } from '@constants/site'
import type { LampId } from '@interfaces/section'
import { audio } from '@utils/audio'

import { clay } from '../materials'
import WindowSky from '../objects/WindowSky'
import OfficeChair from './OfficeChair'

type V3 = readonly [number, number, number]

const Box = ({
  args,
  position,
  color,
  radius = 0.06,
  rotationY = 0,
}: {
  args: V3
  position: V3
  color: string
  radius?: number
  rotationY?: number
}) => (
  <RoundedBox
    args={[...args]}
    radius={Math.min(radius, Math.min(...args) / 2 - 0.001)}
    position={[...position]}
    rotation={[0, rotationY, 0]}
    castShadow
    receiveShadow
  >
    <meshStandardMaterial {...clay(color)} />
  </RoundedBox>
)

/** A table lamp the visitor can switch on and off (on by default at night). */
function Lamp({ id, scale = 1 }: { id: LampId; scale?: number }) {
  const s = scale
  const on = useSceneStore((state) => state.lampsOn[id])
  const toggle = () => {
    useSceneStore.getState().toggleLamp(id)
    audio.playSfx('switch')
  }
  return (
    <group position={[...L[id].position]}>
      <Interactive
        id={id}
        label={on ? 'Lamp: on' : 'Lamp: off'}
        hitSize={[0.5 * s, 0.85 * s, 0.5 * s]}
        hitOffset={[0, 0.42 * s, 0]}
        labelHeight={1.0 * s}
        alwaysLabelOnTouch={false}
        onActivate={toggle}
      >
        <mesh position={[0, 0.02 * s, 0]}>
          <cylinderGeometry args={[0.14 * s, 0.16 * s, 0.04 * s, 16]} />
          <meshStandardMaterial {...clay(palette.woodDark)} />
        </mesh>
        <mesh position={[0, 0.3 * s, 0]}>
          <cylinderGeometry args={[0.03 * s, 0.03 * s, 0.56 * s, 8]} />
          <meshStandardMaterial {...clay(palette.woodDark)} />
        </mesh>
        <mesh
          position={[0, 0.66 * s, 0]}
          name="lampShade"
          userData={{ noHighlight: true, lampId: id }}
        >
          <cylinderGeometry
            args={[0.16 * s, 0.24 * s, 0.26 * s, 16, 1, true]}
          />
          <meshStandardMaterial
            {...clay(palette.peach)}
            side={DoubleSide}
            emissive={palette.lampGlow}
            emissiveIntensity={0}
          />
        </mesh>
        <pointLight
          name="lampLight"
          userData={{ lampId: id }}
          position={[0, 0.6 * s, 0]}
          intensity={0}
          distance={4}
          color={palette.lampGlow}
        />
      </Interactive>
    </group>
  )
}

export default function Decor() {
  const {
    bed,
    nightstand: ns,
    desk,
    sideTable: st,
    rug,
    door,
    beanbag,
    plant,
    mug,
  } = L
  return (
    <group>
      <WindowSky />
      {/* The pillow is at the bed's local back (-z); turning the bed moves the head. */}
      <group position={[...bed.position]} rotation={[0, bed.rotationY ?? 0, 0]}>
        <Box
          args={bed.size!}
          position={[0, bed.size![1] / 2, 0]}
          color={palette.wood}
        />
        <Box
          args={[2.0, 0.3, 3.2]}
          position={[0, 0.75, 0]}
          color={palette.cream}
          radius={0.12}
        />
        <Box
          args={[1.6, 0.2, 0.6]}
          position={[0, 0.98, -1.2]}
          color={palette.peach}
          radius={0.09}
        />
        <Box
          args={[2.0, 0.16, 2.0]}
          position={[0, 0.95, 0.5]}
          color={palette.sky}
          radius={0.07}
        />
      </group>
      <Box
        args={ns.size!}
        position={[ns.position[0], ns.size![1] / 2, ns.position[2]]}
        rotationY={ns.rotationY}
        color={palette.woodDark}
      />
      <Lamp id="bedside-lamp" />
      <Lamp id="desk-lamp" scale={0.7} />
      <OfficeChair />
      <group
        position={[...desk.position]}
        rotation={[0, desk.rotationY ?? 0, 0]}
      >
        <Box
          args={[desk.size![0], 0.1, desk.size![2]]}
          position={[0, desk.size![1] - 0.05, 0]}
          color={palette.wood}
        />
        {[-1, 1].map((sx) => (
          <Box
            key={sx}
            args={[0.12, desk.size![1] - 0.1, desk.size![2] - 0.2]}
            position={[
              sx * (desk.size![0] / 2 - 0.1),
              (desk.size![1] - 0.1) / 2,
              0,
            ]}
            color={palette.woodDark}
            radius={0.04}
          />
        ))}
      </group>
      <Box
        args={st.size!}
        position={[st.position[0], st.size![1] / 2, st.position[2]]}
        rotationY={st.rotationY}
        color={palette.woodDark}
      />
      <group
        position={[...mug.position]}
        rotation={[0, mug.rotationY ?? 0, 0]}
        name="mug"
      >
        <mesh castShadow position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.09, 0.08, 0.18, 16]} />
          <meshStandardMaterial {...clay(palette.mint)} />
        </mesh>
        <mesh position={[0.11, 0.1, 0]}>
          <torusGeometry args={[0.05, 0.015, 8, 16]} />
          <meshStandardMaterial {...clay(palette.mint)} />
        </mesh>
      </group>
      <RoundedBox
        args={[...rug.size!]}
        radius={0.02}
        position={[...rug.position]}
        receiveShadow
      >
        <meshStandardMaterial {...clay(palette.rugMint)} />
      </RoundedBox>
      <mesh
        position={[beanbag.position[0], 0.35, beanbag.position[2]]}
        scale={[1, 0.7, 1]}
        castShadow
      >
        <sphereGeometry args={[0.6, 24, 16]} />
        <meshStandardMaterial {...clay(palette.lavender)} />
      </mesh>
      <group position={[...plant.position]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.22, 0.5, 16]} />
          <meshStandardMaterial {...clay(palette.peach)} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos(i * 2.1) * 0.15,
              0.8 + i * 0.1,
              Math.sin(i * 2.1) * 0.15,
            ]}
            castShadow
          >
            <sphereGeometry args={[0.28, 16, 12]} />
            <meshStandardMaterial {...clay(palette.mint)} />
          </mesh>
        ))}
      </group>
      <Box
        args={door.size!}
        position={[door.position[0], door.size![1] / 2, door.position[2]]}
        color={palette.woodDark}
        radius={0.04}
      />
      <mesh position={[door.position[0] + 0.45, 1.3, door.position[2] + 0.08]}>
        <sphereGeometry args={[0.06, 12, 8]} />
        <meshStandardMaterial
          color={palette.brass}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      <Html
        transform
        zIndexRange={[10, 0]}
        position={[door.position[0], 2.0, door.position[2] + 0.07]}
        scale={0.25}
        style={{ pointerEvents: 'none' }}
      >
        <div className="stitched bg-paper font-display text-ink rounded-md px-3 py-1 text-lg font-extrabold">
          {site.shortName}&rsquo;s Room
        </div>
      </Html>
    </group>
  )
}
