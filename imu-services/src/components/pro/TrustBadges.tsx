
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/providers/I18nProvider';
export function TrustBadges() {
    const t = useTranslations('ServicesPage.pro_detail.badges');
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="h-24 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">{t('placeholder')}</p>
                </div>
            </CardContent>
        </Card>
    );
}
