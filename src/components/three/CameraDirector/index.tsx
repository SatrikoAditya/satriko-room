'use client'

import { useCallback, useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import CameraControlsImpl from 'camera-controls'
import { Box3, Vector3 } from 'three'

import { useRoomStore } from '@store/useRoomStore'

import {
  CAMERA_SMOOTH_TIME,
  DEFAULT_CAMERA_OFFSET,
  DEFAULT_CAMERA_TARGET,
  ENTER_SWOOP_OFFSET,
  MOBILE_ZOOM_FACTOR,
  POLAR_MAX,
  POLAR_MIN,
  VIEW_MAX_ZOOM,
} from '@constants/camera'
import { sectionBySlug } from '@constants/sections'
import type { SectionSlug } from '@interfaces/section'
import { currentSlug } from '@utils/history'
import { objectScreenRect } from '@utils/projectRect'

import { useSceneBridge } from '../SceneCanvas/SceneBridge'
import { fitIsometric, lookAtArgs } from './cameraMath'
import type { Home } from './freeView'
import { useFreeView, type ViewFrame } from './useFreeView'

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
const NO_TILT = { x: 0, y: 0 }

export default function CameraDirector() {
  const controls = useRef<CameraControlsImpl>(null)
  const { reducedMotion, coarsePointer } = useSceneBridge()
  const { camera, size, scene } = useThree()
  const fittedZoom = useRef(60)
  const home = useRef<Home>({
    target: DEFAULT_CAMERA_TARGET,
    offset: DEFAULT_CAMERA_OFFSET,
  })
  // True while an animated glide (enter, return) owns the camera.
  const gliding = useRef(false)
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

  // Free view: 1× to VIEW_MAX_ZOOM. Focus poses need headroom (zoomFactor up to ~2.8).
  const limitZoom = useCallback((wide: boolean) => {
    const c = controls.current
    if (!c) return
    c.minZoom = fittedZoom.current * (wide ? 0.9 : 0.999)
    c.maxZoom = fittedZoom.current * (wide ? 4 : VIEW_MAX_ZOOM * 1.001)
  }, [])

  const frame = useCallback(
    (): ViewFrame => ({
      home: home.current,
      baseZoom: fittedZoom.current,
      half: {
        x: size.width / (2 * fittedZoom.current),
        y: size.height / (2 * fittedZoom.current),
      },
    }),
    [size.width, size.height],
  )

  // The room with no panel open, once any glide has finished.
  const isActive = useCallback(() => {
    const s = useRoomStore.getState()
    return (
      !gliding.current &&
      s.phase === 'ready' &&
      s.transition === 'idle' &&
      currentSlug() === null
    )
  }, [])

  const freeView = useFreeView({ isActive, frame, reducedMotion })

  // Glide to the saved free view: where the visitor was before a panel, or 1× after a reset.
  const glideToView = useCallback(
    (animate: boolean, stillCurrent: () => boolean) => {
      const c = controls.current
      if (!c) return
      gliding.current = true
      const { args, zoom } = freeView.target()
      return Promise.all([
        Promise.resolve(c.setLookAt(...args, animate)),
        Promise.resolve(c.zoomTo(zoom, animate)),
      ]).then(() => {
        if (!stillCurrent()) return
        limitZoom(false)
        freeView.settle()
        gliding.current = false
      })
    },
    [freeView, limitZoom],
  )

  const applyPose = useCallback(
    (slug: SectionSlug, animate: boolean) => {
      const c = controls.current
      if (!c) return Promise.resolve()
      const pose = sectionBySlug(slug).cameraPose
      limitZoom(true)
      return Promise.all([
        Promise.resolve(
          c.setLookAt(...lookAtArgs(pose.target, pose.offset), animate),
        ),
        Promise.resolve(
          c.zoomTo(fittedZoom.current * pose.zoomFactor, animate),
        ),
      ])
    },
    [limitZoom],
  )

  // camera-controls only animates glides; wheel, drag and pinch go through useFreeView.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    c.smoothTime = CAMERA_SMOOTH_TIME
    c.mouseButtons.left = ACTION.NONE
    c.mouseButtons.middle = ACTION.NONE
    c.mouseButtons.right = ACTION.NONE
    c.mouseButtons.wheel = ACTION.NONE
    c.touches.one = ACTION.NONE
    c.touches.two = ACTION.NONE
    c.touches.three = ACTION.NONE
    c.minAzimuthAngle = -Infinity
    c.maxAzimuthAngle = Infinity
    c.minPolarAngle = POLAR_MIN
    c.maxPolarAngle = POLAR_MAX
    c.setBoundary(ROOM_BOX)
  }, [])

  // Default framing on mount and resize; a direct link snaps to its object instead.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const { args, zoom } = computeFit()
    fittedZoom.current = zoom * (coarsePointer ? MOBILE_ZOOM_FACTOR : 1)
    home.current = {
      target: [args[3], args[4], args[5]],
      offset: [args[0] - args[3], args[1] - args[4], args[2] - args[5]],
    }
    const slug = currentSlug()
    if (slug) {
      applyPose(slug, false)
      return
    }
    limitZoom(false)
    const view = freeView.target()
    c.setLookAt(...view.args, false)
    c.zoomTo(view.zoom, false)
    freeView.settle()
  }, [computeFit, coarsePointer, applyPose, limitZoom, freeView])

  // Enter swoop, focus glide, return.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const mine = ++token.current
    const animate = !reducedMotion
    const slug = currentSlug()
    const stillCurrent = () => mine === token.current

    if (phase === 'entering') {
      c.setLookAt(...lookAtArgs(home.current.target, ENTER_SWOOP_OFFSET), false)
      freeView.reset()
      glideToView(animate, stillCurrent)?.then(() => {
        if (stillCurrent()) useRoomStore.getState().setPhase('ready')
      })
      return
    }
    if (transition === 'focusing' && slug) {
      applyPose(slug, animate).then(() => {
        if (!stillCurrent()) return
        const target = scene.getObjectByName(sectionBySlug(slug).objectId)
        const s = useRoomStore.getState()
        s.setOriginRect(
          target
            ? objectScreenRect(target, camera, size.width, size.height)
            : null,
        )
        s.setTransition('open')
      })
      return
    }
    // Start the return as soon as the panel begins closing; it keeps gliding through 'idle'.
    if (
      (transition === 'idle' || transition === 'closing') &&
      slug === null &&
      phase === 'ready'
    )
      glideToView(animate, stillCurrent)
  }, [
    phase,
    transition,
    reducedMotion,
    glideToView,
    applyPose,
    freeView,
    camera,
    scene,
    size.width,
    size.height,
  ])

  // Free view: zoom, slide and the mouse-follow tilt (desktop only), eased every frame.
  useFrame((state, dt) => {
    const c = controls.current
    if (!c || !isActive()) return
    const move = freeView.step(
      dt,
      coarsePointer || reducedMotion ? NO_TILT : state.pointer,
    )
    if (!move) return
    c.setLookAt(...move.args, false)
    c.zoomTo(move.zoom, false)
  })

  return <CameraControls ref={controls} makeDefault />
}
