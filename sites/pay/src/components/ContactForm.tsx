'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('Contact.form');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: 'wallet', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  if (success) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--color-primary)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="font-semibold text-lg mb-2" style={{ color: 'var(--color-primary)' }}>{t('success')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>{t('name')}</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
            style={{
              background: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>{t('email')}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
            style={{
              background: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>{t('subject')}</label>
        <select
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
          style={{
            background: 'var(--color-bg-alt)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          {(['wallet', 'cards', 'payments', 'imucoins', 'invest', 'merchants', 'security', 'other'] as const).map((s) => (
            <option key={s} value={s}>{t(`subjects.${s}`)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>{t('message')}</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 resize-none"
          style={{
            background: 'var(--color-bg-alt)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
      </div>

      <button type="submit" className="py-btn-primary w-full text-center">
        {t('submit')}
      </button>
    </form>
  );
}
