import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';
import { ExternalLink, Download, Smartphone, Building2, Code, Github, Link2, Zap } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'go.imuchat.app — Liens courts ImuChat',
    description: 'Service de redirections marketing pour l\'écosystème ImuChat.',
  };
}

const QUICK_LINKS = [
  {
    href: 'https://app.imuchat.app',
    iconKey: 'smartphone',
    labelKey: 'app',
    descKey: 'app_desc',
    color: '#6366f1',
  },
  {
    href: 'https://imuchat.app/download',
    iconKey: 'download',
    labelKey: 'download',
    descKey: 'download_desc',
    color: '#10b981',
  },
  {
    href: 'https://enterprise.imuchat.app',
    iconKey: 'building',
    labelKey: 'enterprise',
    descKey: 'enterprise_desc',
    color: '#3b82f6',
  },
  {
    href: 'https://docs.imuchat.app',
    iconKey: 'code',
    labelKey: 'docs',
    descKey: 'docs_desc',
    color: '#f59e0b',
  },
  {
    href: 'https://github.com/imuchat',
    iconKey: 'github',
    labelKey: 'github',
    descKey: 'github_desc',
    color: '#9ca3af',
  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  smartphone: <Smartphone size={20} />,
  download: <Download size={20} />,
  building: <Building2 size={20} />,
  code: <Code size={20} />,
  github: <Github size={20} />,
};

export default async function GoHomePage() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
        >
          <Link2 size={28} style={{ color: '#6366f1' }} />
        </div>
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#f9fafb' }}>
          go.imuchat.app
        </h1>
        <p style={{ color: '#9ca3af' }}>{t('sub')}</p>
      </div>

      {/* Quick links */}
      <div className="w-full max-w-md mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#6b7280' }}>
          {t('links_title')}
        </h2>
        <div className="space-y-2">
          {QUICK_LINKS.map(({ href, iconKey, labelKey, descKey, color }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl transition-colors group"
              style={{
                background: '#111111',
                border: '1px solid #1f2937',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                style={{ background: color + '20', color }}
              >
                {ICON_MAP[iconKey]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm" style={{ color: '#f9fafb' }}>{t(labelKey)}</div>
                <div className="text-xs" style={{ color: '#9ca3af' }}>{t(descKey)}</div>
              </div>
              <ExternalLink size={14} style={{ color: '#4b5563' }} />
            </a>
          ))}
        </div>
      </div>

      {/* Service info */}
      <div
        className="w-full max-w-md rounded-2xl p-6 mb-8"
        style={{ background: '#111111', border: '1px solid #1f2937' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <Zap size={18} style={{ color: '#6366f1', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: '#f9fafb' }}>{t('service_title')}</h3>
            <p className="text-sm" style={{ color: '#9ca3af' }}>{t('service_desc')}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Code size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: '#f9fafb' }}>{t('tech_title')}</h3>
            <p className="text-sm" style={{ color: '#9ca3af' }}>{t('tech_desc')}</p>
          </div>
        </div>
      </div>

      {/* Predefined redirects table */}
      <div className="w-full max-w-md mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#6b7280' }}>
          Redirections prédéfinies
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid #1f2937' }}
        >
          {[
            { slug: '/download', dest: 'Smart link iOS/Android/Desktop' },
            { slug: '/signup', dest: 'imuchat.app/signup' },
            { slug: '/enterprise', dest: 'enterprise.imuchat.app' },
            { slug: '/docs', dest: 'docs.imuchat.app' },
            { slug: '/github', dest: 'github.com/imuchat' },
            { slug: '/discord', dest: 'Serveur Discord ImuChat' },
          ].map(({ slug, dest }, i) => (
            <div
              key={slug}
              className="flex items-center gap-4 px-4 py-3 text-sm"
              style={{
                background: i % 2 === 0 ? '#111111' : '#0f0f0f',
                borderBottom: i < 5 ? '1px solid #1f2937' : 'none',
              }}
            >
              <code style={{ color: '#6366f1', fontFamily: 'monospace', minWidth: '100px' }}>
                go/{slug.slice(1)}
              </code>
              <span style={{ color: '#9ca3af' }}>→</span>
              <span style={{ color: '#d1d5db' }}>{dest}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs" style={{ color: '#4b5563' }}>{t('footer')}</p>
    </div>
  );
}
