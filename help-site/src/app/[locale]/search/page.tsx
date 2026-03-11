'use client';

import { categoryArticles, categoryIcons, categoryTranslationKeys } from '@/lib/articles-data';
import { ArrowLeft, FileText, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function SearchPage() {
  const t = useTranslations('searchPage');
  const tCategories = useTranslations('categories');
  const [query, setQuery] = useState('');

  // Build searchable index from all articles
  const allArticles = useMemo(() => {
    const articles: Array<{
      category: string;
      slug: string;
      title: string;
      description: string;
      categoryKey: string;
    }> = [];

    Object.entries(categoryArticles).forEach(([category, items]) => {
      items.forEach(item => {
        articles.push({
          category,
          slug: item.slug,
          title: item.title,
          description: item.description,
          categoryKey: categoryTranslationKeys[category] || category,
        });
      });
    });

    return articles;
  }, []);

  // Filter articles based on search query
  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return allArticles.filter(article => 
      article.title.toLowerCase().includes(lowerQuery) ||
      article.description.toLowerCase().includes(lowerQuery) ||
      article.category.toLowerCase().includes(lowerQuery)
    );
  }, [query, allArticles]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        </div>

        {/* Search Input */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            autoFocus
          />
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="mb-4 text-gray-600">
            {results.length === 0 
              ? `${t('noResults')} "${query}"`
              : `${results.length} ${t('resultsFor')} "${query}"`
            }
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((article) => (
              <Link 
                key={`${article.category}-${article.slug}`}
                href={`/${article.category}/${article.slug}`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{categoryIcons[article.category] || '📄'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        {tCategories(`${article.categoryKey}.title`)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {article.description}
                    </p>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results - Show Categories */}
        {query.trim() && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-6">{t('tryAgain')}</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Parcourir les catégories
            </Link>
          </div>
        )}

        {/* Empty State - Show Popular Categories */}
        {!query.trim() && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {Object.entries(categoryIcons).slice(0, 8).map(([category, icon]) => {
              const translationKey = categoryTranslationKeys[category] || category;
              return (
                <Link
                  key={category}
                  href={`/${category}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className="font-medium text-gray-900 text-sm">
                    {tCategories(`${translationKey}.title`)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
