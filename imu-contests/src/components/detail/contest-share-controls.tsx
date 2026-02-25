
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, QrCode, Twitter, Share2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/providers/I18nProvider';
export function ContestShareControls() {
    const { toast } = useToast();
    const t = useTranslations('MusicPanel'); // Re-using translations for now

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: t('toast.linkCopiedTitle'),
            description: "The contest link has been copied to your clipboard.",
        });
    }

    return (
        <Card className="bg-muted/50">
            <CardContent className="p-2">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-semibold mr-4">Share this contest:</span>
                    <Button variant="ghost" size="sm" onClick={copyLink}>
                        <a className="h-4 w-4 mr-2" />
                        {t('copyLink')}
                    </Button>
                    <Button variant="ghost" size="sm">
                        <QrCode className="h-4 w-4 mr-2" />
                        {t('showQrCode')}
                    </Button>
                     <Button variant="ghost" size="sm">
                        <Twitter className="h-4 w-4 mr-2" />
                        {t('shareOnX')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
