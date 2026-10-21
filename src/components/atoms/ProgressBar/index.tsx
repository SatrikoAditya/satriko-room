export default function ProgressBar({
  value,
  label,
}: {
  value: number
  label: string
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className="bg-paper-2 h-3 w-64 overflow-hidden rounded-full"
    >
      <div
        className="bg-accent h-full rounded-full transition-[width] duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
