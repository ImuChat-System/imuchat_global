import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/providers/I18nProvider';
import { useImuChat } from '@/providers/ImuChatProvider';
import { AlertTriangle, BarChart3, Settings, Shield, Users } from 'lucide-react';

export default function AdminPage() {
  const t = useTranslations('AdminPage');
  const { user } = useImuChat();

  const sections = [
    { icon: Users, label: t('users'), color: 'text-blue-400' },
    { icon: Settings, label: t('settings'), color: 'text-green-400' },
    { icon: BarChart3, label: t('analytics'), color: 'text-purple-400' },
    { icon: AlertTriangle, label: t('moderation'), color: 'text-orange-400' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('description')}</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((section) => (
            <Card key={section.label} className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <section.icon className={`h-5 w-5 ${section.color}`} />
                <CardTitle className="text-lg">{section.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t('comingSoon')}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Info */}
        {user && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground text-center">
                Logged in as <span className="font-medium text-foreground">{user.displayName}</span>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
