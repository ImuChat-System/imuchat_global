
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/providers/I18nProvider';
import { Gauge, Heart, MessageSquare, Phone, ShieldCheck, Star } from 'lucide-react';
interface ProHeaderProps {
    pro: {
        id: string;
        name: string;
        trade: string;
        rating: number;
        reviewCount: number;
        isVerified: boolean;
        isInsured: boolean;
        distance: string;
    }
}

export function ProHeader({ pro }: ProHeaderProps) {
    const t = useTranslations('ServicesPage.pro_detail.header');

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4">
                <AvatarImage src={`https://placehold.co/128x128.png`} alt={pro.name} />
                <AvatarFallback>{pro.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold">{pro.name}</h1>
                <p className="text-lg text-primary font-semibold">{pro.trade}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-bold">{pro.rating}</span> ({pro.reviewCount} {t('reviews')})
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                         <span>{t('responseTime')} : ~15 min</span>
                    </div>
                     <span>•</span>
                     <div className="flex items-center gap-1.5">
                        <Gauge className="h-4 w-4" />
                         <span>{t('interventionTime')} : ~2h</span>
                    </div>
                </div>
                 <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    {pro.isVerified && <Badge variant="secondary" className="gap-1.5 bg-green-100 text-green-800 border-green-200"><ShieldCheck className="h-4 w-4"/>{t('verified')}</Badge>}
                    {pro.isInsured && <Badge variant="secondary" className="gap-1.5 bg-blue-100 text-blue-800 border-blue-200"><ShieldCheck className="h-4 w-4"/>{t('insured')}</Badge>}
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon"><Heart className="h-5 w-5"/></Button>
                 <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4" />{t('contact')}</Button>
                <Button><Phone className="mr-2 h-4 w-4" />{t('call')}</Button>
            </div>
        </div>
    );
}
