
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Autoplay from "embla-carousel-autoplay"
import { MOCK_CONTESTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/use-navigation';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/providers/I18nProvider';
const featuredItems = MOCK_CONTESTS.filter(p => p.status === 'active');

export function FeaturedContestCarousel() {
  const { pathname } = useNavigation();
  const t = useTranslations('ContestsPage');

  return (
    <Carousel 
        className="w-full"
        opts={{ loop: true, }}
        plugins={[
            Autoplay({
              delay: 7000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
        ]}
    >
      <CarouselContent>
        {featuredItems.map((item) => (
          <CarouselItem key={item.id}>
            <div className="p-1">
              <Card className="overflow-hidden">
                <CardContent className="relative flex aspect-[2/1] items-center justify-center p-0 md:aspect-[3/1]">
                  <img src={item.thumbnailUrl} alt={item.title} data-ai-hint="contest art"  className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 text-white w-full flex justify-between items-end">
                    <div className="max-w-xl">
                        <Badge variant="destructive" className="mb-2">Contest of the Month</Badge>
                        <h3 className="text-2xl font-bold">{item.title}</h3>
                        <p className="text-white/80 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <Button asChild size="lg">
                        <a href={`/contests/${item.id}`}>
                            {t('card.view')}
                        </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  )
}
