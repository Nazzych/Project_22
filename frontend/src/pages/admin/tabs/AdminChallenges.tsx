import React from 'react';
import { Plus, PlusSquare, Edit2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useModal } from '../../../hooks/useModal';
import { ChallangeManage } from '../../../components/shared/modal/modals/admin/ChallangeManage';
import { useChallenges } from '../hooks/useChallenges';
import ChallengeFilters from '../components/challanges/ChallengeFilters';
import ChallengeGrid from '../components/challanges/ChallengeGrid';

export default function AdminChallenges() {
    const { openModal } = useModal();
    const challenges = useChallenges();

    const OpenAddChallange = () => {
        openModal({
            id: 'admin-challange',
            width: "xl",
            x: false,
            title: (
                <div className="w-fit nz-background-secondary rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                    <PlusSquare className="h-5 w-5" />Add Challange
                </div>
            ),
            content: (
                <ChallangeManage 
                    onSuccess={challenges.loadTasks}
                />
            ),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
                <ChallengeFilters 
                    search={challenges.search}
                    setSearch={challenges.setSearch}
                    difficulty={challenges.difficulty}
                    setDifficulty={challenges.setDifficulty}
                    language={challenges.language}
                    setLanguage={challenges.setLanguage}
                    clearFilters={challenges.clearFilters}
                    filtersActive={challenges.filtersActive}
                />

                <div className="flex flex-col items-start lg:items-end gap-2">
                    <Button size="sm" onClick={OpenAddChallange} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Challenge
                    </Button>
                    <p className="text-sm nz-text-muted">
                        Total: <span className="font-bold nz-text-secondary">{challenges.filteredTasks.length}</span> {challenges.filteredTasks.length === 1 ? 'challenge' : 'challenges'}
                    </p>
                </div>
            </div>

            <ChallengeGrid 
                tasks={challenges.filteredTasks}
                loading={challenges.loading}
            />
        </div>
    );
}