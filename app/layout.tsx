import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ModalProvider } from '@/providers/modal-provider'
import { heIL } from "@clerk/localizations";
import { ToastProvider } from '@/providers/toast-provider'
import { ThemeProvider } from '@/providers/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Ⓒ 2023 Liron Lin Avraham',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={heIL}>
      <html lang="he">
        <body className={inter.className}>
        <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem
          >
          <ToastProvider />
          <ModalProvider />
          {children}
          </ThemeProvider>
          </body>
      </html>
    </ClerkProvider>
  )
}
