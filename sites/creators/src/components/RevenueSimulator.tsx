'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function RevenueSimulator() {
  const t = useTranslations('monetization');
  const [subscribers, setSubscribers] = useState(1000);
  const [engagement, setEngagement] = useState(5);

  const subRevenue = Math.round(subscribers * 0.02 * engagement * 0.01 * 4.99 * 0.85);
  const tipsRevenue = Math.round(subscribers * engagement * 0.001 * 0.8);
  const liveRevenue = Math.round(subscribers * 0.005 * engagement * 0.01 * 20 * 0.70);
  const total = subRevenue + tipsRevenue + liveRevenue;

  return (
    <div className="cr-card max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--color-text)' }}>
        {t('simulatorTitle')}
      </h3>
      <div className="space-y-5 mb-8">
        <div>
          <label
            className="flex justify-between text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            <span>{t('subscribers')}</span>
            <span className="text-gradient-cr font-bold">{subscribers.toLocaleString('en-US')}</span>
          </label>
          <input
            type="range"
            min={100}
            max={50000}
            step={100}
            value={subscribers}
            onChange={(e) => setSubscribers(Number(e.target.value))}
            className="w-full accent-pink-500"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
            <span>100</span>
            <span>50 000</span>
          </div>
        </div>
        <div>
          <label
            className="flex justify-between text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            <span>{t('engagement')}</span>
            <span className="text-gradient-cr font-bold">{engagement}%</span>
          </label>
          <input
            type="range"
            min={1}
            max={20}
            step={0.5}
            value={engagement}
            onChange={(e) => setEngagement(Number(e.target.value))}
            className="w-full accent-pink-500"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
            <span>1%</span>
            <span>20%</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: t('subscriptions'), value: subRevenue },
          { label: t('tips'), value: tipsRevenue },
          { label: t('liveGifts'), value: liveRevenue },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="text-center p-3 rounded-xl"
            style={{ background: 'rgba(236,72,153,0.06)' }}
          >
            <div className="text-lg font-bold text-gradient-cr">
              {value.toLocaleString('en-US')} €
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
      <div
        className="text-center p-5 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.15))',
          border: '1px solid rgba(236,72,153,0.3)',
        }}
      >
        <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-muted)' }}>
          {t('estimatedRevenue')}
        </div>
        <div className="text-4xl font-black text-gradient-cr">
          {total.toLocaleString('en-US')} €
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
          {t('paymentWeekly')}
        </div>
      </div>
      <p className="text-xs text-center mt-3" style={{ color: 'var(--color-muted)' }}>
        {t('simulatorDesc')}
      </p>
    </div>
  );
}
