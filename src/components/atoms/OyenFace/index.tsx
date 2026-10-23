// Oyen's face as a small doodle, with a prop per panel (decision 62). Drawn on
// a 48×48 grid; the face colours match the 3D Oyen and the empty-state doodle.
const ORANGE = '#F2A03D'
const INK = '#4A3426'
const CREAM = '#FFF7E8'

export type OyenProp =
  | 'heart'
  | 'glasses'
  | 'note'
  | 'book'
  | 'cap'
  | 'controller'
  | 'bucketHat'
  | 'backpack'
  | 'snorkel'
  | 'mug'
  | 'envelope'
  | 'paper'

/** Props he holds in his paws: drawn in front of them, not behind. */
export const HELD_PROPS: ReadonlySet<OyenProp> = new Set([
  'note',
  'controller',
  'envelope',
  'mug',
  'paper',
])

export function Prop({ prop }: { prop: OyenProp }) {
  switch (prop) {
    case 'heart':
      return (
        <path
          d="M39 9c-1.6-2.6-5.5-1.6-5.2 1.4.2 2.2 5.2 5.4 5.2 5.4s5-3.2 5.2-5.4c.3-3-3.6-4-5.2-1.4z"
          fill="#E58A8A"
        />
      )
    case 'glasses':
      return (
        <g fill="none" stroke={INK} strokeWidth={1.6}>
          <circle cx={18.5} cy={26} r={4.6} />
          <circle cx={29.5} cy={26} r={4.6} />
          <path d="M23.1 26h1.8" />
        </g>
      )
    case 'note':
      return (
        <g transform="rotate(10 40 37)">
          <rect x={34} y={31} width={11} height={11} rx={1} fill="#F2C94C" />
          <path d="M36.5 35h6M36.5 38h4" stroke={INK} strokeWidth={1} />
        </g>
      )
    case 'book':
      return (
        <g>
          <rect
            x={14}
            y={38}
            width={20}
            height={8}
            rx={1.5}
            fill="#9FD8C3"
            stroke={INK}
            strokeWidth={1}
          />
          <path d="M24 38v8" stroke={INK} strokeWidth={1} />
        </g>
      )
    case 'cap':
      return (
        <g>
          <path d="M24 4 37 9 24 14 11 9z" fill={INK} />
          <rect x={18} y={10.5} width={12} height={4} rx={1} fill={INK} />
          <path d="M37 9v6" stroke="#F2C94C" strokeWidth={1.4} />
          <circle cx={37} cy={15.5} r={1.4} fill="#F2C94C" />
        </g>
      )
    case 'controller':
      // Held with both paws, like the book.
      return (
        <g>
          <rect x={11} y={35} width={26} height={10} rx={5} fill="#5B6B8C" />
          <path d="M15 40h4M17 38v4" stroke={CREAM} strokeWidth={1.3} />
          <circle cx={30} cy={38.8} r={1.1} fill={CREAM} />
          <circle cx={32.6} cy={41.2} r={1.1} fill={CREAM} />
        </g>
      )
    case 'bucketHat':
      // A traveller's bucket hat, sand with a terracotta band.
      return (
        <g>
          <path d="M16 15c0-6 3.5-9 8-9s8 3 8 9z" fill="#D9B77A" />
          <rect x={16} y={12.2} width={16} height={2.6} fill="#B8553A" />
          <ellipse cx={24} cy={15.5} rx={14} ry={3} fill="#C9A464" />
        </g>
      )
    case 'backpack':
      return (
        <g>
          <rect x={35} y={27} width={11} height={16} rx={3} fill="#B8553A" />
          <rect x={37} y={34} width={7} height={5} rx={1.5} fill="#F2A65A" />
          <path
            d="M37 27c0-3 7-3 7 0"
            fill="none"
            stroke={INK}
            strokeWidth={1.2}
          />
        </g>
      )
    case 'snorkel':
      return (
        <g>
          <rect
            x={12}
            y={21.5}
            width={24}
            height={9}
            rx={4.5}
            fill="#A9D6F2"
            fillOpacity={0.75}
            stroke="#2F6FA8"
            strokeWidth={1.6}
          />
          <path
            d="M38 30V8"
            stroke="#F2C94C"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      )
    case 'mug':
      return (
        <g>
          <rect
            x={33}
            y={34}
            width={9}
            height={10}
            rx={1.5}
            fill="#D9C8F0"
            stroke={INK}
            strokeWidth={1}
          />
          <path
            d="M42 36.5c3 0 3 5 0 5"
            fill="none"
            stroke={INK}
            strokeWidth={1}
          />
          <path
            d="M36 31c-1-1.5 1-2 0-3.5M39 31c-1-1.5 1-2 0-3.5"
            fill="none"
            stroke={INK}
            strokeWidth={0.9}
          />
        </g>
      )
    case 'envelope':
      return (
        <g>
          <rect
            x={32}
            y={34}
            width={14}
            height={10}
            rx={1}
            fill={CREAM}
            stroke={INK}
            strokeWidth={1}
          />
          <path
            d="M32.5 34.5 39 40l6.5-5.5"
            fill="none"
            stroke={INK}
            strokeWidth={1}
          />
        </g>
      )
    case 'paper':
      return (
        <g transform="rotate(-8 39 38)">
          <rect
            x={33}
            y={30}
            width={11}
            height={14}
            rx={1}
            fill={CREAM}
            stroke={INK}
            strokeWidth={1}
          />
          <path
            d="M35.5 34h6M35.5 37h6M35.5 40h4"
            stroke={INK}
            strokeWidth={0.9}
          />
        </g>
      )
  }
}

export default function OyenFace({
  prop,
  size = 40,
  sleepy = false,
}: {
  prop?: OyenProp
  size?: number
  /** Night: closed, sleepy eyes like the sleeping Oyen in the room. */
  sleepy?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="block shrink-0"
    >
      <path d="M12.5 17 13 6l8 6.5zM35.5 17 35 6l-8 6.5z" fill={ORANGE} />
      <circle cx={24} cy={27} r={15} fill={ORANGE} />
      <ellipse cx={24} cy={33} rx={7} ry={5} fill="#FFE3BF" />
      {sleepy ? (
        <path
          d="M16.3 25.5q2.2 2 4.4 0M27.3 25.5q2.2 2 4.4 0"
          fill="none"
          stroke={INK}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle cx={18.5} cy={26} r={2} fill={INK} />
          <circle cx={29.5} cy={26} r={2} fill={INK} />
        </>
      )}
      <path d="M22.6 30.5h2.8L24 32z" fill="#E58A8A" />
      {prop && !HELD_PROPS.has(prop) && <Prop prop={prop} />}
    </svg>
  )
}
