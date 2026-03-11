'use client';

import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/ui/Container";
import FeatureCard from "@/components/ui/FeatureCard";
import SectionHeader from "@/components/ui/SectionHeader";
import {
    Bot,
    Brain,
    CheckCircle2,
    ChevronRight,
    Eye,
    FileSearch,
    Languages,
    Lock,
    MessageSquare,
    Server,
    Shield,
    Sparkles,
    Zap
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AIPage() {
  const t = useTranslations('AI');

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-radial from-violet-50 to-white">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <Container>
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-violet-200 backdrop-blur-sm text-violet-700 text-sm font-medium shadow-sm">
              <Brain className="w-4 h-4" />
              {t('hero.label')}
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600">
                {t('hero.title')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* AI Assistants */}
      <section className="py-20 bg-white">
        <Container>
          <SectionHeader
            title={t('assistants.title')}
            description={t('assistants.description')}
            className="mb-16"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('assistants.chat.title')}</h3>
              <p className="text-slate-600 text-sm">{t('assistants.chat.desc')}</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('assistants.coach.title')}</h3>
              <p className="text-slate-600 text-sm">{t('assistants.coach.desc')}</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('assistants.creative.title')}</h3>
              <p className="text-slate-600 text-sm">{t('assistants.creative.desc')}</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center mb-4">
                <FileSearch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('assistants.research.title')}</h3>
              <p className="text-slate-600 text-sm">{t('assistants.research.desc')}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* AI Features */}
      <section className="py-20 bg-slate-50">
        <Container>
          <SectionHeader
            title={t('features.title')}
            description={t('features.description')}
            className="mb-16"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title={t('features.suggestions.title')}
              description={t('features.suggestions.desc')}
              iconColor="text-yellow-600"
            />
            <FeatureCard
              icon={Languages}
              title={t('features.translation.title')}
              description={t('features.translation.desc')}
              iconColor="text-blue-600"
            />
            <FeatureCard
              icon={FileSearch}
              title={t('features.summary.title')}
              description={t('features.summary.desc')}
              iconColor="text-purple-600"
            />
            <FeatureCard
              icon={Shield}
              title={t('features.moderation.title')}
              description={t('features.moderation.desc')}
              iconColor="text-red-600"
            />
            <FeatureCard
              icon={Bot}
              title={t('features.contextual.title')}
              description={t('features.contextual.desc')}
              iconColor="text-violet-600"
            />
            <FeatureCard
              icon={Sparkles}
              title={t('features.personalized.title')}
              description={t('features.personalized.desc')}
              iconColor="text-pink-600"
            />
          </div>
        </Container>
      </section>

      {/* Privacy First AI */}
      <section className="py-20 bg-white">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  {t('privacy.badge')}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  {t('privacy.title')}
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  {t('privacy.description')}
                </p>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">{t('privacy.point1.title')}</h4>
                      <p className="text-slate-600 text-sm">{t('privacy.point1.desc')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">{t('privacy.point2.title')}</h4>
                      <p className="text-slate-600 text-sm">{t('privacy.point2.desc')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">{t('privacy.point3.title')}</h4>
                      <p className="text-slate-600 text-sm">{t('privacy.point3.desc')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">{t('privacy.point4.title')}</h4>
                      <p className="text-slate-600 text-sm">{t('privacy.point4.desc')}</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl p-8 border border-violet-200">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                      <Lock className="w-8 h-8 text-violet-600" />
                      <div>
                        <div className="font-semibold text-slate-900">{t('privacy.visual.encryption')}</div>
                        <div className="text-sm text-slate-600">{t('privacy.visual.encryption_sub')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                      <Eye className="w-8 h-8 text-violet-600" />
                      <div>
                        <div className="font-semibold text-slate-900">{t('privacy.visual.transparency')}</div>
                        <div className="text-sm text-slate-600">{t('privacy.visual.transparency_sub')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                      <Server className="w-8 h-8 text-violet-600" />
                      <div>
                        <div className="font-semibold text-slate-900">{t('privacy.visual.local')}</div>
                        <div className="text-sm text-slate-600">{t('privacy.visual.local_sub')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-violet-100 mb-8">
              {t('cta.description')}
            </p>
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 rounded-full font-semibold text-lg hover:bg-violet-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              {t('cta.button')}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </Container>
      </section>
    </main>
  );
}
