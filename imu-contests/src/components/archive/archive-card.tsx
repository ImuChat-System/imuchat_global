
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Contest } from '@/lib/types';
import { motion } from 'framer-motion';
import { MOCK_SUBMISSIONS } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Eye } from 'lucide-react';

interface ArchiveCardProps {
    contest: Contest;
}

export function ArchiveCard({ contest }: ArchiveCardProps) {

  // Mock finding a winner
  const winner = MOCK_SUBMISSIONS.find(s => s.contestId === contest.id);

  const formattedEndDate = new Date(contest.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full overflow-hidden shadow-md group transition-shadow dark:hover:shadow-glow-night light:hover:bg-accent/50">
        <CardHeader className="p-0 relative">
            <div className="aspect-video relative">
              <img                 src={contest.thumbnailUrl}
                alt={contest.title}
                
                className="object-cover"
                data-ai-hint="contest banner art"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
               <Badge
                variant='outline'
                className="absolute top-2 right-2 z-10 capitalize bg-background/70 backdrop-blur-sm"
              >
                {formattedEndDate}
              </Badge>
            </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 space-y-2">
          <CardTitle className="line-clamp-2 text-base font-bold">{contest.title}</CardTitle>
           {winner && (
              <div className="flex items-center gap-3 pt-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                          <AvatarImage src={winner.authorAvatar} />
                          <AvatarFallback>{winner.authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="text-sm font-bold">Winner: {winner.authorName}</p>
                          <p className="text-xs text-muted-foreground">{winner.title}</p>
                      </div>
                  </div>
              </div>
            )}
        </CardContent>
        <CardFooter>
          <Button variant="secondary" className="w-full">
            <Eye className="mr-2 h-4 w-4" />
            View Submissions
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
