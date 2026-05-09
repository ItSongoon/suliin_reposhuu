import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: 'ZamZuur - Таны цагийг хэмнэнэ',
  description: 'ZamZuur нь таны өдөр тутмын худалдан авалт, захиалга, маршрут төлөвлөлтийг хялбарчилна.',
  generator: 'v0.app',
  keywords: ['ZamZuur', 'Mongolia', 'delivery', 'shopping', 'route planning'],
}

export const viewport: Viewport = {
  themeColor: '#636B2F',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="mn" className="bg-background" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
