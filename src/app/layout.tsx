import type { ReactNode } from 'react'
import type { Metadata } from 'next'

import Providers from '@components/templates/providers'

import { jetbrainsMono, mPlusRounded, nunito, vt323 } from '@constants/fonts'
import { site } from '@constants/site'

import '@styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} · ${site.title}`,
  description: `Step into Satriko's cozy room and explore 5+ years of full stack work with Node.js, TypeScript, React, Next.js and NestJS.`,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${mPlusRounded.variable} ${nunito.variable} ${jetbrainsMono.variable} ${vt323.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
