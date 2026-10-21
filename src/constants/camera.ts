import type { Vec3 } from '@interfaces/section'

export const DEFAULT_CAMERA_TARGET: Vec3 = [0, 1.4, 0]
export const DEFAULT_CAMERA_OFFSET: Vec3 = [10, 8.2, 10]
export const CAMERA_SMOOTH_TIME = 0.35
export const FOCUS_TIMEOUT_MS = 1500
export const ENTER_TIMEOUT_MS = 2500
export const ENTER_SWOOP_OFFSET: Vec3 = [16, 14, 16] // the camera starts further out, then swoops to default
export const MOBILE_ZOOM_FACTOR = 1.3
export const AZIMUTH_LIMIT = 0.61 // ±35° around the default view (mobile drag)
export const POLAR_MIN = 0.75
export const POLAR_MAX = 1.25
export const PARALLAX_AZIMUTH = 0.026
export const PARALLAX_POLAR = 0.017
