
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/providers/I18nProvider';
export function AvailabilityScheduler() {
    const t = useTranslations('ServicesPage.pro_detail.availability');
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">{t('placeholder')}</p>
                </div>
            </CardContent>
        </Card>
    );
}
