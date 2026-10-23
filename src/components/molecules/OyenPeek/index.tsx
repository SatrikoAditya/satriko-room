'use client'

import { motion } from 'motion/react'

import OyenFace, {
  HELD_PROPS,
  Prop,
  type OyenProp,
} from '@components/atoms/OyenFace'

import { useSceneStore } from '@store/useSceneStore'

import { jobs } from '@content/experience'
import { gaming } from '@content/gaming'
import { introFor } from '@content/panelIntros'
import type { SectionSlug } from '@interfaces/section'

/** The same props Oyen held in each panel (decision 62). */
const props: Record<SectionSlug, OyenProp> = {
  about: 'heart',
  experience: 'glasses',
  projects: 'note',
  skills: 'book',
  education: 'cap',
  gaming: 'controller',
  travel: 'bucketHat',
  hiking: 'backpack',
  diving: 'snorkel',
  'remote-work': 'mug',
  contact: 'envelope',
  resume: 'paper',
}

const PAW = '#F2A03D'
const INK = '#4A3426'

/** One front paw over the panel's edge, with two toe lines. */
function Paw({ left }: { left: number }) {
  return (
    <svg
      aria-hidden="true"
      width={14}
      height={10}
      viewBox="0 0 14 10"
      className="absolute top-7"
      style={{ left }}
    >
      <ellipse cx={7} cy={5} rx={6.5} ry={4.5} fill={PAW} />
      <path
        d="M5 6.5v2M9 6.5v2"
        stroke={INK}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Oyen climbing the panel: his face and two paws over the top edge, with his
 * line in a quiet bubble above the panel (decision 62). He rises once after
 * the panel opens; at night he's sleepy and yawns before the same line.
 */
export default function OyenPeek({
  slug,
  animated,
}: {
  slug: SectionSlug
  animated: boolean
}) {
  const night = useSceneStore((s) => s.theme) === 'night'
  const text = introFor(slug, {
    jobs,
    gaming,
  })
  const rise = animated
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.3, duration: 0.3, ease: 'easeOut' as const },
      }
    : {}
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
      <motion.div
        {...rise}
        aria-hidden="true"
        className="absolute bottom-[-6px] left-7"
      >
        <OyenFace prop={props[slug]} sleepy={night} />
        <Paw left={5} />
        <Paw left={23} />
        {/* Held props sit in front of his paws. */}
        {HELD_PROPS.has(props[slug]) && (
          <svg
            aria-hidden="true"
            width={40}
            height={40}
            viewBox="0 0 48 48"
            className="absolute inset-0"
          >
            <Prop prop={props[slug]} />
          </svg>
        )}
        {night && (
          <motion.span
            className="font-display text-ink-muted absolute -top-3 right-0 text-xs font-extrabold"
            initial={animated ? { opacity: 0, y: 4 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animated ? 0.7 : 0, duration: 0.6 }}
          >
            z
          </motion.span>
        )}
      </motion.div>
      <motion.p
        initial={animated ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: animated ? 0.45 : 0, duration: 0.25 }}
        className="border-wood/25 bg-paper text-ink-muted absolute bottom-[6px] left-[84px] m-0 max-w-[min(460px,calc(100%-100px))] rounded-xl border px-3 py-1.5 text-sm leading-snug shadow-sm"
      >
        {/* The bubble's tail, pointing back at Oyen. */}
        <span
          aria-hidden="true"
          className="border-wood/25 bg-paper absolute bottom-2 -left-[5px] size-2.5 rotate-45 border-b border-l"
        />
        <span className="sr-only">Oyen says: </span>
        {night && <em>yawn… </em>}
        {text}
      </motion.p>
    </div>
  )
}
