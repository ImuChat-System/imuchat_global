'use client';

import { useTranslations } from 'next-intl';
import { Search, BookOpen, User, MessageCircle, Bot, FileText, ShoppingBag, Shield, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const categoryIcons = {
  gettingStarted: BookOpen, account: User, messaging: MessageCircle, alice: Bot,
  office: FileText, store: ShoppingBag, privacy: Shield, billing: CreditCard,
};

const categoryColors = {
  gettingStarted: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  account: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  messaging: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  alice: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  office: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  store: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  privacy: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  billing: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function HelpHomePage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const categories = Object.keys(categoryIcons) as Array<keyof typeof categoryIcons>;
  const popularQuestions = t.raw('popular.items') as string[];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-8">{t('hero.title')}</h1>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('hero.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-300"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('categories.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <Link key={category} href={`/${category}`} className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${categoryColors[category]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                  {t(`categories.${category}.title`)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t(`categories.${category}.description`)}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Questions */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('popular.title')}</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {popularQuestions.map((question, index) => (
              <Link key={index} href={`/article/${index + 1}`} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group">
                <span className="text-gray-700 dark:text-gray-200">{question}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 container mx-auto px-4">
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('contact.title')}</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">{t('contact.description')}</p>
          <Link href="/contact" className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors">
            {t('contact.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}
