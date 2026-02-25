
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, Star } from 'lucide-react';
import type { Submission } from '@/lib/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/providers/I18nProvider';
interface SubmissionCardProps {
    submission: Submission;
    index: number;
}

export function SubmissionCard({ submission, index }: SubmissionCardProps) {
    const t = useTranslations("ContestsPage.detail.submissionCard");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSetRating = (newRating: number) => {
        if (rating > 0) return; // Prevent changing the vote
        setRating(newRating);
        // In a real app, you would send this rating to your backend here.
    };

    const handleSetHoverRating = (newHoverRating: number) => {
        if (rating > 0) return; // Prevent hover effects after voting
        setHoverRating(newHoverRating);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="h-full"
        >
            <Card className="overflow-hidden group h-full flex flex-col">
                <div className="relative aspect-square">
                    <img 
                        src={submission.imageUrl}
                        alt={submission.title}
                        
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="contest submission art"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2 left-2 flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-background/50">
                            <AvatarImage src={submission.authorAvatar} />
                            <AvatarFallback>{submission.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-white text-sm font-semibold drop-shadow-md">{submission.authorName}</span>
                    </div>
                     <div className="absolute bottom-2 right-2 text-white text-xs font-bold flex items-center gap-1 drop-shadow-md bg-black/50 p-1 rounded-md">
                        <Heart className="h-3 w-3 fill-white" />
                        {submission.votes}
                    </div>
                </div>
                 <CardContent className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold line-clamp-2">{submission.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Total votes: {submission.votes}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        'h-5 w-5 transition-colors',
                                        rating === 0 && 'cursor-pointer',
                                        (hoverRating || rating) > i ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'
                                    )}
                                    onMouseEnter={() => handleSetHoverRating(i + 1)}
                                    onMouseLeave={() => handleSetHoverRating(0)}
                                    onClick={() => handleSetRating(i + 1)}
                                />
                            ))}
                        </div>
                         <Button variant="ghost" size="sm">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {t('comment')}
                        </Button>
                    </div>
                 </CardContent>
            </Card>
        </motion.div>
    )
}
