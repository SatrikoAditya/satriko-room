import { OrthographicCamera, Vector3, type Box3 } from 'three'

import type { Vec3 } from '@interfaces/section'

export function lookAtArgs(
  target: Vec3,
  offset: Vec3,
): [number, number, number, number, number, number] {
  return [
    target[0] + offset[0],
    target[1] + offset[1],
    target[2] + offset[2],
    target[0],
    target[1],
    target[2],
  ]
}

export interface FitPadding {
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
}

/**
 * Fit a box in an orthographic view that keeps the given look direction.
 * (camera-controls' fitToBox snaps the view to the nearest axis, which would
 * destroy the isometric angle.) Returns the look-at args, shifted so the box
 * is centred on screen, and the zoom at which it fills the viewport.
 */
export function fitIsometric(
  box: Box3,
  target: Vec3,
  offset: Vec3,
  width: number,
  height: number,
  padding: FitPadding,
): { args: ReturnType<typeof lookAtArgs>; zoom: number } {
  const cam = new OrthographicCamera()
  const [px, py, pz, tx, ty, tz] = lookAtArgs(target, offset)
  cam.position.set(px, py, pz)
  cam.lookAt(tx, ty, tz)
  cam.updateMatrixWorld(true)
  const inverse = cam.matrixWorldInverse
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const x of [box.min.x, box.max.x])
    for (const y of [box.min.y, box.max.y])
      for (const z of [box.min.z, box.max.z]) {
        const v = new Vector3(x, y, z).applyMatrix4(inverse)
        minX = Math.min(minX, v.x)
        maxX = Math.max(maxX, v.x)
        minY = Math.min(minY, v.y)
        maxY = Math.max(maxY, v.y)
      }
  minX -= padding.paddingLeft
  maxX += padding.paddingRight
  minY -= padding.paddingBottom
  maxY += padding.paddingTop
  const zoom = Math.min(width / (maxX - minX), height / (maxY - minY))
  const right = new Vector3().setFromMatrixColumn(cam.matrixWorld, 0)
  const up = new Vector3().setFromMatrixColumn(cam.matrixWorld, 1)
  const shift = right
    .multiplyScalar((minX + maxX) / 2)
    .add(up.multiplyScalar((minY + maxY) / 2))
  return {
    args: [
      px + shift.x,
      py + shift.y,
      pz + shift.z,
      tx + shift.x,
      ty + shift.y,
      tz + shift.z,
    ],
    zoom,
  }
}
