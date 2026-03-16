'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle } from 'lucide-react';

const PLATFORMS = ['YouTube', 'TikTok', 'Instagram', 'Twitch', 'Twitter/X', 'Autre'];
const CONTENT_TYPES = [
  'Vidéo courte',
  'Vidéo longue',
  'Live streaming',
  'Art & illustration',
  'Musique',
  'Éducation',
  'Gaming',
  'Autre',
];

export function ApplyForm() {
  const t = useTranslations('apply');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    pseudo: '',
    platforms: [] as string[],
    contentType: '',
    subscribers: '',
    motivation: '',
  });

  if (submitted) {
    return (
      <div className="cr-card text-center py-10">
        <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {t('formSuccess')}
        </h3>
        <p style={{ color: 'var(--color-muted)' }}>{t('formMotivationPlaceholder')}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="cr-card space-y-5 max-w-2xl mx-auto"
    >
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--color-text)' }}
        >
          {t('formHandle')}
        </label>
        <input
          required
          value={form.pseudo}
          onChange={(e) => setForm((f) => ({ ...f, pseudo: e.target.value }))}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          placeholder={t('formHandlePlaceholder')}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          {t('formPlatforms')}
        </label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: form.platforms.includes(p)
                  ? 'rgba(236,72,153,0.15)'
                  : 'var(--color-bg)',
                border: `1px solid ${
                  form.platforms.includes(p) ? 'var(--color-primary)' : 'var(--color-border)'
                }`,
                color: form.platforms.includes(p)
                  ? 'var(--color-primary)'
                  : 'var(--color-muted)',
              }}
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  platforms: f.platforms.includes(p)
                    ? f.platforms.filter((x) => x !== p)
                    : [...f.platforms, p],
                }))
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--color-text)' }}
        >
          {t('formContentType')}
        </label>
        <select
          required
          value={form.contentType}
          onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value }))}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          <option value="">— {t('formContentTypePlaceholder')} —</option>
          {CONTENT_TYPES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--color-text)' }}
        >
          {t('formSubscribers')}
        </label>
        <input
          type="number"
          min="0"
          value={form.subscribers}
          onChange={(e) => setForm((f) => ({ ...f, subscribers: e.target.value }))}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          placeholder={t('formSubscribersPlaceholder')}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--color-text)' }}
        >
          {t('formMotivation')}
        </label>
        <textarea
          rows={4}
          value={form.motivation}
          onChange={(e) => setForm((f) => ({ ...f, motivation: e.target.value }))}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          placeholder={t('formMotivationPlaceholder')}
        />
      </div>
      <button type="submit" className="w-full cr-btn-primary py-3 text-base">
        {t('formSubmit')}
      </button>
    </form>
  );
}
