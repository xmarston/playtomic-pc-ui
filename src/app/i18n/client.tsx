'use client'

import { useEffect } from 'react'
import i18next, { FlatNamespace, KeyPrefix } from 'i18next'
import { initReactI18next, useTranslation as useTranslationOrg, UseTranslationOptions, UseTranslationResponse, FallbackNs } from 'react-i18next'
import { useCookies } from 'react-cookie'
import resourcesToBackend from 'i18next-resources-to-backend'
import { getOptions, languages, cookieName } from './settings'

const runsOnServerSide = typeof window === 'undefined'

// Initialize i18next without LanguageDetector to prevent hydration mismatch
// The language is determined by the URL path and passed to useTranslation
i18next
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)))
    .init({
        ...getOptions(),
        preload: runsOnServerSide ? languages : []
    })

export function useTranslation<
    Ns extends FlatNamespace,
    KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined
>(
    lng: string,
    ns?: Ns,
    options?: UseTranslationOptions<KPrefix>,
): UseTranslationResponse<FallbackNs<Ns>, KPrefix> {
    const [cookies, setCookie] = useCookies([cookieName])
    const ret = useTranslationOrg(ns, options)
    const { i18n } = ret

    // Handle language change asynchronously
    useEffect(() => {
        if (lng && i18n.resolvedLanguage !== lng) {
            i18n.changeLanguage(lng)
        }
    }, [lng, i18n])

    // Persist language preference in cookie
    useEffect(() => {
        if (cookies.i18next === lng) return
        setCookie(cookieName, lng, { path: '/' })
    }, [lng, cookies.i18next, setCookie])

    return ret
}