'use client'

import NextTopLoader from 'nextjs-toploader'

export function TopLoader() {
  return (
    <NextTopLoader
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
  )
}
