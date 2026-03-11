import { getTranslations } from 'next-intl/server';
import { ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categoryArticles, categoryIcons, categoryTranslationKeys, locales } from '@/lib/articles-data';

export function generateStaticParams() {
  const categories = Object.keys(categoryArticles);
  const params: { locale: string; category: string }[] = [];
  
  for (const locale of locales) {
    for (const category of categories) {
      params.push({ locale, category });
    }
  }
  
  return params;
}

export default async function CategoryPage({ 
  params 
}: { 
  params: Promise<{ category: string; locale: string }> 
}) {
  const { category, locale } = await params;
  const tBreadcrumb = await getTranslations('breadcrumb');
  const tCategories = await getTranslations('categories');
  
  const articles = categoryArticles[category];
  const translationKey = categoryTranslationKeys[category];
  
  if (!articles || !translationKey) {
    notFound();
  }

  const icon = categoryIcons[category] || '📄';

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href={`/${locale}`} className="text-gray-500 hover:text-primary-600">
              {tBreadcrumb('home')}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">
              {tCategories(`${translationKey}.title`)}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-5xl mb-4 block">{icon}</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {tCategories(`${translationKey}.title`)}
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            {tCategories(`${translationKey}.description`)}
          </p>
        </div>
      </section>

      {/* Articles list */}
      <section className="py-12 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {articles.length} article{articles.length > 1 ? 's' : ''}
          </h2>
          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/${locale}/${category}/${article.slug}`}
                className="block bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {article.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
