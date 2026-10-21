import Button from '@components/atoms/Button'
import CopyEmailButton from '@components/molecules/CopyEmailButton'

import { contact as defaultContact } from '@content/contact'

export default function ContactPanel({
  content = defaultContact,
}: {
  content?: typeof defaultContact
}) {
  return (
    <div className="stitched bg-paper-2 rounded-xl p-6">
      <p className="font-display text-lg font-extrabold">Dear visitor,</p>
      <p className="my-3">The best way to reach me is email:</p>
      <p className="font-mono text-lg">{content.email}</p>
      <div className="my-4 flex flex-wrap gap-3">
        <CopyEmailButton email={content.email} />
        <Button href={`mailto:${content.email}`}>Send email</Button>
        {content.linkedin && (
          <Button
            variant="ghost"
            href={content.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </Button>
        )}
        {content.github && (
          <Button
            variant="ghost"
            href={content.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Button>
        )}
      </div>
      <p className="text-ink-muted">{content.references}</p>
    </div>
  )
}
