import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EatWise – Familienmahlzeiten',
  description: 'Wöchentlicher Mahlzeitenplan für die ganze Familie',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-bold text-xl text-green-600">
              <span className="text-2xl">🥗</span>
              EatWise
            </a>
            <a
              href="/admin"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Admin
            </a>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
