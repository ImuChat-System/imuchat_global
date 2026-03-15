'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg" />
              <span className="font-bold text-white">ImuChat Help</span>
            </Link>
            <p className="text-sm max-w-md">Le centre d'aide ImuChat vous accompagne dans l'utilisation de toutes les fonctionnalités de la super-app.</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/getting-started`} className="hover:text-white transition-colors">Premiers pas</Link></li>
              <li><Link href={`/${locale}/account`} className="hover:text-white transition-colors">Mon compte</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="https://imuchat.app/privacy" className="hover:text-white transition-colors">{t('links.privacy')}</Link></li>
              <li><Link href="https://imuchat.app/terms" className="hover:text-white transition-colors">{t('links.terms')}</Link></li>
              <li><Link href="https://status.imuchat.app" className="hover:text-white transition-colors">{t('links.status')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Écosystème</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://app.imuchat.app" className="hover:text-white transition-colors">Application</a></li>
              <li><a href="https://store.imuchat.app" className="hover:text-white transition-colors">Abonnements</a></li>
              <li><a href="https://imuchat.app" className="hover:text-white transition-colors">Retour au site</a></li>
              <li><a href="https://feedback.imuchat.app" className="hover:text-white transition-colors">Feedback</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
