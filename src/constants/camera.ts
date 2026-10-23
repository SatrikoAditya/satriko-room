import type { Vec3 } from '@interfaces/section'

export const DEFAULT_CAMERA_TARGET: Vec3 = [0, 1.4, 0]
export const DEFAULT_CAMERA_OFFSET: Vec3 = [10, 8.2, 10]
export const CAMERA_SMOOTH_TIME = 0.35
export const FOCUS_TIMEOUT_MS = 1500
export const ENTER_TIMEOUT_MS = 2500
export const ENTER_SWOOP_OFFSET: Vec3 = [16, 14, 16] // the camera starts further out, then swoops to default
export const MOBILE_ZOOM_FACTOR = 1.5
/**
 * Phones start closer than the full-room fit (MOBILE_ZOOM_FACTOR), so the
 * sides are off-screen: the pan reaches the whole fitted room plus this margin
 * (world units), so the edge objects and their always-on tags can be reached.
 */
export const TOUCH_PAN_MARGIN = { x: 1.4, y: 0.4 } as const
// Polar limits (from straight up) cover every pose: the default view (about 1.05),
// the section focus poses, and the lowered zoomed-in view (about 1.36), plus tilt.
export const POLAR_MIN = 0.7
export const POLAR_MAX = 1.45

// Free view (the room, no panel open): zoom from today's framing (1×) to 2×.
export const VIEW_MAX_ZOOM = 2
/** Camera elevation above the floor plane at full zoom, in radians: low, but still looking a little down onto the furniture. */
export const VIEW_EYE_ELEVATION = (8 * Math.PI) / 180
/** Above this zoom the view counts as zoomed in (drag slides, the reset button shows). */
export const VIEW_ZOOMED_AT = 1.02
/** Wheel zoom per pixel of deltaY; a trackpad pinch (ctrlKey) is faster. */
export const VIEW_WHEEL_SPEED = 0.0015
export const VIEW_PINCH_WHEEL_SPEED = 0.01
/** How long zoom and pan take to settle after input. */
export const VIEW_SMOOTH_SECONDS = 0.25
export const PARALLAX_AZIMUTH = 0.026
export const PARALLAX_POLAR = 0.017
export const CLOSE_TIMEOUT_MS = 1500
