
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Contest } from '@/lib/types';
import { useTranslations } from '@/providers/I18nProvider';
import { Info, Upload, Medal, MessageSquare } from 'lucide-react';
import { SubmissionGrid } from './submission-grid';

interface ContestTabsProps {
  contest: Contest;
}

export function ContestTabs({ contest }: ContestTabsProps) {
    const t = useTranslations('ContestsPage.detail.tabs');

    return (
        <Tabs defaultValue="submissions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info"><Info className="mr-2 h-4 w-4" />{t('info')}</TabsTrigger>
                <TabsTrigger value="submissions"><Upload className="mr-2 h-4 w-4" />{t('submissions')}</TabsTrigger>
                <TabsTrigger value="leaderboard"><Medal className="mr-2 h-4 w-4" />{t('leaderboard')}</TabsTrigger>
                <TabsTrigger value="discussion"><MessageSquare className="mr-2 h-4 w-4" />{t('discussion')}</TabsTrigger>
            </TabsList>
            <TabsContent value="info">
                <Card className="mt-4">
                <CardHeader>
                    <CardTitle>{t('info')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Detailed contest information, rules, and FAQ will be displayed here.</p>
                </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="submissions">
                <SubmissionGrid />
            </TabsContent>
            <TabsContent value="leaderboard">
                 <Card className="mt-4">
                <CardHeader>
                    <CardTitle>{t('leaderboard')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The leaderboard with top submissions will be displayed here.</p>
                </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="discussion">
                 <Card className="mt-4">
                <CardHeader>
                    <CardTitle>{t('discussion')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>A dedicated chat or forum for this contest will be displayed here.</p>
                </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

    