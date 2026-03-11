'use client';

import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Handshake,
  Mail,
  Rocket,
  Target,
  Users
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PartnersPage() {
  const t = useTranslations('Partners');
  const locale = useLocale();

  const partnerTypes = [
    {
      id: 'universities',
      icon: GraduationCap,
      title: t('types.universities.title'),
      description: t('types.universities.description'),
      benefits: t.raw('types.universities.benefits') as string[]
    },
    {
      id: 'institutions',
      icon: Building2,
      title: t('types.institutions.title'),
      description: t('types.institutions.description'),
      benefits: t.raw('types.institutions.benefits') as string[]
    },
    {
      id: 'associations',
      icon: Users,
      title: t('types.associations.title'),
      description: t('types.associations.description'),
      benefits: t.raw('types.associations.benefits') as string[]
    }
  ];

  const useCases = [
    {
      icon: Target,
      title: t('useCases.campus.title'),
      description: t('useCases.campus.description')
    },
    {
      icon: Rocket,
      title: t('useCases.incubation.title'),
      description: t('useCases.incubation.description')
    },
    {
      icon: Users,
      title: t('useCases.communities.title'),
      description: t('useCases.communities.description')
    }
  ];

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <Container>
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-primary-200 backdrop-blur-sm text-primary-700 text-sm font-medium shadow-sm">
              <Handshake className="w-4 h-4" />
              {t('hero.label')}
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8">
              {t('hero.subtitle')}
            </p>

            <Link 
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
            >
              {t('hero.cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </Container>
      </section>

      {/* PEPITE Badge Section */}
      <section className="py-12 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{t('pepite.title')}</h3>
                <p className="text-primary-100">{t('pepite.subtitle')}</p>
              </div>
            </div>
            <p className="text-center md:text-right text-lg max-w-lg">
              {t('pepite.description')}
            </p>
          </div>
        </Container>
      </section>

      {/* Partner Types */}
      <section className="py-20 bg-white">
        <Container>
          <SectionHeader
            label={t('types.label')}
            title={t('types.title')}
            description={t('types.description')}
            centered
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {partnerTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div 
                  key={type.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 p-8 hover:border-primary-300 hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary-600" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {type.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-6">
                    {type.description}
                  </p>

                  <div className="space-y-3">
                    {type.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-slate-50">
        <Container>
          <SectionHeader
            label={t('useCases.label')}
            title={t('useCases.title')}
            description={t('useCases.description')}
            centered
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-slate-600">
                    {useCase.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <Container>
          <SectionHeader
            label={t('benefits.label')}
            title={t('benefits.title')}
            centered
          />

          <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
            {(t.raw('benefits.list') as string[]).map((benefit, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-6 bg-slate-50 rounded-xl"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-slate-700 font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Mail className="w-16 h-16 mx-auto mb-6 text-primary-400" />
            <h2 className="text-4xl font-bold mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold text-lg hover:bg-slate-100 transition-all shadow-lg"
              >
                {t('cta.contact')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href={`/${locale}/about`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white border-2 border-white rounded-full font-semibold text-lg hover:bg-white hover:text-slate-900 transition-all"
              >
                {t('cta.learn')}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
