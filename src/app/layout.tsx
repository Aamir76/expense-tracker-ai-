import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'A simple, calm expense tracking application to manage your personal finances',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Runs before React hydrates so dark-mode users never see a light flash.
          Mirrors the logic in ThemeProvider.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.classList.add(t)}else if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark')}else{document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <CurrencyProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                {children}
              </div>
            </CurrencyProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
