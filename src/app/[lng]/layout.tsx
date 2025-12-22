import "../globals.css";

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
  }
}

export default function RootLayout({
  children, params: { lng } }: { children: React.ReactNode, params: { lng: string } }) {
  return (
    <html lang={lng} dir={dir(lng)}>
      <body
        className={`${inter.className} antialiased`}>
        {children}
        <LanguageSelector />
      </body>
    </html>
  );
}
