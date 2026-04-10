import React from 'react';
import { XCircle } from 'lucide-react';
import { Skeleton } from '../../../../components/LoadingSpinner';
import { ChallengeCard } from '../../../../components/shared/cards/ChellangeCard';
import { Tasks } from '../../../../types/tasks';

interface ChallengeGridProps {
    tasks: Tasks[];
    loading: boolean;
    isStaff?: boolean;
}

export default function ChallengeGrid({ tasks, loading, isStaff = true }: ChallengeGridProps) {
    if (loading) {
        return (
            <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}>
                            <Skeleton className="h-52 w-full rounded-[18px]" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <XCircle className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No challenges found</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Try changing filters or reload the page
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tasks.map((task) => (
                <ChallengeCard
                    key={task.id}
                    challenge={task}
                    is_staff={isStaff}
                    loadChallenges={() => {}} // можна передати з хука пізніше
                />
            ))}
        </div>
    );
}