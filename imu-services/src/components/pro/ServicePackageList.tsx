
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/providers/I18nProvider';
export function ServicePackageList() {
    const t = useTranslations('ServicesPage.pro_detail.services');
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">{t('placeholder')}</p>
                </div>
            </CardContent>
        </Card>
    );
}
