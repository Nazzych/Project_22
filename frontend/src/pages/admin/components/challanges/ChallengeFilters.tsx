import React from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';

interface ChallengeFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    difficulty: string;
    setDifficulty: (value: string) => void;
    language: string;
    setLanguage: (value: string) => void;
    clearFilters: () => void;
    filtersActive: boolean;
}

export default function ChallengeFilters({
    search,
    setSearch,
    difficulty,
    setDifficulty,
    language,
    setLanguage,
    clearFilters,
    filtersActive,
}: ChallengeFiltersProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-fit nz-background-secondary rounded-2xl p-4">
            <div className="flex-1 relative">
                <Input
                    placeholder="Search challenges or tags..."
                    icon={<Search className="h-4 w-4" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Select
                className="w-full lg:w-[160px] nz-background-primary rounded-xl"
                placeholder="Difficulty"
                options={[
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' },
                ]}
                value={difficulty}
                onChange={setDifficulty}
            />

            <Select
                className="w-full lg:w-[160px] nz-background-primary rounded-xl"
                placeholder="Language"
                options={[
                    { value: 'javascript', label: 'JavaScript' },
                    { value: 'typescript', label: 'TypeScript' },
                    { value: 'python', label: 'Python' },
                    { value: 'java', label: 'Java' },
                ]}
                value={language}
                onChange={setLanguage}
            />

            {filtersActive && (
                <Button
                    variant="btn_glass"
                    size="icon"
                    onClick={clearFilters}
                    title="Clear filters"
                    className='w-full lg:w-fit lg:px-3'
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}