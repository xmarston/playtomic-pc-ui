'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { languages } from '../i18n/settings'

const languageFlags: Record<string, { flag: string; name: string }> = {
  en: { flag: '🇬🇧', name: 'English' },
  es: { flag: '🇪🇸', name: 'Español' },
  fr: { flag: '🇫🇷', name: 'Français' },
  de: { flag: '🇩🇪', name: 'Deutsch' },
  it: { flag: '🇮🇹', name: 'Italiano' },
  nl: { flag: '🇳🇱', name: 'Nederlands' },
  pt: { flag: '🇵🇹', name: 'Português' },
}

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const params = useParams()
  const router = useRouter()
  const currentLng = params.lng as string

  const handleLanguageChange = (lng: string) => {
    setIsOpen(false)
    router.push(`/${lng}`)
  }

  const currentFlag = languageFlags[currentLng]?.flag || '🌐'

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-1">
          {languages.map((lng) => (
            <button
              key={lng}
              onClick={() => handleLanguageChange(lng)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                lng === currentLng ? 'bg-blue-50' : ''
              }`}
              title={languageFlags[lng]?.name}
            >
              <span className="text-2xl">{languageFlags[lng]?.flag}</span>
              <span className="text-sm text-gray-700">{languageFlags[lng]?.name}</span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-3xl hover:shadow-xl transition-shadow border border-gray-200"
        aria-label="Select language"
      >
        {currentFlag}
      </button>
    </div>
  )
}
