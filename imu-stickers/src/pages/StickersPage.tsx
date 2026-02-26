import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/providers/I18nProvider';
import { Grid3X3, Package, Sticker, TrendingUp } from 'lucide-react';

export default function StickersPage() {
  const t = useTranslations('StickersPage');

  const sections = [
    { icon: Package, label: t('myPacks'), color: 'text-pink-400' },
    { icon: TrendingUp, label: t('trending'), color: 'text-yellow-400' },
    { icon: Grid3X3, label: t('categories'), color: 'text-cyan-400' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Sticker className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('description')}</p>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        {/* Placeholder sticker grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('trending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center text-2xl hover:bg-muted transition-colors cursor-pointer"
                >
                  {['😀', '🎉', '❤️', '🔥', '✨', '🎭', '🌸', '🎮', '🎵', '🌈', '⭐', '💎', '🦊', '🐱', '🎨', '💫'][i]}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
