import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  const title = locale === 'fr' 
    ? 'ImuChat - La Super-App Européenne Respectueuse de vos Données'
    : 'ImuChat - The European Privacy-Focused Super-App';
  
  const description = locale === 'fr'
    ? 'Communication sécurisée, services utiles, mini-apps et IA dans une plateforme unique. Messagerie chiffrée, appels vidéo, modules personnalisables. 100% RGPD.'
    : 'Secure communication, useful services, mini-apps and AI in one platform. End-to-end encrypted messaging, video calls, customizable modules. 100% GDPR compliant.';

  return {
    title: {
      default: title,
      template: `%s | ImuChat`
    },
    description,
    keywords: ['super-app', 'messagerie', 'chiffrement', 'RGPD', 'GDPR', 'application européenne', 'WeChat européen', 'communication sécurisée'],
    authors: [{ name: 'ImuChat Team' }],
    creator: 'ImuChat',
    publisher: 'ImuChat',
    metadataBase: new URL('https://imuchat.app'),
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'en' ? 'en_US' : locale,
      title,
      description,
      siteName: 'ImuChat',
      images: ['/og-image-default.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@imuchat',
      images: ['/og-image-default.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    verification: {
      // TODO: Ajouter les codes de vérification lors du déploiement
      // google: 'verification_code',
      // yandex: 'verification_code',
      // bing: 'verification_code',
    },
  };
}

const locales = ['fr', 'en', 'de', 'es', 'ja'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ImuChat',
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    description: locale === 'fr'
      ? 'Super-application européenne combinant messagerie sécurisée, services utiles et intelligence artificielle'
      : 'European super-app combining secure messaging, useful services and artificial intelligence',
  };

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
