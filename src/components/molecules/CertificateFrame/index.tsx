import type { IEducation } from '@models/education'

export default function CertificateFrame({ item }: { item: IEducation }) {
  return (
    <li className="border-wood bg-paper rounded-xl border-8 p-4 shadow-md">
      <p className="font-display text-lg font-extrabold">{item.program}</p>
      <p className="text-ink-muted">
        {item.institution} · {item.location}
      </p>
      <p className="text-sm">
        {item.start} – {item.end === 'present' ? 'Present' : item.end}
      </p>
      {item.note && (
        <p
          className={
            item.honors
              ? 'bg-accent font-display text-on-accent mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold'
              : 'mt-2 text-sm'
          }
        >
          {item.honors ? '🎀 ' : ''}
          {item.note}
        </p>
      )}
    </li>
  )
}
