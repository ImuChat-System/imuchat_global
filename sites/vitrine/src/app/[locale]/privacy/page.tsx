import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/ui/Container";
import { Bell, Database, Eye, FileText, Globe, Lock, Shield, UserCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('Privacy');

  const sections = [
    { id: 'collection', icon: Database, title: t('sections.collection.title') },
    { id: 'usage', icon: Eye, title: t('sections.usage.title') },
    { id: 'protection', icon: Lock, title: t('sections.protection.title') },
    { id: 'rights', icon: UserCheck, title: t('sections.rights.title') },
    { id: 'cookies', icon: FileText, title: t('sections.cookies.title') },
    { id: 'updates', icon: Bell, title: t('sections.updates.title') },
    { id: 'contact', icon: Globe, title: t('sections.contact.title') },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-radial from-slate-50 to-white">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <Container>
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-green-200 backdrop-blur-sm text-green-700 text-sm font-medium shadow-sm">
              <Shield className="w-4 h-4" />
              {t('hero.label')}
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <p className="text-sm text-slate-500 mt-4">
              {t('hero.updated')}
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Table of Contents */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <Container size="lg">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('toc.title')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                  >
                    <Icon className="w-5 h-5 text-slate-600 group-hover:text-primary-600" />
                    <span className="font-medium text-slate-900 group-hover:text-primary-700">
                      {section.title}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Content Sections */}
      <section className="py-20 bg-white">
        <Container size="lg">
          <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
            {/* Introduction */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('intro.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                {t('intro.content')}
              </p>
            </div>

            {/* Data Collection */}
            <div id="collection" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.collection.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-6">{t('sections.collection.intro')}</p>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">{t('sections.collection.account.title')}</h3>
              <ul className="space-y-2 text-slate-700">
                {t.raw('sections.collection.account.items').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">{t('sections.collection.usage.title')}</h3>
              <ul className="space-y-2 text-slate-700">
                {t.raw('sections.collection.usage.items').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Data Usage */}
            <div id="usage" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.usage.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-6">{t('sections.usage.intro')}</p>
              <ul className="space-y-2 text-slate-700">
                {t.raw('sections.usage.purposes').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Data Protection */}
            <div id="protection" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.protection.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-6">{t('sections.protection.intro')}</p>
              <ul className="space-y-2 text-slate-700">
                {t.raw('sections.protection.measures').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* User Rights */}
            <div id="rights" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.rights.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-6">{t('sections.rights.intro')}</p>
              <ul className="space-y-2 text-slate-700">
                {t.raw('sections.rights.list').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Cookies */}
            <div id="cookies" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.cookies.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-6">{t('sections.cookies.intro')}</p>
              <p className="text-lg text-slate-700">{t('sections.cookies.content')}</p>
            </div>

            {/* Updates */}
            <div id="updates" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.updates.title')}</h2>
              </div>
              <p className="text-lg text-slate-700">{t('sections.updates.content')}</p>
            </div>

            {/* Contact */}
            <div id="contact" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.contact.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-4">{t('sections.contact.content')}</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <p className="font-semibold text-slate-900 mb-2">ImuChat</p>
                <p className="text-slate-700">Email: privacy@imuchat.app</p>
                <p className="text-slate-700">Address: Paris, France</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
