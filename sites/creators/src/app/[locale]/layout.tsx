import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { routing } from '@/navigation';
import '../globals.css';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'ImuChat Creators — Créez, Partagez, Gagnez',
  description:
    'Rejoignez le programme créateurs ImuChat. Monétisez votre contenu, grandissez votre audience, utilisez des outils IA puissants.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  return (
    <html lang={params.locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
