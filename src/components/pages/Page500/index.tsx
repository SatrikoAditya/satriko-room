'use client'

import Button from '@components/atoms/Button'

import { site } from '@constants/site'

export default function Page500({ reset }: { reset: () => void }) {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-display text-3xl font-extrabold">
        Something knocked the mug over.
      </h1>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="ghost" href={site.resumePdf}>
          Download resume
        </Button>
      </div>
    </main>
  )
}
