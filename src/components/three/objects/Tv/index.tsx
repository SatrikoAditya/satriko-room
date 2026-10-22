'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { openFromScene } from '@utils/history'

// The cabinet is wider than the TV, so the console and controllers sit beside
// the screen, not in front of it.
const CABINET = { width: 1.9, height: 0.45, depth: 0.5 } as const
const TV = { width: 1.2, height: 0.8, y: 1.0 } as const

/** A white PS5 standing on its side: a dark core between two white plates. */
function Console() {
  return (
    <group position={[-0.78, CABINET.height, 0.05]}>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.03, 20]} />
        <meshStandardMaterial {...clay(palette.chairFrame)} />
      </mesh>
      <RoundedBox
        args={[0.06, 0.4, 0.26]}
        radius={0.01}
        position={[0, 0.23, 0]}
      >
        <meshStandardMaterial {...clay(palette.chairFrame)} />
      </RoundedBox>
      {[-0.045, 0.045].map((x) => (
        <RoundedBox
          key={x}
          args={[0.03, 0.44, 0.3]}
          radius={0.012}
          position={[x, 0.25, 0]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.paper)} />
        </RoundedBox>
      ))}
    </group>
  )
}

/** A white controller with a dark touchpad, lying on the cabinet. */
function Controller({ x, yaw }: { x: number; yaw: number }) {
  return (
    <group position={[x, CABINET.height, 0.12]} rotation={[0, yaw, 0]}>
      <RoundedBox
        args={[0.2, 0.05, 0.14]}
        radius={0.025}
        position={[0, 0.025, 0]}
      >
        <meshStandardMaterial {...clay(palette.paper)} />
      </RoundedBox>
      <RoundedBox
        args={[0.1, 0.012, 0.06]}
        radius={0.005}
        position={[0, 0.053, -0.015]}
      >
        <meshStandardMaterial {...clay(palette.chairFrame)} />
      </RoundedBox>
    </group>
  )
}

export default function Tv() {
  const p = roomLayout.tv
  const white = clay(palette.paper)
  const dark = clay(palette.chairFrame)
  return (
    <group position={[...p.position]} rotation={[0, p.rotationY ?? 0, 0]}>
      <Interactive
        id="tv"
        label="Gaming"
        hitSize={[2.1, 1.6, 0.8]}
        hitOffset={[0, 0.75, 0.1]}
        labelHeight={1.65}
        onActivate={() => openFromScene('gaming')}
      >
        {/* White low cabinet: two drawer fronts and an open middle shelf. */}
        <RoundedBox
          args={[CABINET.width, CABINET.height, CABINET.depth]}
          radius={0.03}
          position={[0, CABINET.height / 2, 0]}
          castShadow
        >
          <meshStandardMaterial {...white} />
        </RoundedBox>
        <RoundedBox
          args={[0.44, 0.2, 0.42]}
          radius={0.01}
          position={[0, 0.16, 0.05]}
        >
          <meshStandardMaterial {...dark} />
        </RoundedBox>
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} position={[x, 0.17, CABINET.depth / 2 + 0.004]}>
            <boxGeometry args={[0.3, 0.012, 0.008]} />
            <meshStandardMaterial {...dark} />
          </mesh>
        ))}
        {/* Slim TV on two feet, with a soundbar under it. */}
        {[-0.4, 0.4].map((x) => (
          <mesh key={x} position={[x, CABINET.height + 0.06, 0]}>
            <boxGeometry args={[0.16, 0.12, 0.2]} />
            <meshStandardMaterial {...dark} />
          </mesh>
        ))}
        <RoundedBox
          args={[TV.width, TV.height, 0.06]}
          radius={0.02}
          position={[0, TV.y, 0]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.ink)} />
        </RoundedBox>
        <mesh
          name="tvScreen"
          position={[0, TV.y, 0.035]}
          userData={{ noHighlight: true }}
        >
          <planeGeometry args={[TV.width - 0.08, TV.height - 0.08]} />
          <meshStandardMaterial
            color={palette.screen}
            emissive={palette.mint}
            emissiveIntensity={0.35}
            roughness={0.5}
          />
        </mesh>
        <RoundedBox
          args={[0.9, 0.06, 0.1]}
          radius={0.02}
          position={[0, CABINET.height + 0.03, 0.17]}
        >
          <meshStandardMaterial {...dark} />
        </RoundedBox>
        <Console />
        <Controller x={0.68} yaw={0.25} />
        <Controller x={0.84} yaw={-0.35} />
      </Interactive>
    </group>
  )
}
