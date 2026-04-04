'use client'

import NextTopLoader from 'nextjs-toploader'

export function TopLoader() {
  return (
    <NextTopLoader
      color="#FBBF24"
      height={3}
      crawlSpeed={380}
      showSpinner={false}
      shadow="0 0 12px rgba(251, 191, 36, 0.35)"
    />
  )
}
