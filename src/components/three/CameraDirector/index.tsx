'use client'

import { useCallback, useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import CameraControlsImpl from 'camera-controls'
import { Box3, Vector3 } from 'three'

import { useRoomStore } from '@store/useRoomStore'

import {
  AZIMUTH_LIMIT,
  CAMERA_SMOOTH_TIME,
  DEFAULT_CAMERA_OFFSET,
  DEFAULT_CAMERA_TARGET,
  ENTER_SWOOP_OFFSET,
  MOBILE_ZOOM_FACTOR,
  PARALLAX_AZIMUTH,
  PARALLAX_POLAR,
  POLAR_MAX,
  POLAR_MIN,
} from '@constants/camera'
import { sectionBySlug } from '@constants/sections'
import type { SectionSlug } from '@interfaces/section'
import { currentSlug } from '@utils/history'
import { objectScreenRect } from '@utils/projectRect'

import { useSceneBridge } from '../SceneCanvas/SceneBridge'
import { fitIsometric, lookAtArgs } from './cameraMath'

const { ACTION } = CameraControlsImpl
const ROOM_BOX = new Box3(
  new Vector3(-5.5, -0.9, -5.5),
  new Vector3(5.5, 6, 5.5),
)
const PADDING = {
  paddingTop: 0.4,
  paddingBottom: 0.2,
  paddingLeft: 0.3,
  paddingRight: 0.3,
}

export default function CameraDirector() {
  const controls = useRef<CameraControlsImpl>(null)
  const { reducedMotion, coarsePointer } = useSceneBridge()
  const { camera, size, scene } = useThree()
  const fittedZoom = useRef(60)
  const defaultAngles = useRef({ azimuth: Math.PI / 4, polar: 1.0 })
  const token = useRef(0)
  const phase = useRoomStore((s) => s.phase)
  const transition = useRoomStore((s) => s.transition)

  // camera-controls' fitToBox snaps the view to an axis, so the isometric fit is computed here.
  const computeFit = useCallback(
    () =>
      fitIsometric(
        ROOM_BOX,
        DEFAULT_CAMERA_TARGET,
        DEFAULT_CAMERA_OFFSET,
        size.width,
        size.height,
        PADDING,
      ),
    [size.width, size.height],
  )

  // Pinch range in the room is narrow; focus poses need headroom (zoomFactor up to ~2.6).
  const limitZoom = useCallback((wide: boolean) => {
    const c = controls.current
    if (!c) return
    c.minZoom = fittedZoom.current * 0.9
    c.maxZoom = fittedZoom.current * (wide ? 4 : 1.6)
  }, [])

  // Touch rotate/pinch only in the room view; locked while a section is focused.
  const setTouchLocked = useCallback(
    (locked: boolean) => {
      const c = controls.current
      if (!c) return
      c.touches.one =
        coarsePointer && !locked ? ACTION.TOUCH_ROTATE : ACTION.NONE
      c.touches.two =
        coarsePointer && !locked ? ACTION.TOUCH_ZOOM_TRUCK : ACTION.NONE
      c.touches.three = ACTION.NONE
    },
    [coarsePointer],
  )

  const fitDefault = useCallback(
    (animate: boolean, stillCurrent: () => boolean) => {
      const c = controls.current
      if (!c) return
      const { args, zoom } = computeFit()
      c.setLookAt(...args, animate)
      return Promise.resolve(
        c.zoomTo(zoom * (coarsePointer ? MOBILE_ZOOM_FACTOR : 1), animate),
      ).then(() => {
        if (!stillCurrent()) return
        limitZoom(false)
        setTouchLocked(false)
      })
    },
    [computeFit, coarsePointer, limitZoom, setTouchLocked],
  )

  const applyPose = useCallback(
    (slug: SectionSlug, animate: boolean) => {
      const c = controls.current
      if (!c) return Promise.resolve()
      const pose = sectionBySlug(slug).cameraPose
      limitZoom(true)
      setTouchLocked(true)
      return Promise.all([
        Promise.resolve(
          c.setLookAt(...lookAtArgs(pose.target, pose.offset), animate),
        ),
        Promise.resolve(
          c.zoomTo(fittedZoom.current * pose.zoomFactor, animate),
        ),
      ])
    },
    [limitZoom, setTouchLocked],
  )

  // Input: desktop has no drag/zoom (parallax only); touch gets clamped rotate + pinch zoom.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    c.smoothTime = CAMERA_SMOOTH_TIME
    c.mouseButtons.left = ACTION.NONE
    c.mouseButtons.middle = ACTION.NONE
    c.mouseButtons.right = ACTION.NONE
    c.mouseButtons.wheel = ACTION.NONE
    setTouchLocked(currentSlug() !== null)
    c.setBoundary(ROOM_BOX)
  }, [setTouchLocked])

  // Default framing on mount and resize; then record the fitted zoom and set limits.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const { args, zoom } = computeFit()
    fittedZoom.current = zoom * (coarsePointer ? MOBILE_ZOOM_FACTOR : 1)
    c.setLookAt(...args, false)
    c.zoomTo(fittedZoom.current, false)
    defaultAngles.current = { azimuth: c.azimuthAngle, polar: c.polarAngle }
    c.minAzimuthAngle = c.azimuthAngle - AZIMUTH_LIMIT
    c.maxAzimuthAngle = c.azimuthAngle + AZIMUTH_LIMIT
    c.minPolarAngle = POLAR_MIN
    c.maxPolarAngle = POLAR_MAX
    limitZoom(false)
    const slug = currentSlug()
    if (slug) applyPose(slug, false) // direct link: snap to the object
  }, [computeFit, coarsePointer, applyPose, limitZoom])

  // Enter swoop, focus glide, return.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const mine = ++token.current
    const animate = !reducedMotion
    const slug = currentSlug()
    const done = (fn: () => void) => {
      if (mine === token.current) fn()
    }

    if (phase === 'entering') {
      c.setLookAt(
        ...lookAtArgs(DEFAULT_CAMERA_TARGET, ENTER_SWOOP_OFFSET),
        false,
      )
      fitDefault(animate, () => mine === token.current)?.then(() =>
        done(() => useRoomStore.getState().setPhase('ready')),
      )
      return
    }
    if (transition === 'focusing' && slug) {
      applyPose(slug, animate).then(() =>
        done(() => {
          const target = scene.getObjectByName(sectionBySlug(slug).objectId)
          const s = useRoomStore.getState()
          s.setOriginRect(
            target
              ? objectScreenRect(target, camera, size.width, size.height)
              : null,
          )
          s.setTransition('open')
        }),
      )
      return
    }
    // Start the return as soon as the panel begins closing; it keeps gliding through 'idle'.
    if (
      (transition === 'idle' || transition === 'closing') &&
      slug === null &&
      phase === 'ready'
    )
      fitDefault(animate, () => mine === token.current)
  }, [
    phase,
    transition,
    reducedMotion,
    fitDefault,
    applyPose,
    camera,
    scene,
    size.width,
    size.height,
  ])

  // Desktop parallax while idle in the room.
  useFrame((state) => {
    const c = controls.current
    if (!c || coarsePointer || reducedMotion) return
    const s = useRoomStore.getState()
    if (
      s.phase !== 'ready' ||
      s.transition !== 'idle' ||
      currentSlug() !== null
    )
      return
    const { azimuth, polar } = defaultAngles.current
    c.rotateTo(
      azimuth + state.pointer.x * PARALLAX_AZIMUTH,
      polar - state.pointer.y * PARALLAX_POLAR,
      true,
    )
  })

  return <CameraControls ref={controls} makeDefault />
}
