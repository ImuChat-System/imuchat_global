'use client';

import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/ui/Container";
import FeatureCard from "@/components/ui/FeatureCard";
import SectionHeader from "@/components/ui/SectionHeader";
import {
    BookOpen,
    Check,
    ChevronRight,
    Code2,
    Globe,
    Package,
    Puzzle,
    Rocket,
    Shield,
    Terminal,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function DevelopersPage() {
  const t = useTranslations('Developers');

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-radial from-slate-50 to-white">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <Container>
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-blue-200 backdrop-blur-sm text-blue-700 text-sm font-medium shadow-sm">
              <Code2 className="w-4 h-4" />
              {t('hero.label')}
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600">
                {t('hero.title')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-10">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-0.5">
                {t('hero.cta_docs')}
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all shadow-sm hover:shadow-md">
                {t('hero.cta_github')}
              </button>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Mini-Apps Platform */}
      <section className="py-20 bg-white">
        <Container>
          <SectionHeader
            title={t('miniapps.title')}
            description={t('miniapps.description')}
            className="mb-16"
          />

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('miniapps.what.title')}</h3>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                {t('miniapps.what.description')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{t('miniapps.what.point1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{t('miniapps.what.point2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{t('miniapps.what.point3')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl p-8 border border-blue-200">
              <pre className="text-sm text-slate-800 overflow-x-auto">
                <code>{`{
  "name": "my-miniapp",
  "version": "1.0.0",
  "type": "miniapp",
  "permissions": [
    "storage.read",
    "user.profile"
  ],
  "entry": "index.html"
}`}</code>
              </pre>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Puzzle}
              title={t('miniapps.feat1.title')}
              description={t('miniapps.feat1.desc')}
              iconColor="text-blue-600"
            />
            <FeatureCard
              icon={Zap}
              title={t('miniapps.feat2.title')}
              description={t('miniapps.feat2.desc')}
              iconColor="text-yellow-600"
            />
            <FeatureCard
              icon={Shield}
              title={t('miniapps.feat3.title')}
              description={t('miniapps.feat3.desc')}
              iconColor="text-green-600"
            />
          </div>
        </Container>
      </section>

      {/* Public API */}
      <section className="py-20 bg-slate-50">
        <Container>
          <SectionHeader
            title={t('api.title')}
            description={t('api.description')}
            className="mb-16"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-shadow">
              <Globe className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">{t('api.endpoint1.title')}</h3>
              <p className="text-sm text-slate-600">{t('api.endpoint1.desc')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-shadow">
              <Users className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">{t('api.endpoint2.title')}</h3>
              <p className="text-sm text-slate-600">{t('api.endpoint2.desc')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-shadow">
              <Package className="w-10 h-10 text-emerald-600 mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">{t('api.endpoint3.title')}</h3>
              <p className="text-sm text-slate-600">{t('api.endpoint3.desc')}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-shadow">
              <TrendingUp className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">{t('api.endpoint4.title')}</h3>
              <p className="text-sm text-slate-600">{t('api.endpoint4.desc')}</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Terminal className="w-6 h-6" />
                <h3 className="text-xl font-bold">{t('api.example.title')}</h3>
              </div>
              <pre className="text-sm overflow-x-auto bg-slate-800 rounded-xl p-6">
                <code className="text-emerald-400">{`import { ImuChatSDK } from '@imuchat/sdk';

const client = new ImuChatSDK({
  apiKey: process.env.IMUCHAT_API_KEY
});

// ${t('api.example.comment')}
const user = await client.users.getProfile('user_123');

// ${t('api.example.comment2')}
await client.messages.send({
  to: 'user_456',
  content: 'Hello from my mini-app!'
});`}</code>
              </pre>
            </div>
          </div>
        </Container>
      </section>

      {/* Developer Resources */}
      <section className="py-20 bg-white">
        <Container>
          <SectionHeader
            title={t('resources.title')}
            description={t('resources.description')}
            className="mb-16"
          />

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('resources.docs.title')}</h3>
              <p className="text-slate-600 mb-4">{t('resources.docs.desc')}</p>
              <a href="#" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                {t('resources.docs.cta')}
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('resources.quickstart.title')}</h3>
              <p className="text-slate-600 mb-4">{t('resources.quickstart.desc')}</p>
              <a href="#" className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:gap-3 transition-all">
                {t('resources.quickstart.cta')}
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('resources.community.title')}</h3>
              <p className="text-slate-600 mb-4">{t('resources.community.desc')}</p>
              <a href="#" className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all">
                {t('resources.community.cta')}
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-emerald-600 to-teal-600 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl">
                {t('cta.button1')}
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all">
                {t('cta.button2')}
              </button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
