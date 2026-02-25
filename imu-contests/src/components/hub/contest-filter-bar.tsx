
import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';
import { useTranslations } from '@/providers/I18nProvider';
import { Separator } from '@/components/ui/separator';

interface ContestFilterBarProps {
  activeStatus: string;
  setActiveStatus: (status: string) => void;
  activeType: string;
  setActiveType: (type: string) => void;
}

export function ContestFilterBar({ activeStatus, setActiveStatus, activeType, setActiveType }: ContestFilterBarProps) {
  const t = useTranslations('ContestsPage.filters');

  const statusFilters = ['all', 'active', 'upcoming', 'closed'];
  const typeFilters = ['all', 'art', 'code', 'quiz', 'video', 'writing'];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((status) => (
          <Button
            key={status}
            variant={activeStatus === status ? 'default' : 'outline'}
            onClick={() => setActiveStatus(status)}
            size="sm"
            className="capitalize"
          >
            {t(status)}
          </Button>
        ))}
        <Separator orientation="vertical" className="h-6 mx-2" />
        {typeFilters.map((type) => (
          <Button
            key={type}
            variant={activeType === type ? 'secondary' : 'ghost'}
            onClick={() => setActiveType(type)}
            size="sm"
            className="capitalize"
          >
            {t(type)}
          </Button>
        ))}
      </div>
    </div>
  );
}
