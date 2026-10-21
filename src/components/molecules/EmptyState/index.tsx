export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-ink-muted flex flex-col items-center gap-3 py-10 text-center">
      <svg width="72" height="56" viewBox="0 0 72 56" aria-hidden="true">
        <ellipse cx="36" cy="40" rx="26" ry="12" fill="#F2A03D" />
        <circle cx="36" cy="22" r="14" fill="#F2A03D" />
        <path d="M24 12l4-10 8 8zM48 12l-4-10-8 8z" fill="#F2A03D" />
        <circle cx="31" cy="21" r="2" fill="#4A3426" />
        <circle cx="41" cy="21" r="2" fill="#4A3426" />
      </svg>
      <p className="font-display text-lg">{message}</p>
    </div>
  )
}
