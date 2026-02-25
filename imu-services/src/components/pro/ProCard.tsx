
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ShieldCheck, Heart, Eye, Briefcase } from 'lucide-react';
import type { Professional } from '@/lib/types';
import { useNavigation } from '@/hooks/use-navigation';
import { useTranslations } from '@/providers/I18nProvider';
interface ProCardProps {
    pro: Professional;
}

export function ProCard({ pro }: ProCardProps) {
    const { pathname } = useNavigation();
    const t = useTranslations('ServicesPage.pro_detail.header');
    
    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 grid grid-cols-12 gap-4 items-center">
                 <div className="col-span-12 md:col-span-2 flex justify-center">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={pro.avatar} alt={pro.name} />
                        <AvatarFallback>{pro.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="col-span-12 md:col-span-6 text-center md:text-left">
                    <h3 className="font-bold text-lg">{pro.name}</h3>
                    <p className="text-sm text-primary font-semibold">{pro.trade}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                        <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-bold">{pro.rating}</span>
                            <span className="text-xs text-muted-foreground">({pro.reviewCount})</span>
                        </div>
                        {pro.isVerified && <Badge variant="secondary" className="gap-1.5 bg-green-100 text-green-800 border-green-200"><ShieldCheck className="h-3 w-3" />{t('verified')}</Badge>}
                    </div>
                </div>
                 <div className="col-span-12 md:col-span-4 flex flex-col items-center md:items-end gap-2">
                     <p className="font-bold text-lg">{pro.rate}</p>
                     <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                           <a href={`/services/pro/${pro.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t('view')}
                            </a>
                        </Button>
                        <Button size="sm" asChild>
                           <a href={`/services/book`}>
                                <Briefcase className="mr-2 h-4 w-4" />
                                {t('book')}
                            </a>
                        </Button>
                     </div>
                </div>
            </CardContent>
        </Card>
    );
}

