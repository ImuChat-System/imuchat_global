import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { LandingNav }        from '@/components/landing/LandingNav'
import { HeroSection }       from '@/components/landing/HeroSection'
import { StatsBar, FeaturesGrid, ModulesStrip, SovereigntyPillars } from '@/components/landing/FeaturesSection'
import { PricingSection }    from '@/components/landing/PricingSection'
import { DownloadSection, LandingFooter } from '@/components/landing/DownloadFooter'

/* ─── Metadata (SEO) ─────────────────────────────────────────────── */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.meta')

  return {
    title: t('title'),
    description: t('description'),
    keywords: ['super-app', 'messagerie', 'RGPD', 'européen', 'IA', 'Alice', 'ImuChat', 'ImuOffice'],
    authors: [{ name: 'ImuChat' }],
    metadataBase: new URL('https://app.imuchat.app'),
    openGraph: {
      title: t('og_title'),
      description: t('og_description'),
      type: 'website',
      url: 'https://app.imuchat.app',
      siteName: 'ImuChat',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'ImuChat — Super-app européenne souveraine',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('og_title'),
      description: t('og_description'),
      images: ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: 'https://app.imuchat.app',
      languages: {
        fr: 'https://app.imuchat.app/fr',
        en: 'https://app.imuchat.app/en',
        ja: 'https://app.imuchat.app/ja',
      },
    },
  }
}

/* ─── JSON-LD Structured Data ──────────────────────────────────────── */
function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ImuChat',
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'Web, iOS, Android, Windows, macOS, Linux',
    description: 'Super-application européenne souveraine : messagerie, IA, bureautique et compétitions.',
    url: 'https://app.imuchat.app',
    inLanguage: ['fr', 'en', 'ja'],
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        name: 'Gratuit',
      },
      {
        '@type': 'Offer',
        price: '4.99',
        priceCurrency: 'EUR',
        billingPeriod: 'P1M',
        name: 'Premium',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <JsonLd />
      <div className="min-h-screen bg-white dark:bg-[#0A0614] text-gray-900 dark:text-white">
        <LandingNav />

        <main>
          <HeroSection />
          <StatsBar />
          <FeaturesGrid />
          <ModulesStrip />
          <SovereigntyPillars />
          <PricingSection />
          <DownloadSection />
        </main>

        <LandingFooter />
      </div>
    </>
  )
}
