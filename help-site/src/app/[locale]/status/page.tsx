'use client';

import { AlertTriangle, ArrowLeft, Bell, CheckCircle, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

// Mock service status data - in production, this would come from an API
const services = [
  { key: 'messaging', status: 'operational' as const },
  { key: 'voiceCalls', status: 'operational' as const },
  { key: 'videoCalls', status: 'operational' as const },
  { key: 'alice', status: 'operational' as const },
  { key: 'store', status: 'operational' as const },
  { key: 'office', status: 'operational' as const },
  { key: 'pay', status: 'operational' as const },
  { key: 'api', status: 'operational' as const },
];

type ServiceStatus = 'operational' | 'degraded' | 'down';

function getStatusIcon(status: ServiceStatus) {
  switch (status) {
    case 'operational':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'degraded':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'down':
      return <XCircle className="w-5 h-5 text-red-500" />;
  }
}

function getStatusColor(status: ServiceStatus) {
  switch (status) {
    case 'operational':
      return 'bg-green-100 text-green-800';
    case 'degraded':
      return 'bg-yellow-100 text-yellow-800';
    case 'down':
      return 'bg-red-100 text-red-800';
  }
}

function getOverallStatus(services: { status: ServiceStatus }[]) {
  if (services.some(s => s.status === 'down')) return 'majorOutage';
  if (services.some(s => s.status === 'degraded')) return 'partialOutage';
  return 'allOperational';
}

export default function StatusPage() {
  const t = useTranslations('statusPage');
  const overallStatus = getOverallStatus(services);
  const lastUpdated = new Date().toLocaleString();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-lg text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Overall Status Banner */}
        <div className={`rounded-xl p-6 mb-8 ${
          overallStatus === 'allOperational' 
            ? 'bg-green-50 border border-green-200' 
            : overallStatus === 'partialOutage'
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center justify-center gap-3">
            {overallStatus === 'allOperational' && <CheckCircle className="w-8 h-8 text-green-500" />}
            {overallStatus === 'partialOutage' && <AlertTriangle className="w-8 h-8 text-yellow-500" />}
            {overallStatus === 'majorOutage' && <XCircle className="w-8 h-8 text-red-500" />}
            <span className={`text-xl font-semibold ${
              overallStatus === 'allOperational' 
                ? 'text-green-700' 
                : overallStatus === 'partialOutage'
                ? 'text-yellow-700'
                : 'text-red-700'
            }`}>
              {t(overallStatus)}
            </span>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="divide-y divide-gray-100">
            {services.map((service) => (
              <div key={service.key} className="flex items-center justify-between px-6 py-4">
                <span className="font-medium text-gray-900">
                  {t(`services.${service.key}`)}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                    {t(service.status)}
                  </span>
                  {getStatusIcon(service.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-gray-500 text-sm mb-8">
          {t('lastUpdated')}: {lastUpdated}
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('recentIncidents')}</h2>
          <p className="text-gray-500">{t('noIncidents')}</p>
        </div>

        {/* Subscribe Button */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            <Bell className="w-5 h-5" />
            {t('subscribe')}
          </button>
        </div>
      </div>
    </main>
  );
}
