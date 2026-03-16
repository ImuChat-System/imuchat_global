import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Outils de création IA — ImuChat Creators',
    description:
      'Éditeur vidéo, filtres IA, sous-titres automatiques, traduction IA et bien plus. Tous les outils pour créer du contenu professionnel.',
  };
}

export default async function ToolsPage() {
  const t = await getTranslations('tools');

  const tools = [
    {
      key: 'tool1',
      name: t('tool1Name'),
      desc: t('tool1Desc'),
      ai: false,
      icon: '🎬',
    },
    {
      key: 'tool2',
      name: t('tool2Name'),
      desc: t('tool2Desc'),
      ai: true,
      icon: '✨',
    },
    {
      key: 'tool3',
      name: t('tool3Name'),
      desc: t('tool3Desc'),
      ai: true,
      icon: '💬',
    },
    {
      key: 'tool4',
      name: t('tool4Name'),
      desc: t('tool4Desc'),
      ai: true,
      icon: '🌍',
    },
    {
      key: 'tool5',
      name: t('tool5Name'),
      desc: t('tool5Desc'),
      ai: false,
      icon: '🎭',
    },
    {
      key: 'tool6',
      name: t('tool6Name'),
      desc: t('tool6Desc'),
      ai: true,
      icon: '🖼️',
    },
    {
      key: 'tool7',
      name: t('tool7Name'),
      desc: t('tool7Desc'),
      ai: false,
      icon: '📅',
    },
    {
      key: 'tool8',
      name: t('tool8Name'),
      desc: t('tool8Desc'),
      ai: false,
      icon: '📋',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black mb-4 text-gradient-cr">{t('title')}</h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <div key={tool.key} className="cr-card relative">
            {tool.ai && (
              <span className="absolute top-4 right-4 cr-badge">{t('badgeAI')}</span>
            )}
            <div className="text-3xl mb-3">{tool.icon}</div>
            <h3 className="font-bold text-base mb-2" style={{ color: 'var(--color-text)' }}>
              {tool.name}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              {tool.desc}
            </p>
            <div
              className="mt-4 text-xs font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              {t('available')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
