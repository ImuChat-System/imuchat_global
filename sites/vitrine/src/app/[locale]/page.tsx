'use client';

import FadeIn from "@/components/animations/FadeIn";
import PhoneMockup from "@/components/ui/PhoneMockup";
import { useTranslations } from 'next-intl';
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const t = useTranslations('Hero');
  const tProblem = useTranslations('Problem');
  const tVision = useTranslations('Vision');
  const tAudience = useTranslations('Audience');
  const tEngagement = useTranslations('Engagement');
  const tFooter = useTranslations('Footer');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-gradient-radial from-slate-50 to-white">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-primary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <FadeIn className="z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200 backdrop-blur-sm text-slate-600 text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            {t('status')}
          </div>
          <div className="mb-10 relative">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-premium leading-tight">
              {t('title_start')} <br className="hidden md:block" /> {t('title_end')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="#waitlist" className="group px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-0.5">
              {t('cta_waitlist')}
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link href="#vision" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all shadow-sm hover:shadow-md">
              {t('cta_vision')}
            </Link>
          </div>
        </FadeIn>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-400 opacity-60">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="w-full py-24 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto">
            <FadeIn>
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-slate-900">
                {tProblem('title')}
                </h2>
            </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { title: tProblem('card1_title'), icon: "📱", desc: tProblem('card1_desc') },
              { title: tProblem('card2_title'), icon: "🔒", desc: tProblem('card2_desc') },
              { title: tProblem('card3_title'), icon: "🤯", desc: tProblem('card3_desc') }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                  <div className="h-full p-8 rounded-3xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all duration-300 group">
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 transform origin-left">{item.icon}</div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / Vision */}
      <section id="vision" className="w-full py-24 px-4 bg-slate-950 text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <FadeIn className="text-left">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        {tVision('title')}
                    </h2>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        {tVision('description')}
                    </p>
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{tVision('feat1_title')}</h3>
                                <p className="text-slate-400 text-sm mt-1">{tVision('feat1_desc')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-secondary-500/10 text-secondary-400 border border-secondary-500/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{tVision('feat2_title')}</h3>
                                <p className="text-slate-400 text-sm mt-1">{tVision('feat2_desc')}</p>
                            </div>
                        </div>
                    </div>
                </FadeIn>
                
                {/* 3D Phone Mockup */}
                <FadeIn delay={0.3} className="flex justify-center perspective-1000">
                    <PhoneMockup className="transform rotate-y-6 rotate-z-2 shadow-2xl hover:scale-105 transition-transform duration-500 ring-1 ring-white/10">
                        {/* Mockup Content */}
                        <div className="flex flex-col h-full bg-slate-950 text-white select-none cursor-default">
                            {/* Header */}
                            <div className="p-4 pt-12 flex justify-between items-center border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
                                <span className="font-bold text-lg">{tVision('mockup_app_name')}</span>
                                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-300">N</div>
                            </div>
                            {/* Chat List */}
                            <div className="flex-1 p-4 space-y-3 overflow-hidden">
                                <div className="flex gap-3 items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs">🎓</div>
                                    <div className="flex-1">
                                        <div className="h-2 w-20 bg-slate-700 rounded mb-2"></div>
                                        <div className="h-2 w-32 bg-slate-800 rounded"></div>
                                    </div>
                                    <span className="text-xs text-slate-500">12:30</span>
                                </div>
                                <div className="flex gap-3 items-center p-3 rounded-xl bg-gradient-to-r from-secondary-500/10 to-transparent border border-secondary-500/20">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-xs">🌸</div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-secondary-300 mb-1">{tVision('mockup_chat1_name')}</div>
                                        <div className="text-xs text-slate-400">{tVision('mockup_chat1_msg')}</div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-secondary-500"></div>
                                </div>
                                <div className="flex gap-3 items-center p-3 rounded-xl bg-white/5 border border-white/5 opacity-60">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs">🚌</div>
                                    <div className="flex-1">
                                        <div className="h-2 w-16 bg-slate-700 rounded mb-2"></div>
                                        <div className="h-2 w-24 bg-slate-800 rounded"></div>
                                    </div>
                                </div>
                                 <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                                    <div className="text-xs text-slate-500 mb-2">{tVision('mockup_mini_apps')}</div>
                                    <div className="flex justify-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20"></div>
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20"></div>
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/20"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Bottom Nav */}
                            <div className="p-4 border-t border-white/5 flex justify-around text-slate-500">
                                <div className="text-primary-400">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                                </div>
                                <div>
                                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                                </div>
                                <div>
                                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
                                </div>
                            </div>
                        </div>
                    </PhoneMockup>
                </FadeIn>
            </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="w-full py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
            <FadeIn>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{tAudience('title')}</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">{tAudience('subtitle')}</p>
                </div>
            </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={0.1} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary-200 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-6 bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center text-primary-600 group-hover:rotate-12 transition-transform duration-300">🎓</div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">{tAudience('card1_title')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{tAudience('card1_desc')}</p>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-secondary-200 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
               <div className="relative z-10">
                <div className="text-4xl mb-6 bg-secondary-100 w-16 h-16 rounded-2xl flex items-center justify-center text-secondary-600 group-hover:rotate-12 transition-transform duration-300">🌸</div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">{tAudience('card2_title')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{tAudience('card2_desc')}</p>
               </div>
            </FadeIn>
            
            <FadeIn delay={0.3} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-slate-300 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                <div className="relative z-10">
                    <div className="text-4xl mb-6 bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center text-slate-700 group-hover:rotate-12 transition-transform duration-300">💼</div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{tAudience('card3_title')}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{tAudience('card3_desc')}</p>
                </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="w-full py-24 px-4 bg-white">
        <FadeIn className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-premium p-1 shadow-2xl skew-y-1">
            <div className="bg-white rounded-[2.4rem] p-10 md:p-20 text-center -skew-y-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-900">{tEngagement('title')}</h2>
            <div className="grid md:grid-cols-3 gap-12">
                <div className="flex flex-col items-center">
                    <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-primary-400 mb-4">100%</div>
                    <div className="text-lg font-bold text-slate-900 mb-2">{tEngagement('stat1_label')}</div>
                    <p className="text-slate-500 text-sm">{tEngagement('stat1_sub')}</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-secondary-500 to-secondary-400 mb-4">0</div>
                    <div className="text-lg font-bold text-slate-900 mb-2">{tEngagement('stat2_label')}</div>
                    <p className="text-slate-500 text-sm">{tEngagement('stat2_sub')}</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="text-5xl font-extrabold text-slate-800 mb-4">Open</div>
                    <div className="text-lg font-bold text-slate-900 mb-2">{tEngagement('stat3_label')}</div>
                    <p className="text-slate-500 text-sm">{tEngagement('stat3_sub')}</p>
                </div>
            </div>
            </div>
        </FadeIn>
      </section>

        {/* Project Status & Partners */}
        <section className="w-full py-24 px-4 bg-slate-50 border-t border-slate-200">
            <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold mb-8 border border-emerald-200">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    {tFooter('incubated')}
                </div>
                <h2 className="text-3xl font-bold mb-6 text-slate-900">{tFooter('supported')}</h2>
                <p className="text-slate-600 mb-16 text-lg max-w-2xl mx-auto">
                    {tFooter('description')}
                </p>
                
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="w-40 h-20 relative hover:scale-105 transition-transform"><Image src="/partners/university.svg" alt="Université" fill className="object-contain" /></div>
                    <div className="w-40 h-20 relative hover:scale-105 transition-transform"><Image src="/partners/city.svg" alt="Métropole" fill className="object-contain" /></div>
                    <div className="w-40 h-20 relative hover:scale-105 transition-transform"><Image src="/partners/association.svg" alt="Associations" fill className="object-contain" /></div>
                </div>
            </FadeIn>
            </div>
        </section>

      {/* Footer */}
      <footer className="w-full py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">I</div>
            <span className="font-bold text-slate-900 text-xl tracking-tight">ImuChat</span>
          </div>
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {tFooter('copyright')}
          </div>
          <div className="flex gap-8 text-slate-400">
            <a href="#" className="hover:text-primary-600 hover:scale-110 transition-all duration-300">Twitter</a>
            <a href="#" className="hover:text-primary-600 hover:scale-110 transition-all duration-300">LinkedIn</a>
            <a href="#" className="hover:text-primary-600 hover:scale-110 transition-all duration-300">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
