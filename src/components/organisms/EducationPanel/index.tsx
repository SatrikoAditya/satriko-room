import CertificateFrame from '@components/molecules/CertificateFrame'

import { education as defaultEducation } from '@content/education'
import type { IEducation } from '@models/education'

export default function EducationPanel({
  items = defaultEducation,
}: {
  items?: readonly IEducation[]
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {items.map((e) => (
        <CertificateFrame key={e.id} item={e} />
      ))}
    </ul>
  )
}
