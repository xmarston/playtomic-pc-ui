"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function getOrCreateSessionId(): string {
  const COOKIE_NAME = 'analytics_session'

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === COOKIE_NAME && value) {
      return value
    }
  }

  const sessionId = crypto.randomUUID()
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  document.cookie = `${COOKIE_NAME}=${sessionId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`

  return sessionId
}

async function detectBrowser(): Promise<string> {
  const ua = navigator.userAgent

  // Check for Brave first (requires async check)
  // @ts-expect-error - navigator.brave is Brave-specific
  if (navigator.brave && (await navigator.brave.isBrave())) {
    return 'Brave'
  }

  // Check other browsers by user agent
  if (ua.includes('Edg/') || ua.includes('Edge/')) return 'Edge'
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'

  return 'Unknown'
}

export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't track analytics dashboard visits
    if (pathname.includes('/analytics')) return

    const trackPageView = async () => {
      try {
        const sessionId = getOrCreateSessionId()
        const browser = await detectBrowser()

        await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || null,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            browser,
            sessionId,
          }),
        })
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.debug('Analytics tracking failed:', error)
      }
    }

    trackPageView()
  }, [pathname])

  return null
}
