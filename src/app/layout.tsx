import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'hn duel',
  description: 'guess which hacker news post has more upvotes!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"' }}>
        {children}
      </body>
    </html>
  )
}