import { getTranslations } from 'next-intl/server';
import { ChevronRight, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles, categoryArticles, categoryTranslationKeys, locales } from '@/lib/articles-data';
import FeedbackButtons from '@/components/FeedbackButtons';

export function generateStaticParams() {
  const params: { locale: string; category: string; slug: string }[] = [];
  
  for (const locale of locales) {
    for (const [category, categoryData] of Object.entries(articles)) {
      for (const slug of Object.keys(categoryData)) {
        params.push({ locale, category, slug });
      }
    }
  }
  
  return params;
}

export default async function ArticlePage({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string; locale: string }> 
}) {
  const { category, slug, locale } = await params;
  const t = await getTranslations('article');
  const tBreadcrumb = await getTranslations('breadcrumb');
  const tCategories = await getTranslations('categories');

  const categoryData = articles[category];
  const translationKey = categoryTranslationKeys[category];
  
  if (!categoryData || !translationKey) {
    notFound();
  }

  const article = categoryData[slug];
  
  if (!article) {
    notFound();
  }

  // Find related articles
  const relatedArticles = article.related
    .map((relatedSlug) => {
      // Search in same category first
      if (categoryData[relatedSlug]) {
        return { slug: relatedSlug, category, title: categoryData[relatedSlug].title };
      }
      // Search in other categories
      for (const [cat, catArticles] of Object.entries(articles)) {
        if (catArticles[relatedSlug]) {
          return { slug: relatedSlug, category: cat, title: catArticles[relatedSlug].title };
        }
      }
      return null;
    })
    .filter((a): a is { slug: string; category: string; title: string } => a !== null);

  // Parse markdown content
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\* - (.+)/);
        if (match) {
          return (
            <li key={i} className="ml-4 text-gray-700 dark:text-gray-300">
              <strong>{match[1]}</strong> - {match[2]}
            </li>
          );
        }
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 text-gray-700 dark:text-gray-300">{line.replace('- ', '')}</li>;
      }
      if (line.match(/^\d+\./)) {
        return <li key={i} className="ml-4 list-decimal text-gray-700 dark:text-gray-300">{line.replace(/^\d+\.\s*/, '')}</li>;
      }
      if (line.startsWith('**/')) {
        const match = line.match(/\*\*(.+?)\*\* - (.+)/);
        if (match) {
          return (
            <p key={i} className="my-2 text-gray-700 dark:text-gray-300">
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-primary-600 dark:text-primary-400">{match[1]}</code>
              <span className="ml-2">{match[2]}</span>
            </p>
          );
        }
      }
      if (line.trim()) {
        return <p key={i} className="my-3 text-gray-700 dark:text-gray-300">{line}</p>;
      }
      return null;
    });
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link href={`/${locale}`} className="text-gray-500 hover:text-primary-600">
              {tBreadcrumb('home')}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/${locale}/${category}`} className="text-gray-500 hover:text-primary-600">
              {tCategories(`${translationKey}.title`)}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
              <Clock className="w-4 h-4" />
              <span>{t('lastUpdated')}: {article.updated}</span>
            </div>

            {/* Article content */}
            <div className="prose dark:prose-invert max-w-none">
              {renderContent(article.content)}
            </div>

            {/* Feedback */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <FeedbackButtons helpfulText={t('helpful')} />
            </div>

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('related')}
                </h3>
                <div className="space-y-3">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/${locale}/${related.category}/${related.slug}`}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-900 dark:text-white">{related.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
