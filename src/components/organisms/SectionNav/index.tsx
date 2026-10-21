import { sections } from '@constants/sections'

export default function SectionNav() {
  return (
    <nav
      aria-label="Sections"
      className="focus-within:bg-paper sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-2 focus-within:left-2 focus-within:z-50 focus-within:rounded-xl focus-within:p-3"
    >
      <ul>
        {sections.map((s) => (
          <li key={s.slug}>
            <a href={`/${s.slug}`}>{s.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
