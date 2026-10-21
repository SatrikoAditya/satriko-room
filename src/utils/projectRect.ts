import { Box3, Vector3, type Camera, type Object3D } from 'three'

import type { Rect } from '@interfaces/ui'

export function ndcPointsToRect(
  points: ReadonlyArray<{ x: number; y: number }>,
  width: number,
  height: number,
): Rect {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    const x = ((p.x + 1) / 2) * width
    const y = ((1 - p.y) / 2) * height
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

export function objectScreenRect(
  object: Object3D,
  camera: Camera,
  width: number,
  height: number,
): Rect {
  const box = new Box3().setFromObject(object)
  const corners: { x: number; y: number }[] = []
  for (const x of [box.min.x, box.max.x])
    for (const y of [box.min.y, box.max.y])
      for (const z of [box.min.z, box.max.z]) {
        const v = new Vector3(x, y, z).project(camera)
        corners.push({ x: v.x, y: v.y })
      }
  return ndcPointsToRect(corners, width, height)
}
