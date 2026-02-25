
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Contest } from '@/lib/types';
import { MOCK_SUBMISSIONS } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Eye } from 'lucide-react';

interface ArchiveListItemProps {
    contest: Contest;
}

export function ArchiveListItem({ contest }: ArchiveListItemProps) {
    const winner = MOCK_SUBMISSIONS.find(s => s.contestId === contest.id);
    const formattedEndDate = new Date(contest.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });

    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-1">
                    <div className="aspect-square relative rounded-md overflow-hidden">
                        <img                             src={contest.thumbnailUrl}
                            alt={contest.title}
                            
                            className="object-cover"
                            data-ai-hint="contest banner art"
                        />
                    </div>
                </div>

                <div className="md:col-span-5">
                    <h3 className="font-bold">{contest.title}</h3>
                    <p className="text-sm text-muted-foreground">{contest.prize}</p>
                </div>

                <div className="md:col-span-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{formattedEndDate}</Badge>
                </div>

                <div className="md:col-span-3">
                    {winner && (
                         <div className="flex items-center gap-2">
                             <Crown className="h-5 w-5 text-yellow-500" />
                             <Avatar className="h-8 w-8">
                                 <AvatarImage src={winner.authorAvatar} />
                                 <AvatarFallback>{winner.authorName.charAt(0)}</AvatarFallback>
                             </Avatar>
                             <div>
                                 <p className="text-sm font-bold">{winner.authorName}</p>
                                 <p className="text-xs text-muted-foreground">{winner.title}</p>
                             </div>
                         </div>
                    )}
                </div>

                <div className="md:col-span-1 text-right">
                    <Button variant="ghost" size="icon">
                        <Eye className="h-5 w-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
