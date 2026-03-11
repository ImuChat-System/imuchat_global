'use client';

import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/ui/Container";
import {
    Building2,
    CheckCircle2,
    Code,
    Mail,
    Newspaper,
    Send,
    Users
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type ContactType = 'partnership' | 'press' | 'beta' | 'developer' | 'other';

export default function ContactPage() {
  const t = useTranslations('Contact');
  const [contactType, setContactType] = useState<ContactType>('partnership');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactTypes = [
    { id: 'partnership' as ContactType, icon: Building2, label: t('types.partnership') },
    { id: 'press' as ContactType, icon: Newspaper, label: t('types.press') },
    { id: 'beta' as ContactType, icon: Users, label: t('types.beta') },
    { id: 'developer' as ContactType, icon: Code, label: t('types.developer') },
    { id: 'other' as ContactType, icon: Mail, label: t('types.other') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Intégrer avec Firebase ou votre backend
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitted(true);
    setIsSubmitting(false);

    // Reset form après 3 secondes
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', organization: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-radial from-slate-50 to-white">
        <div className="absolute inset-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <Container>
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/80 border border-blue-200 backdrop-blur-sm text-blue-700 text-sm font-medium shadow-sm">
              <Mail className="w-4 h-4" />
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

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <Container size="lg">
          <div className="max-w-4xl mx-auto">
            {/* Contact Type Selection */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                {t('form.selectType')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {contactTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setContactType(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        contactType === type.id
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        contactType === type.id ? 'text-primary-600' : 'text-slate-600'
                      }`} />
                      <span className={`text-sm font-medium ${
                        contactType === type.id ? 'text-primary-700' : 'text-slate-700'
                      }`}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 md:p-10 shadow-lg">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {t('form.success.title')}
                  </h3>
                  <p className="text-slate-600">
                    {t('form.success.message')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                        {t('form.name')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        placeholder={t('form.namePlaceholder')}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                        {t('form.email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        placeholder={t('form.emailPlaceholder')}
                      />
                    </div>
                  </div>

                  {/* Organization (conditional) */}
                  {(contactType === 'partnership' || contactType === 'press') && (
                    <div>
                      <label htmlFor="organization" className="block text-sm font-semibold text-slate-900 mb-2">
                        {t('form.organization')} {contactType === 'partnership' && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        id="organization"
                        name="organization"
                        required={contactType === 'partnership'}
                        value={formData.organization}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        placeholder={t('form.organizationPlaceholder')}
                      />
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-900 mb-2">
                      {t('form.message')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                      placeholder={t(`form.messagePlaceholder.${contactType}`)}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('form.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t('form.submit')}
                      </>
                    )}
                  </button>

                  <p className="text-sm text-slate-500 text-center">
                    {t('form.privacy')}
                  </p>
                </form>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <Mail className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">{t('info.email.title')}</h3>
                <p className="text-sm text-slate-600">contact@imuchat.app</p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <Building2 className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">{t('info.location.title')}</h3>
                <p className="text-sm text-slate-600">{t('info.location.value')}</p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <Users className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">{t('info.response.title')}</h3>
                <p className="text-sm text-slate-600">{t('info.response.value')}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
