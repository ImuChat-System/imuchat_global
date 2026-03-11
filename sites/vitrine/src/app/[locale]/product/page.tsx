'use client';

import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/ui/Container";
import FeatureCard from "@/components/ui/FeatureCard";
import SectionHeader from "@/components/ui/SectionHeader";
import {
    Globe,
    Heart,
    Layers,
    Lock,
    MessageSquare,
    Puzzle,
    Shield,
    Sparkles,
    Users,
    Zap
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ProductPage() {
  const t = useTranslations('Product');

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-radial from-slate-50 to-white">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <Container>
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-primary-200 backdrop-blur-sm text-primary-700 text-sm font-medium shadow-sm">
              <Sparkles className="w-4 h-4" />
              {t('hero.label')}
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-premium">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-10">
              {t('hero.subtitle')}
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* What is ImuChat */}
      <section className="py-20 bg-white">
        <Container>
          <SectionHeader
            title={t('what.title')}
            description={t('what.description')}
            className="mb-16"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={MessageSquare}
              title={t('what.feature1_title')}
              description={t('what.feature1_desc')}
            />
            <FeatureCard
              icon={Puzzle}
              title={t('what.feature2_title')}
              description={t('what.feature2_desc')}
            />
            <FeatureCard
              icon={Sparkles}
              title={t('what.feature3_title')}
              description={t('what.feature3_desc')}
            />
            <FeatureCard
              icon={Globe}
              title={t('what.feature4_title')}
              description={t('what.feature4_desc')}
            />
            <FeatureCard
              icon={Shield}
              title={t('what.feature5_title')}
              description={t('what.feature5_desc')}
            />
            <FeatureCard
              icon={Layers}
              title={t('what.feature6_title')}
              description={t('what.feature6_desc')}
            />
          </div>
        </Container>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-slate-50">
        <Container>
          <SectionHeader
            title={t('usecases.title')}
            description={t('usecases.description')}
            className="mb-16"
          />

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Student */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('usecases.student_title')}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{t('usecases.student_desc')}</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700">
                  <Zap className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>{t('usecases.student_feat1')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Zap className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>{t('usecases.student_feat2')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Zap className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>{t('usecases.student_feat3')}</span>
                </li>
              </ul>
            </div>

            {/* Family */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('usecases.family_title')}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{t('usecases.family_desc')}</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700">
                  <Zap className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
                  <span>{t('usecases.family_feat1')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Zap className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
                  <span>{t('usecases.family_feat2')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Zap className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
                  <span>{t('usecases.family_feat3')}</span>
                </li>
              </ul>
            </div>

            {/* Organization */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('usecases.org_title')}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{t('usecases.org_desc')}</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700">
                  <Zap className="w-5 h-5 text-slate-700 mt-0.5 flex-shrink-0" />
                  <span>{t('usecases.org_feat1')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Zap className="w-5 h-5 text-slate-700 mt-0.5 flex-shrink-0" />
                  <span>{t('usecases.org_feat2')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Zap className="w-5 h-5 text-slate-700 mt-0.5 flex-shrink-0" />
                  <span>{t('usecases.org_feat3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Platform Philosophy */}
      <section className="py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              {t('philosophy.title')}
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              {t('philosophy.description')}
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold shadow-lg">
              <Globe className="w-5 h-5" />
              {t('philosophy.tagline')}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
