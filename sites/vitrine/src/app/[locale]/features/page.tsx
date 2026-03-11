'use client';

import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/ui/Container";
import {
    Activity,
    AlertCircle,
    Bot,
    Building,
    Bus,
    Calendar,
    Car,
    CheckSquare,
    CookingPot,
    CreditCard,
    Download,
    Edit3,
    FileSearch,
    FileSpreadsheet,
    FileText,
    Frame,
    Gamepad2,
    Globe as GlobeIcon,
    Heart,
    Image as ImageIcon,
    LayoutGrid,
    Lock,
    MessageSquare,
    MessagesSquare,
    Mic,
    Monitor,
    Music,
    Package,
    PackageSearch,
    Palette,
    Paperclip,
    Phone,
    PlayCircle,
    Podcast,
    Presentation,
    Share,
    Shield,
    ShieldCheck,
    ShoppingCart,
    Smartphone,
    Smile,
    Sparkles,
    Store,
    Type,
    User,
    UserPlus,
    Users,
    Video,
    Wallpaper,
    Zap
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function FeaturesPage() {
  const t = useTranslations('Features');

  const featureGroups = [
    {
      id: 'messaging',
      icon: MessageSquare,
      color: 'from-primary-500 to-primary-700',
      features: [
        { icon: MessageSquare, key: 'g1_f1' },
        { icon: Mic, key: 'g1_f2' },
        { icon: Paperclip, key: 'g1_f3' },
        { icon: Edit3, key: 'g1_f4' },
        { icon: Heart, key: 'g1_f5' }
      ]
    },
    {
      id: 'calls',
      icon: Phone,
      color: 'from-blue-500 to-blue-700',
      features: [
        { icon: Phone, key: 'g2_f1' },
        { icon: Video, key: 'g2_f2' },
        { icon: Monitor, key: 'g2_f3' },
        { icon: Share, key: 'g2_f4' },
        { icon: Sparkles, key: 'g2_f5' }
      ]
    },
    {
      id: 'profiles',
      icon: User,
      color: 'from-purple-500 to-purple-700',
      features: [
        { icon: User, key: 'g3_f1' },
        { icon: Users, key: 'g3_f2' },
        { icon: ImageIcon, key: 'g3_f3' },
        { icon: Activity, key: 'g3_f4' },
        { icon: ShieldCheck, key: 'g3_f5' }
      ]
    },
    {
      id: 'personalization',
      icon: Palette,
      color: 'from-pink-500 to-pink-700',
      features: [
        { icon: Palette, key: 'g4_f1' },
        { icon: Wallpaper, key: 'g4_f2' },
        { icon: Type, key: 'g4_f3' },
        { icon: Package, key: 'g4_f4' },
        { icon: Smartphone, key: 'g4_f5' }
      ]
    },
    {
      id: 'social',
      icon: MessagesSquare,
      color: 'from-orange-500 to-orange-700',
      features: [
        { icon: MessagesSquare, key: 'g5_f1' },
        { icon: LayoutGrid, key: 'g5_f2' },
        { icon: FileText, key: 'g5_f3' },
        { icon: Calendar, key: 'g5_f4' },
        { icon: UserPlus, key: 'g5_f5' }
      ]
    },
    {
      id: 'modules',
      icon: Frame,
      color: 'from-emerald-500 to-emerald-700',
      features: [
        { icon: CheckSquare, key: 'g6_f1' },
        { icon: FileSpreadsheet, key: 'g6_f2' },
        { icon: Presentation, key: 'g6_f3' },
        { icon: Frame, key: 'g6_f4' },
        { icon: CookingPot, key: 'g6_f5' }
      ]
    },
    {
      id: 'services',
      icon: Bus,
      color: 'from-cyan-500 to-cyan-700',
      features: [
        { icon: Bus, key: 'g7_f1' },
        { icon: Car, key: 'g7_f2' },
        { icon: AlertCircle, key: 'g7_f3' },
        { icon: Building, key: 'g7_f4' },
        { icon: PackageSearch, key: 'g7_f5' }
      ]
    },
    {
      id: 'entertainment',
      icon: Music,
      color: 'from-rose-500 to-rose-700',
      features: [
        { icon: Music, key: 'g8_f1' },
        { icon: Podcast, key: 'g8_f2' },
        { icon: PlayCircle, key: 'g8_f3' },
        { icon: Gamepad2, key: 'g8_f4' },
        { icon: Smile, key: 'g8_f5' }
      ]
    },
    {
      id: 'ai',
      icon: Bot,
      color: 'from-violet-500 to-violet-700',
      features: [
        { icon: Bot, key: 'g9_f1' },
        { icon: Zap, key: 'g9_f2' },
        { icon: FileSearch, key: 'g9_f3' },
        { icon: Shield, key: 'g9_f4' },
        { icon: GlobeIcon, key: 'g9_f5' }
      ]
    },
    {
      id: 'store',
      icon: Store,
      color: 'from-slate-500 to-slate-700',
      features: [
        { icon: Store, key: 'g10_f1' },
        { icon: Download, key: 'g10_f2' },
        { icon: Lock, key: 'g10_f3' },
        { icon: ShoppingCart, key: 'g10_f4' },
        { icon: CreditCard, key: 'g10_f5' }
      ]
    }
  ];

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-radial from-slate-50 to-white">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <Container>
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-primary-200 backdrop-blur-sm text-primary-700 text-sm font-medium shadow-sm">
              <Package className="w-4 h-4" />
              {t('hero.label')}
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-premium">{t('hero.title')}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Feature Groups */}
      <section className="py-20">
        <Container>
          <div className="space-y-20">
            {featureGroups.map((group, groupIndex) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.id} className="scroll-mt-20">
                  {/* Group Header */}
                  <div className="flex items-center gap-4 mb-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${group.color} flex items-center justify-center shadow-lg`}>
                      <GroupIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">
                        {t(`groups.${group.id}.title`)}
                      </h2>
                      <p className="text-slate-600 mt-1">
                        {t(`groups.${group.id}.description`)}
                      </p>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.features.map((feature, featureIndex) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div 
                          key={feature.key}
                          className="group p-6 rounded-xl bg-white border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2.5 rounded-lg bg-gradient-to-br ${group.color} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                              <FeatureIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 mb-1.5">
                                {t(`groups.${group.id}.${feature.key}`)}
                              </h3>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              {t('cta.description')}
            </p>
            <button className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-0.5">
              {t('cta.button')}
            </button>
          </div>
        </Container>
      </section>
    </main>
  );
}
