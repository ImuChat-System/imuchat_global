
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
const logger = { debug: console.debug, info: console.info, warn: console.warn, error: console.error };
import { Lightbulb } from 'lucide-react';
import { useTranslations } from '@/providers/I18nProvider';
export function CallToActionCreateContest() {
    const t = useTranslations('ContestsPage.cta');
    const handleCreate = () => {
        logger.debug('Open create contest modal');
    }

    return (
        <Card className="transition-all bg-card text-foreground hover:text-primary-foreground dark:hover:shadow-glow-night dark:hover:bg-hover-color-night light:hover:bg-hover-gradient">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="flex items-center gap-2">
                         <Lightbulb className="h-6 w-6 text-primary" />
                        {t('title')}
                    </CardTitle>
                    <CardDescription className="mt-2 text-inherit">
                        {t('description')}
                    </CardDescription>
                </div>
                <Button onClick={handleCreate} size="lg" variant="secondary">
                    {t('button')}
                </Button>
            </CardHeader>
        </Card>
    )
}
