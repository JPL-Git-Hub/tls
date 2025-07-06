import type { Metadata } from 'next'
import './globals.css'
import ClientErrorHandler from '@/components/ClientErrorHandler'

export const metadata: Metadata = {
  title: 'The Law Shop',
  description: 'Professional legal services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientErrorHandler />
        {children}
      </body>
    </html>
  )
}
