
import { useState } from 'react';
import { useTranslations } from '@/providers/I18nProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Archive } from 'lucide-react';
import { MOCK_CONTESTS } from '@/lib/data';
import { FeaturedContestCarousel } from '@/components/hub/featured-contest-carousel';
import { ContestFilterBar } from '@/components/hub/contest-filter-bar';
import { ContestCard } from '@/components/hub/contest-card';
import { CallToActionCreateContest } from '@/components/hub/call-to-action-create-contest';
import { Button } from '@/components/ui/button';
interface HubProps {
  onNavigate: (path: string) => void;
  currentRoute: string;
  onBack: () => void;
}

export default function ImuContestsHub({ onNavigate, currentRoute, onBack }: HubProps) {
  const t = useTranslations('ContestsPage');
const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeType, setActiveType] = useState('all');

  const filteredContests = MOCK_CONTESTS.filter(contest => {
    if (contest.status === 'closed') return false; // Exclude closed from main view
    const statusMatch = activeStatus === 'all' || contest.status === activeStatus;
    const typeMatch = activeType === 'all' || contest.type === activeType;
    return statusMatch && typeMatch;
  });

  return (
    <>
<div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 bg-background/90">
        <p className="text-muted-foreground">{t('description')}</p>

        <FeaturedContestCarousel />

        <ContestFilterBar
          activeStatus={activeStatus}
          setActiveStatus={setActiveStatus}
          activeType={activeType}
          setActiveType={setActiveType}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-[420px] rounded-lg" />
            ))
          ) : (
            filteredContests.map((contest, index) => (
              <ContestCard key={contest.id} contest={contest} index={index} />
            ))
          )}
        </div>

        <CallToActionCreateContest />
      </div>
</>
  );
}
