import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/ui/Container";
import { AlertCircle, CheckCircle, FileText, Scale, UserX } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('Terms');

  const sections = [
    { id: 'acceptance', icon: CheckCircle, title: t('sections.acceptance.title') },
    { id: 'account', icon: UserX, title: t('sections.account.title') },
    { id: 'usage', icon: AlertCircle, title: t('sections.usage.title') },
    { id: 'content', icon: FileText, title: t('sections.content.title') },
    { id: 'liability', icon: Scale, title: t('sections.liability.title') },
    { id: 'modifications', icon: AlertCircle, title: t('sections.modifications.title') },
    { id: 'termination', icon: UserX, title: t('sections.termination.title') },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-radial from-slate-50 to-white">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <Container>
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-blue-200 backdrop-blur-sm text-blue-700 text-sm font-medium shadow-sm">
              <FileText className="w-4 h-4" />
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
                <FileText className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('intro.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                {t('intro.content')}
              </p>
            </div>

            {/* Acceptance */}
            <div id="acceptance" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.acceptance.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-4">{t('sections.acceptance.content')}</p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-slate-800 font-medium m-0">
                  {t('sections.acceptance.highlight')}
                </p>
              </div>
            </div>

            {/* Account */}
            <div id="account" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <UserX className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.account.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-6">{t('sections.account.intro')}</p>
              <ul className="space-y-2 text-slate-700">
                {t.raw('sections.account.responsibilities').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Usage */}
            <div id="usage" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.usage.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-6">{t('sections.usage.intro')}</p>
              
              <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">{t('sections.usage.allowed.title')}</h3>
              <ul className="space-y-2 text-slate-700">
                {t.raw('sections.usage.allowed.items').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">{t('sections.usage.prohibited.title')}</h3>
              <ul className="space-y-2 text-slate-700">
                {t.raw('sections.usage.prohibited.items').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Content */}
            <div id="content" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.content.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-6">{t('sections.content.intro')}</p>
              <ul className="space-y-2 text-slate-700">
                {t.raw('sections.content.rights').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Liability */}
            <div id="liability" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.liability.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-6">{t('sections.liability.intro')}</p>
              <ul className="space-y-2 text-slate-700">
                {t.raw('sections.liability.limits').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Modifications */}
            <div id="modifications" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.modifications.title')}</h2>
              </div>
              <p className="text-lg text-slate-700">{t('sections.modifications.content')}</p>
            </div>

            {/* Termination */}
            <div id="termination" className="mb-16 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <UserX className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900 m-0">{t('sections.termination.title')}</h2>
              </div>
              <p className="text-lg text-slate-700 mb-6">{t('sections.termination.intro')}</p>
              <ul className="space-y-2 text-slate-700">
                {t.raw('sections.termination.reasons').map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-12">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('contact.title')}</h3>
              <p className="text-slate-700 mb-4">{t('contact.content')}</p>
              <p className="font-semibold text-slate-900">ImuChat</p>
              <p className="text-slate-700">Email: legal@imuchat.app</p>
              <p className="text-slate-700">Address: Paris, France</p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
