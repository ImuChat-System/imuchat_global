'use client';

import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  Calendar,
  Code,
  Globe,
  Newspaper,
  Rocket,
  Sparkles,
  Trophy,
  Users
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function NewsPage() {
  const t = useTranslations('News');

  const timelineEvents = [
    {
      id: 'launch',
      date: t('timeline.events.launch.date'),
      icon: Rocket,
      title: t('timeline.events.launch.title'),
      description: t('timeline.events.launch.description'),
      status: 'completed' as const
    },
    {
      id: 'pepite',
      date: t('timeline.events.pepite.date'),
      icon: Trophy,
      title: t('timeline.events.pepite.title'),
      description: t('timeline.events.pepite.description'),
      status: 'completed' as const
    },
    {
      id: 'mvp',
      date: t('timeline.events.mvp.date'),
      icon: Code,
      title: t('timeline.events.mvp.title'),
      description: t('timeline.events.mvp.description'),
      status: 'current' as const
    },
    {
      id: 'beta',
      date: t('timeline.events.beta.date'),
      icon: Users,
      title: t('timeline.events.beta.title'),
      description: t('timeline.events.beta.description'),
      status: 'upcoming' as const
    },
    {
      id: 'launch-public',
      date: t('timeline.events.launch_public.date'),
      icon: Sparkles,
      title: t('timeline.events.launch_public.title'),
      description: t('timeline.events.launch_public.description'),
      status: 'upcoming' as const
    },
    {
      id: 'international',
      date: t('timeline.events.international.date'),
      icon: Globe,
      title: t('timeline.events.international.title'),
      description: t('timeline.events.international.description'),
      status: 'upcoming' as const
    }
  ];

  const news = [
    {
      date: t('news.article1.date'),
      title: t('news.article1.title'),
      excerpt: t('news.article1.excerpt'),
      category: t('news.article1.category')
    },
    {
      date: t('news.article2.date'),
      title: t('news.article2.title'),
      excerpt: t('news.article2.excerpt'),
      category: t('news.article2.category')
    },
    {
      date: t('news.article3.date'),
      title: t('news.article3.title'),
      excerpt: t('news.article3.excerpt'),
      category: t('news.article3.category')
    }
  ];

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-radial from-slate-50 to-white">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <Container>
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-blue-200 backdrop-blur-sm text-blue-700 text-sm font-medium shadow-sm">
              <Newspaper className="w-4 h-4" />
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

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <Container>
          <SectionHeader
            label={t('timeline.label')}
            title={t('timeline.title')}
            description={t('timeline.description')}
            centered
          />

          <div className="mt-16 max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-secondary-500 to-slate-200"></div>

              {/* Timeline Events */}
              <div className="space-y-12">
                {timelineEvents.map((event, index) => {
                  const Icon = event.icon;
                  const isCompleted = event.status === 'completed';
                  const isCurrent = event.status === 'current';
                  const isUpcoming = event.status === 'upcoming';

                  return (
                    <div key={event.id} className="relative flex items-start gap-6">
                      {/* Icon */}
                      <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30' :
                        isCurrent ? 'bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/30 animate-pulse' :
                        'bg-slate-200'
                      }`}>
                        <Icon className={`w-7 h-7 ${
                          isCompleted || isCurrent ? 'text-white' : 'text-slate-400'
                        }`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-12">
                        <div className={`rounded-2xl p-6 ${
                          isCompleted ? 'bg-green-50 border-2 border-green-200' :
                          isCurrent ? 'bg-primary-50 border-2 border-primary-300 shadow-lg' :
                          'bg-slate-50 border-2 border-slate-200'
                        }`}>
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className={`w-4 h-4 ${
                              isCompleted ? 'text-green-600' :
                              isCurrent ? 'text-primary-600' :
                              'text-slate-400'
                            }`} />
                            <span className={`text-sm font-semibold ${
                              isCompleted ? 'text-green-700' :
                              isCurrent ? 'text-primary-700' :
                              'text-slate-500'
                            }`}>
                              {event.date}
                            </span>
                            {isCurrent && (
                              <span className="ml-auto px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                                {t('timeline.current')}
                              </span>
                            )}
                          </div>
                          <h3 className={`text-xl font-bold mb-2 ${
                            isCompleted ? 'text-green-900' :
                            isCurrent ? 'text-primary-900' :
                            'text-slate-700'
                          }`}>
                            {event.title}
                          </h3>
                          <p className={`${
                            isCompleted ? 'text-green-700' :
                            isCurrent ? 'text-primary-700' :
                            'text-slate-600'
                          }`}>
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Latest News */}
      <section className="py-20 bg-slate-50">
        <Container>
          <SectionHeader
            label={t('news.label')}
            title={t('news.title')}
            description={t('news.description')}
            centered
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {news.map((article, index) => (
              <article 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-slate-200"
              >
                <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full mb-4">
                  {article.category}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  {article.date}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {article.title}
                </h3>
                <p className="text-slate-600">
                  {article.excerpt}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <Container>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {['commits', 'features', 'languages', 'platforms'].map((key, index) => {
              const stat = t.raw(`stats.${key}`) as {value: string, label: string};
              return (
                <div key={index}>
                  <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-slate-300 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </main>
  );
}
