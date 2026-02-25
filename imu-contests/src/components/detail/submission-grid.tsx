
import { MOCK_SUBMISSIONS } from '@/lib/data';
import { SubmissionCard } from './submission-card';

export function SubmissionGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {MOCK_SUBMISSIONS.map((submission, index) => (
                <SubmissionCard key={submission.id} submission={submission} index={index} />
            ))}
        </div>
    )
}

    