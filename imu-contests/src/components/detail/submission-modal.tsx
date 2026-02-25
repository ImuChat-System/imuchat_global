
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SubmissionForm from './submission-form';
import { useTranslations } from '@/providers/I18nProvider';
import { Loader2 } from 'lucide-react';

interface SubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    contestTitle: string;
}

export function SubmissionModal({ isOpen, onClose, onSubmit, contestTitle }: SubmissionModalProps) {
    const t = useTranslations("ContestsPage.detail.submissionForm");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This is a placeholder for the form logic.
    // In a real implementation, you would use a ref to trigger the form's submit handler.
    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        onSubmit({ title: 'My Awesome Creation', file: 'mock.png' });
        setIsSubmitting(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('submit')} — {contestTitle}</DialogTitle>
                    <DialogDescription>{t('description')}</DialogDescription>
                </DialogHeader>
                
                <SubmissionForm />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
