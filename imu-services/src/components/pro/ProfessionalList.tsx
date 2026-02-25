
import { MOCK_PROFESSIONALS } from '@/lib/data';
import { ProCard } from './ProCard';

export function ProfessionalList() {
    return (
        <div className="space-y-4">
            {MOCK_PROFESSIONALS.map(pro => (
                <ProCard key={pro.id} pro={pro} />
            ))}
        </div>
    )
}
