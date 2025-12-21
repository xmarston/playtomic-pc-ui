'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { languages } from '../i18n/settings'

const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  nl: 'Nederlands',
  pt: 'Português',
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
              title={languageNames[lng]}
            >
              <Image
                src={`/images/flags/${lng}.svg`}
                alt={languageNames[lng]}
                width={24}
                height={16}
                className="rounded-sm"
              />
              <span className="text-sm text-gray-700">{languageNames[lng]}</span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow border border-gray-200"
        aria-label="Select language"
      >
        <Image
          src={`/images/flags/${currentLng || 'en'}.svg`}
          alt={languageNames[currentLng] || 'English'}
          width={32}
          height={21}
          className="rounded-sm"
        />
      </button>
    </div>
  )
}
