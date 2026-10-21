export default function OyenWalk({ progress }: { progress: number }) {
  return (
    <div className="relative h-16 w-64" aria-hidden="true">
      <svg
        viewBox="0 0 64 48"
        width="64"
        height="48"
        className="absolute -top-2 animate-bounce motion-reduce:animate-none"
        style={{
          left: `calc(${Math.min(progress, 100)}% - 32px)`,
          transition: 'left 300ms',
        }}
      >
        <ellipse cx="34" cy="34" rx="22" ry="11" fill="#F2A03D" />
        <circle cx="16" cy="24" r="12" fill="#F2A03D" />
        <path d="M6 16l2-10 8 7zM26 16l-2-10-8 7z" fill="#F2A03D" />
        <circle cx="12" cy="23" r="1.8" fill="#4A3426" />
        <circle cx="20" cy="23" r="1.8" fill="#4A3426" />
        <path
          d="M14 28h4"
          stroke="#E58A8A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M54 30c6-6 8 2 4 6"
          stroke="#F2A03D"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="24" y="40" width="5" height="7" rx="2.5" fill="#D9842A" />
        <rect x="40" y="40" width="5" height="7" rx="2.5" fill="#D9842A" />
      </svg>
    </div>
  )
}
