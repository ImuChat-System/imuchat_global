'use client';

import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import {
    Award,
    Globe,
    Heart,
    Lightbulb,
    MapPin,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('About');

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-radial from-slate-50 to-white">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <Container>
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-primary-200 backdrop-blur-sm text-primary-700 text-sm font-medium shadow-sm">
              <Heart className="w-4 h-4" />
              {t('hero.label')}
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
              <Target className="w-12 h-12 text-primary-600 mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('mission.title')}</h2>
              <p className="text-slate-700 leading-relaxed">
                {t('mission.description')}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200">
              <Lightbulb className="w-12 h-12 text-secondary-600 mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('vision.title')}</h2>
              <p className="text-slate-700 leading-relaxed">
                {t('vision.description')}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <Container>
          <SectionHeader
            title={t('values.title')}
            description={t('values.description')}
            className="mb-16"
          />

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('values.privacy.title')}</h3>
              <p className="text-slate-600">
                {t('values.privacy.desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('values.openness.title')}</h3>
              <p className="text-slate-600">
                {t('values.openness.desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('values.innovation.title')}</h3>
              <p className="text-slate-600">
                {t('values.innovation.desc')}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <Container size="lg">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
              {t('story.title')}
            </h2>
            
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              <p>{t('story.p1')}</p>
              <p>{t('story.p2')}</p>
              <p>{t('story.p3')}</p>
            </div>

            {/* Incubation Badge */}
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="flex items-center gap-4">
                <Award className="w-12 h-12 text-orange-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{t('incubation.title')}</h3>
                  <p className="text-slate-700 text-sm">
                    {t('incubation.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Location */}
      <section className="py-20 bg-slate-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t('location.title')}
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              {t('location.description')}
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
