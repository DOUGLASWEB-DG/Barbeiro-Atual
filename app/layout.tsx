import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import { TopLoader } from '@/components/top-loader'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'BarberOS — Sistema de Gestão para Barbearia',
  description: 'Sistema completo de gestão para barbearia: agendamentos, clientes, finanças e metas.',
  generator: 'BarberOS',
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} min-h-[100dvh] bg-zinc-950 font-sans text-foreground antialiased`}
      >
        <TopLoader
          color="#F59E0B"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #F59E0B,0 0 5px #F59E0B"
        />
        {children}
        <Toaster
          position="top-center"
          offset="1rem"
          mobileOffset={{ top: 'max(env(safe-area-inset-top), 0.75rem)' }}
          toastOptions={{
            unstyled: false,
            classNames: {
              toast:
                'rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100 shadow-2xl backdrop-blur-md',
              title: 'text-zinc-100 font-semibold',
              description: 'text-zinc-400',
              success:
                '!border-emerald-500/40 !bg-zinc-900 !text-emerald-400',
              error:
                '!border-red-400/45 !bg-zinc-900 !text-red-400',
              warning:
                '!border-amber-400/45 !bg-zinc-900 [&_[data-title]]:text-amber-300 [&_[data-description]]:text-amber-100/80',
              info: '!border-sky-400/40 !bg-zinc-900 [&_[data-title]]:text-sky-300',
              closeButton: 'text-zinc-400 hover:text-zinc-100',
              actionButton:
                '!rounded-xl !bg-amber-500 !px-4 !py-2 !font-semibold !text-zinc-950 hover:!bg-amber-400',
              cancelButton:
                '!rounded-xl !border !border-white/15 !bg-zinc-800 !px-4 !py-2 !font-medium !text-zinc-200 hover:!bg-zinc-700',
            },
          }}
        />
      </body>
    </html>
  )
}
