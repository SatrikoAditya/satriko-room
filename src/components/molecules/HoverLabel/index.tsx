export default function HoverLabel({
  label,
  onClick,
}: {
  label: string
  onClick?: () => void
}) {
  const cls =
    'stitched whitespace-nowrap rounded-xl bg-paper px-3 py-1 font-display text-sm font-bold text-ink shadow-md'
  return onClick ? (
    <button type="button" tabIndex={-1} onClick={onClick} className={cls}>
      {label}
    </button>
  ) : (
    <span className={cls}>{label}</span>
  )
}
