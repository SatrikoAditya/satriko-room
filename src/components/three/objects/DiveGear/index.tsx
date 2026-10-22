'use client'

import { RoundedBox } from '@react-three/drei'
import { CatmullRomCurve3, Shape, Vector3 } from 'three'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import type { Vec3 } from '@interfaces/section'
import { openFromScene } from '@utils/history'

import Bubbles from './Bubbles'

// A scuba tank with the mask hung on its neck, the snorkel clipped to the
// mask and the fins leaning on its left side, where the printer table doesn't
// hide them. Local +z faces the camera.
const R = 0.14
const BODY_BOTTOM = 0.06
const BODY_TOP = 0.74

const curve = (points: Vec3[]) =>
  new CatmullRomCurve3(points.map((p) => new Vector3(...p)))

// From the mask's sides, round the back of the tank's neck.
const STRAP = curve([
  [-0.125, 0.7, 0.17],
  [-0.09, 0.84, 0.05],
  [0, 0.9, -0.055],
  [0.09, 0.84, 0.05],
  [0.125, 0.7, 0.17],
])
// From the first stage down the front right to the regulator.
const HOSE = curve([
  [0.11, 0.9, 0.02],
  [0.18, 0.84, 0.07],
  [0.2, 0.72, 0.13],
  [0.17, 0.63, 0.19],
])
// A J up the mask's left side, its mouthpiece curling forward under the mask.
const SNORKEL = curve([
  [-0.165, 1.03, 0.05],
  [-0.168, 0.82, 0.08],
  [-0.16, 0.66, 0.13],
  [-0.14, 0.6, 0.19],
  [-0.115, 0.625, 0.235],
])
const REGULATOR: Vec3 = [0.16, 0.585, 0.205]

// Narrow at the foot pocket, wide and rounded at the tip.
const BLADE = new Shape()
BLADE.moveTo(-0.06, 0.1)
BLADE.lineTo(-0.1, 0.48)
BLADE.quadraticCurveTo(0, 0.62, 0.1, 0.48)
BLADE.lineTo(0.06, 0.1)
BLADE.closePath()
const BLADE_DEPTH = 0.016
const BLADE_EXTRUDE = {
  depth: BLADE_DEPTH,
  bevelEnabled: true,
  bevelThickness: 0.008,
  bevelSize: 0.008,
  bevelSegments: 2,
  curveSegments: 12,
}

// Each fin stands on its foot pocket. The front one leans its tip on the tank;
// the back one stands straighter, so the two fan out and both blades show.
const FINS: { base: Vec3; lean: number; turn: number }[] = [
  { base: [-0.5, 0, -0.06], lean: -0.16, turn: -0.2 },
  { base: [-0.38, 0, 0.06], lean: -0.36, turn: 0.15 },
]

function Fin({ base, lean, turn }: { base: Vec3; lean: number; turn: number }) {
  return (
    <group position={[...base]} rotation={[0, 0, lean]}>
      <group rotation={[0, turn, 0]}>
        <RoundedBox
          args={[0.13, 0.16, 0.07]}
          radius={0.03}
          position={[0, 0.08, 0]}
          castShadow
        >
          <meshStandardMaterial {...clay(palette.ink)} />
        </RoundedBox>
        <mesh position={[0, 0, -BLADE_DEPTH / 2]} castShadow>
          <extrudeGeometry args={[BLADE, BLADE_EXTRUDE]} />
          <meshStandardMaterial {...clay(palette.mint)} />
        </mesh>
      </group>
    </group>
  )
}

function Tank() {
  return (
    <>
      {/* rubber boot */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[R + 0.015, R + 0.02, 0.1, 24]} />
        <meshStandardMaterial {...clay(palette.chairFrame)} />
      </mesh>
      <mesh position={[0, (BODY_BOTTOM + BODY_TOP) / 2, 0]} castShadow>
        <cylinderGeometry args={[R, R, BODY_TOP - BODY_BOTTOM, 24]} />
        <meshStandardMaterial {...clay(palette.tankYellow)} />
      </mesh>
      <mesh position={[0, BODY_TOP, 0]} castShadow>
        <sphereGeometry args={[R, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...clay(palette.tankYellow)} />
      </mesh>
      {/* white band */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[R + 0.004, R + 0.004, 0.06, 24]} />
        <meshStandardMaterial {...clay(palette.paper)} />
      </mesh>
      {/* valve, knob and first stage */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.04, 0.045, 0.08, 12]} />
        <meshStandardMaterial {...clay(palette.chairMesh)} />
      </mesh>
      <mesh position={[0, 0.955, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.03, 16]} />
        <meshStandardMaterial {...clay(palette.chairFrame)} />
      </mesh>
      <RoundedBox
        args={[0.08, 0.075, 0.075]}
        radius={0.025}
        position={[0.075, 0.9, 0.01]}
      >
        <meshStandardMaterial {...clay(palette.chairFrame)} />
      </RoundedBox>
      <mesh>
        <tubeGeometry args={[HOSE, 24, 0.014, 8, false]} />
        <meshStandardMaterial {...clay(palette.chairFrame)} />
      </mesh>
      <group position={[...REGULATOR]}>
        <RoundedBox args={[0.09, 0.09, 0.06]} radius={0.025}>
          <meshStandardMaterial {...clay(palette.chairFrame)} />
        </RoundedBox>
        <mesh position={[0, 0, 0.031]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.01, 16]} />
          <meshStandardMaterial {...clay(palette.chairMesh)} />
        </mesh>
      </group>
    </>
  )
}

function MaskAndSnorkel() {
  return (
    <>
      {/* hung on the neck, its face tipped up a little */}
      <group position={[0, 0.7, R + 0.035]} rotation={[-0.2, 0, 0]}>
        <RoundedBox args={[0.25, 0.14, 0.06]} radius={0.03}>
          <meshStandardMaterial {...clay(palette.ink)} />
        </RoundedBox>
        {[-0.055, 0.055].map((x) => (
          <RoundedBox
            key={x}
            args={[0.095, 0.085, 0.012]}
            radius={0.005}
            position={[x, 0.012, 0.031]}
            userData={{ noHighlight: true }}
          >
            <meshStandardMaterial color={palette.sky} roughness={0.2} />
          </RoundedBox>
        ))}
        <RoundedBox
          args={[0.07, 0.05, 0.05]}
          radius={0.02}
          position={[0, -0.05, 0.03]}
        >
          <meshStandardMaterial {...clay(palette.ink)} />
        </RoundedBox>
      </group>
      <mesh>
        <tubeGeometry args={[STRAP, 32, 0.012, 6, false]} />
        <meshStandardMaterial {...clay(palette.ink)} />
      </mesh>
      <mesh castShadow>
        <tubeGeometry args={[SNORKEL, 32, 0.016, 8, false]} />
        <meshStandardMaterial {...clay(palette.mint)} />
      </mesh>
      <mesh position={[-0.165, 1.04, 0.05]}>
        <cylinderGeometry args={[0.022, 0.022, 0.03, 12]} />
        <meshStandardMaterial {...clay(palette.orange)} />
      </mesh>
      <RoundedBox
        args={[0.05, 0.035, 0.03]}
        radius={0.01}
        position={[-0.11, 0.63, 0.245]}
      >
        <meshStandardMaterial {...clay(palette.ink)} />
      </RoundedBox>
    </>
  )
}

export default function DiveGear() {
  return (
    <group
      position={[...roomLayout['dive-gear'].position]}
      rotation={[0, roomLayout['dive-gear'].rotationY ?? 0, 0]}
    >
      <Interactive
        id="dive-gear"
        label="Diving"
        hitSize={[0.84, 1.08, 0.48]}
        hitOffset={[-0.17, 0.54, 0.04]}
        // Higher than the backpack's tag beside it, so the two don't overlap on
        // phones, where every tag is always shown.
        labelHeight={2.25}
        onActivate={() => openFromScene('diving')}
      >
        <Tank />
        <MaskAndSnorkel />
        {FINS.map((fin) => (
          <Fin key={fin.base.join()} {...fin} />
        ))}
        <Bubbles
          origin={[REGULATOR[0], REGULATOR[1] + 0.06, REGULATOR[2] + 0.03]}
        />
      </Interactive>
    </group>
  )
}
