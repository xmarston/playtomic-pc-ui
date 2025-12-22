import "../globals.css";

import Script from 'next/script'
import { dir } from 'i18next'
import { languages, fallbackLng } from '../i18n/settings'
import { useTranslation } from '../i18n'
import LanguageSelector from '../components/LanguageSelector'

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export async function generateMetadata({ params: { lng } }: {
  params: {
    lng: string;
  };
}) {
  if (languages.indexOf(lng) < 0) lng = fallbackLng
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = await useTranslation(lng, 'common')
  return {
    title: t('title'),
    description: t('description'),
    other: {
      'monetag': '5c1d38d5a7ee0e751fbc39eb9e97b012',
    },
  }
}

export default function RootLayout({
  children, params: { lng } }: { children: React.ReactNode, params: { lng: string } }) {
  return (
    <html lang={lng} dir={dir(lng)}>
      <head>
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="195226"
          async
          data-cfasync="false"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.className} antialiased`}>
        {children}
        <LanguageSelector />
      </body>
    </html>
  );
}
