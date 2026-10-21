'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import Button from '@components/atoms/Button'

export default function CopyEmailButton({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'fallback'>('idle')
  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard')
      await navigator.clipboard.writeText(email)
      setState('copied')
    } catch {
      setState('fallback')
    }
    setTimeout(() => setState('idle'), 2500)
  }
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button variant="ghost" onClick={copy} aria-label="Copy email">
        {state === 'copied' ? <Check size={18} /> : <Copy size={18} />} Copy
      </Button>
      <span role="status" className="text-ink-muted text-sm">
        {state === 'copied'
          ? 'Copied!'
          : state === 'fallback'
            ? 'Select the address and press ⌘/Ctrl+C to copy'
            : ''}
      </span>
    </span>
  )
}
