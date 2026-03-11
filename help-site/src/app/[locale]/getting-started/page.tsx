'use client';

import { useTranslations } from 'next-intl';
import { Download, UserPlus, Settings, Compass, ChevronRight, Apple, Smartphone } from 'lucide-react';
import { Link } from '@/navigation';

const steps = [
  { key: 'download', icon: Download, color: 'blue' },
  { key: 'create', icon: UserPlus, color: 'green' },
  { key: 'setup', icon: Settings, color: 'purple' },
  { key: 'explore', icon: Compass, color: 'orange' },
] as const;

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function GettingStartedPage() {
  const t = useTranslations('gettingStarted');
  const tBreadcrumb = useTranslations('breadcrumb');

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary-600">
              {tBreadcrumb('home')}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">{t('title')}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.key}
                  className="flex items-start gap-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex-shrink-0 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[step.color]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t(`steps.${step.key}.title`)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t(`steps.${step.key}.description`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            {t('steps.download.title')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://apps.apple.com/app/imuchat" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Apple className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs opacity-80">Download on the</div>
                <div className="font-semibold">App Store</div>
              </div>
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=app.imuchat" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Smartphone className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs opacity-80">Get it on</div>
                <div className="font-semibold">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
