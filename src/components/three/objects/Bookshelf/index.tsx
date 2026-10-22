'use client'

import { RoundedBox } from '@react-three/drei'

import Interactive from '@components/three/Interactive'
import { clay } from '@components/three/materials'

import { roomLayout } from '@constants/roomLayout'
import { palette } from '@constants/roomPalette'
import { skillShelves } from '@content/skills'
import { openFromScene } from '@utils/history'

const shelfColor: Record<string, string> = {
  peach: palette.peach,
  sky: palette.sky,
  mint: palette.mint,
  lavender: palette.lavender,
  wood: palette.wood,
}
const ROWS = 4,
  W = 1.6,
  H = 2.6,
  D = 0.5,
  ROW_H = (H - 0.1) / ROWS

export default function Bookshelf() {
  const p = roomLayout.bookshelf
  return (
    <group position={[...p.position]} rotation={[0, p.rotationY ?? 0, 0]}>
      <Interactive
        id="bookshelf"
        label="Skills"
        hitSize={[W + 0.2, H, D + 0.3]}
        hitOffset={[0, H / 2, 0.1]}
        labelHeight={H + 0.35}
        touchLabelOffset={[0.6, -1.35, 0]}
        onActivate={() => openFromScene('skills')}
      >
        <RoundedBox
          args={[W, H, D]}
          radius={0.04}
          position={[0, H / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial {...clay(palette.woodDark)} />
        </RoundedBox>
        {Array.from({ length: ROWS }, (_, row) => {
          const shelf = skillShelves[row + 1] ?? skillShelves[0]
          const y = 0.08 + row * ROW_H
          let x = -W / 2 + 0.12
          return (
            <group key={row}>
              <mesh position={[0, y, 0.05]}>
                <boxGeometry args={[W - 0.08, 0.04, D - 0.06]} />
                <meshStandardMaterial {...clay(palette.wood)} />
              </mesh>
              {shelf.skills.map((skill, i) => {
                const w = 0.09 + ((i * 7) % 5) * 0.012,
                  h = 0.26 + ((i * 3) % 4) * 0.03
                const cx = x + w / 2
                x += w + 0.015
                return (
                  <RoundedBox
                    key={skill}
                    args={[w, h, D - 0.16]}
                    radius={0.015}
                    position={[cx, y + 0.02 + h / 2, 0.1]}
                  >
                    <meshStandardMaterial {...clay(shelfColor[shelf.color])} />
                  </RoundedBox>
                )
              })}
            </group>
          )
        })}
      </Interactive>
    </group>
  )
}
