import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CRM Application',
  description: 'A powerful CRM solution for managing your business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="flex h-screen overflow-hidden bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                {children}
              </main>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}