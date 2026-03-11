import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/ui/Container";
import { Building, FileText, Globe, Mail, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LegalPage() {
  const t = useTranslations('Legal');

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-radial from-slate-50 to-white">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <Container>
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200 backdrop-blur-sm text-slate-600 text-sm font-medium shadow-sm">
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

      {/* Content Section */}
      <section className="py-20 bg-white">
        <Container size="lg">
          <div className="max-w-4xl mx-auto">
            {/* Company Information */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Building className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-slate-900">{t('company.title')}</h2>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-slate-600 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900">{t('company.name')}</p>
                    <p className="text-slate-700">{t('company.form')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-600 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900">{t('company.address.title')}</p>
                    <p className="text-slate-700">{t('company.address.line1')}</p>
                    <p className="text-slate-700">{t('company.address.line2')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-slate-600 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900">{t('company.registration.title')}</p>
                    <p className="text-slate-700">{t('company.registration.number')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-slate-600 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900">{t('company.contact.title')}</p>
                    <p className="text-slate-700">Email: contact@imuchat.app</p>
                    <p className="text-slate-700">{t('company.contact.phone')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Publication Director */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('director.title')}</h2>
              <p className="text-lg text-slate-700">{t('director.name')}</p>
              <p className="text-slate-600">{t('director.role')}</p>
            </div>

            {/* Hosting */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-slate-900">{t('hosting.title')}</h2>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <p className="font-semibold text-slate-900 mb-2">{t('hosting.provider')}</p>
                <p className="text-slate-700">{t('hosting.address')}</p>
                <p className="text-slate-700 mt-2">{t('hosting.website')}</p>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('intellectual.title')}</h2>
              <div className="prose prose-slate prose-lg">
                <p className="text-slate-700 mb-4">{t('intellectual.content.p1')}</p>
                <p className="text-slate-700 mb-4">{t('intellectual.content.p2')}</p>
                <p className="text-slate-700">{t('intellectual.content.p3')}</p>
              </div>
            </div>

            {/* Personal Data */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('data.title')}</h2>
              <p className="text-slate-700 mb-4">{t('data.dpo.title')}</p>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
                <p className="font-semibold text-slate-900 mb-2">{t('data.dpo.contact')}</p>
                <p className="text-slate-700">Email: privacy@imuchat.app</p>
              </div>
              <p className="text-slate-600 mt-4 text-sm">
                {t('data.policy')}
              </p>
            </div>

            {/* Cookies */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('cookies.title')}</h2>
              <p className="text-slate-700">{t('cookies.content')}</p>
            </div>

            {/* Applicable Law */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('law.title')}</h2>
              <p className="text-slate-700 mb-4">{t('law.content')}</p>
              <p className="text-slate-700">{t('law.disputes')}</p>
            </div>

            {/* Contact for Legal Issues */}
            <div className="bg-slate-900 text-white rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-3">{t('contact.title')}</h3>
              <p className="text-slate-300 mb-4">{t('contact.content')}</p>
              <div className="space-y-2">
                <p className="font-medium">Email: legal@imuchat.app</p>
                <p className="text-slate-300">{t('contact.response')}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
