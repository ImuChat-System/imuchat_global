
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
import type { Contest } from '@/lib/types';
import { useTranslations } from '@/providers/I18nProvider';
import { cn } from '@/lib/utils';

interface ContestCardProps {
  contest: Contest;
  index: number;
}

export function ContestCard({ contest, index }: ContestCardProps) {
  const t = useTranslations('ContestsPage.card');
  const tFilters = useTranslations('ContestsPage.filters');

  const formattedStartDate = new Date(contest.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const formattedEndDate = new Date(contest.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusStyles = () => {
    switch (contest.status) {
        case 'active':
            return 'bg-[#10B981] text-white border-transparent animate-pulse';
        case 'upcoming':
            return 'bg-[#F59E0B] text-white border-transparent';
        case 'closed':
            return 'bg-[#EF4444] text-white border-transparent';
        default:
            return 'bg-secondary text-secondary-foreground';
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full overflow-hidden shadow-md group transition-shadow dark:hover:shadow-glow-night light:hover:bg-accent/50">
        <CardHeader className="p-0 relative">
          <a href={`/contests/${contest.id}`}>
            <div className="aspect-video relative">
              <img                 src={contest.thumbnailUrl}
                alt={contest.title}
                
                className="object-cover"
                data-ai-hint="contest banner art"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
               <Badge
                className={cn(
                  "absolute top-2 right-2 z-10 capitalize",
                  getStatusStyles()
                )}
              >
                {tFilters(contest.status)}
              </Badge>
            </div>
          </a>
        </CardHeader>
        <CardContent className="flex-grow p-4 space-y-2">
          <Badge variant="outline" className="capitalize text-xs">{tFilters(contest.type)}</Badge>
          <CardTitle className="line-clamp-2 text-lg font-bold font-headline">{contest.title}</CardTitle>
          <CardDescription className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formattedStartDate} - {formattedEndDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{t('participants', { count: contest.participants })}</span>
            </div>
          </CardDescription>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <a href={`/contests/${contest.id}`}>
              {t('view')}
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
