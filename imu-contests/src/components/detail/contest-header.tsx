
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/use-navigation';
import type { Contest } from '@/lib/types';
import { useLocale, useTranslations } from '@/providers/I18nProvider';
import { Award, Calendar, FileText, Trophy } from 'lucide-react';
interface ContestHeaderProps {
  contest: Contest;
  onParticipateClick: () => void;
}

export function ContestHeader({ contest, onParticipateClick }: ContestHeaderProps) {
  const locale = useLocale();
  const t = useTranslations('ContestsPage');
  const tFilters = useTranslations('ContestsPage.filters');
  const tDetail = useTranslations('ContestsPage.detail');
  const { pathname } = useNavigation();
  const formatFullDate = (dateString: string) => new Date(dateString).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
        <img 
          src={contest.thumbnailUrl}
          alt={`${contest.title} banner`}
          
          className="object-cover"
          data-ai-hint="contest banner art"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white max-w-3xl">
          <Badge variant="secondary" className="mb-2">{tFilters(contest.type)}</Badge>
          <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">{contest.title}</h1>
        </div>
        <Badge variant={contest.status === 'active' ? 'default' : 'destructive'} className="absolute top-4 right-4 capitalize">
          {tFilters(contest.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-4">
          <Calendar className="h-6 w-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">{tDetail('dates.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {tDetail('dates.start', { date: formatFullDate(contest.startDate) })}
              <br/>
              {tDetail('dates.end', { date: formatFullDate(contest.endDate) })}
            </p>
          </div>
        </div>
         <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-4">
          <Trophy className="h-6 w-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">{tDetail('prize.title')}</h3>
            <p className="text-sm text-muted-foreground">{contest.prize}</p>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-4">
          <FileText className="h-6 w-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">{tDetail('rules.title')}</h3>
            <Button variant="link" className="p-0 h-auto text-sm">{tDetail('rules.view')}</Button>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-primary/10 flex items-center justify-center">
            <Button size="lg" onClick={onParticipateClick}>
                <Award className="mr-2 h-5 w-5" />
                {tDetail('participate')}
            </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">{tDetail('description.title')}</h2>
        <p className="text-muted-foreground">{contest.description}</p>
      </div>

    </div>
  );
}
