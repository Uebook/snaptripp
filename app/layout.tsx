import type { Metadata } from 'next'
import './globals.css'
import './home.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import CookieBanner from '@/app/components/CookieBanner'

export const metadata: Metadata = {
  title: 'Snaptrip',
  description: 'Your travel companion',
  referrer: 'no-referrer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
