import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { CookieConsent } from '@/components/CookieConsent'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VEX IQ Rapid Relay Dashboard',
  description: 'Track your VEX IQ Rapid Relay scores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="vex-theme"
        >
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  )
}

