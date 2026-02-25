import { CategoryGrid } from '@/components/category-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/providers/I18nProvider';
import { Filter, LifeBuoy, Search } from 'lucide-react';
import { } from 'react';
function ServicesHeader({ onNavigate }: { onNavigate: (path: string) => void }) {
    const t = useTranslations('ServicesPage.header');
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input 
                    label={t('searchPlaceholder')}
                    icon={<Search />}
                    className="h-12 text-lg"
                />
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" />{t('quickFilters')}</Button>
                    <Button variant="destructive" asChild>
                        <a onClick={() => onNavigate(`/services/emergency`)}>
                            <LifeBuoy className="mr-2 h-4 w-4" />
                            {t('emergency')}
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function AISuggestions() {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Personalized Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">AI-powered suggestions for nearby, highly-rated, or previously used professionals will be here.</p>
            </CardContent>
        </Card>
    );
}

function RecommendedPros() {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Recommended Professionals</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">A hybrid list/map view of recommended professionals will be here.</p>
            </CardContent>
        </Card>
    );
}

function PartnerOffers() {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Certified Partner Offers</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Special offers from certified partners will be displayed here.</p>
            </CardContent>
        </Card>
    );
}

interface HubProps {
  onNavigate: (path: string) => void;
  currentRoute: string;
  onBack: () => void;
}

export default function ImuServicesHub({ onNavigate, currentRoute, onBack }: HubProps) {
  const t = useTranslations('ServicesPage.main');
return (
    <>
<div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <ServicesHeader onNavigate={onNavigate} />
        <CategoryGrid />
        <AISuggestions />
        <RecommendedPros />
        <PartnerOffers />
      </div>
</>
  );
}
