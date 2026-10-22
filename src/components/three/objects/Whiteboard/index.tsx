'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import type { Vec3 } from '@interfaces/section'
import { openFromScene } from '@utils/history'

const BOARD = { width: 1.0, height: 0.7, y: 0.95 } as const
const LEG_X = BOARD.width / 2 - 0.03

// Sticky notes: [x, y, tilt, colour]. A few marker lines on each read as notes.
const NOTES: readonly [number, number, number, string][] = [
  [-0.32, 1.13, 0.08, palette.peach],
  [-0.07, 1.15, -0.05, palette.mint],
  [0.2, 1.11, 0.06, palette.sky],
  [-0.24, 0.85, -0.07, palette.lavender],
  [0.04, 0.83, 0.05, palette.tankYellow],
  [0.31, 0.86, -0.04, palette.nose],
]
// Scribbles on a note: [width, y offset].
const SCRIBBLES: readonly [number, number][] = [
  [0.11, 0.035],
  [0.08, 0.0],
  [0.1, -0.035],
]

function Note({ at }: { at: (typeof NOTES)[number] }) {
  const [x, y, tilt, color] = at
  return (
    <group position={[x, y, 0.024]} rotation={[0, 0, tilt]}>
      <mesh>
        <boxGeometry args={[0.17, 0.17, 0.006]} />
        <meshStandardMaterial {...clay(color)} />
      </mesh>
      {SCRIBBLES.map(([w, dy]) => (
        <mesh
          key={dy}
          position={[0, dy, 0.0035]}
          userData={{ noHighlight: true }}
        >
          <planeGeometry args={[w, 0.012]} />
          <meshStandardMaterial {...clay(palette.ink)} />
        </mesh>
      ))}
    </group>
  )
}

function Wheel({ at }: { at: Vec3 }) {
  return (
    <mesh position={[...at]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
      <meshStandardMaterial {...clay(palette.chairFrame)} />
    </mesh>
  )
}

/** Projects: a rolling whiteboard covered in sticky notes, beside the printer. */
export default function Whiteboard() {
  const p = roomLayout.whiteboard
  return (
    <group position={[...p.position]} rotation={[0, p.rotationY ?? 0, 0]}>
      <Interactive
        id="whiteboard"
        label="Projects"
        hitSize={[1.1, 1.45, 0.55]}
        hitOffset={[0, 0.72, 0]}
        labelHeight={1.6}
        // On phones, tuck the tag below Work experience and left of Hiking.
        touchLabelOffset={[-1.2, -0.45, -0.4]}
        onActivate={() => openFromScene('projects')}
      >
        {/* wheeled base: two feet, four casters */}
        {[-LEG_X, LEG_X].map((x) => (
          <group key={x}>
            <RoundedBox
              args={[0.06, 0.04, 0.5]}
              radius={0.015}
              position={[x, 0.07, 0]}
              castShadow
            >
              <meshStandardMaterial {...clay(palette.chairMesh)} />
            </RoundedBox>
            <Wheel at={[x, 0.035, 0.21]} />
            <Wheel at={[x, 0.035, -0.21]} />
            <mesh position={[x, 0.72, 0]} castShadow>
              <cylinderGeometry args={[0.018, 0.018, 1.3, 8]} />
              <meshStandardMaterial {...clay(palette.chairMesh)} />
            </mesh>
          </group>
        ))}
        {/* the board in a thin grey frame */}
        <RoundedBox
          args={[BOARD.width + 0.06, BOARD.height + 0.06, 0.03]}
          radius={0.012}
          position={[0, BOARD.y, -0.006]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.chairMesh)} />
        </RoundedBox>
        <mesh position={[0, BOARD.y, 0.0105]}>
          <boxGeometry args={[BOARD.width, BOARD.height, 0.01]} />
          <meshStandardMaterial {...clay(palette.paper)} />
        </mesh>
        {/* a marker-written title along the top */}
        {[
          [-0.36, 0.13],
          [-0.2, 0.1],
        ].map(([x, w]) => (
          <mesh
            key={x}
            position={[x, BOARD.y + BOARD.height / 2 - 0.05, 0.0165]}
            userData={{ noHighlight: true }}
          >
            <planeGeometry args={[w, 0.018]} />
            <meshStandardMaterial {...clay(palette.screenGlow)} />
          </mesh>
        ))}
        {NOTES.map((n) => (
          <Note key={`${n[0]},${n[1]}`} at={n} />
        ))}
        {/* marker tray with two markers */}
        <mesh position={[0, BOARD.y - BOARD.height / 2 - 0.03, 0.04]}>
          <boxGeometry args={[0.6, 0.02, 0.07]} />
          <meshStandardMaterial {...clay(palette.chairMesh)} />
        </mesh>
        {[
          [-0.12, palette.terracotta],
          [0.06, palette.screenGlow],
        ].map(([x, color]) => (
          <mesh
            key={x}
            position={[x as number, BOARD.y - BOARD.height / 2 - 0.008, 0.045]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.012, 0.012, 0.13, 8]} />
            <meshStandardMaterial {...clay(color as string)} />
          </mesh>
        ))}
      </Interactive>
    </group>
  )
}
