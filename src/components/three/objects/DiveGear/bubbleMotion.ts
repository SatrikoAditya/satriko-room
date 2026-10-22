/** Bubbles that float up from the regulator while the dive gear is hovered. */
export const BUBBLE_COUNT = 6
/** Seconds for one bubble to rise from the regulator to the top. */
export const BUBBLE_CYCLE = 1.8
/** How far (scene units) a bubble rises before it fades out. */
export const BUBBLE_RISE = 0.7

const FADE_IN = 0.15
const FADE_OUT = 0.4

export interface BubbleFrame {
  /** Height above the regulator. */
  y: number
  /** Side-to-side wobble. */
  x: number
  scale: number
  opacity: number
}

/** Where bubble `i` is at time `t` (seconds). The bubbles are spread evenly over one cycle. */
export function bubbleAt(t: number, i: number): BubbleFrame {
  const f = (((t / BUBBLE_CYCLE + i / BUBBLE_COUNT) % 1) + 1) % 1
  return {
    y: BUBBLE_RISE * f,
    x: 0.025 * Math.sin(t * 5 + i * 1.7),
    scale: 0.7 + 0.5 * f,
    opacity: Math.min(1, f / FADE_IN, (1 - f) / FADE_OUT),
  }
}
