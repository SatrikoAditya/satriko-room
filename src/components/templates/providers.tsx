'use client'

import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { ThemeProvider } from 'next-themes'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      themes={['light', 'dark']}
      value={{ light: 'day', dark: 'night' }}
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  )
}
