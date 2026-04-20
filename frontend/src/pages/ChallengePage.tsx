// pages/ChallengePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, Trophy, PencilIcon, CheckCircleIcon, Archive, Code2, TriangleAlert } from 'lucide-react';

import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';

import { useToast } from '../providers/MessageProvider';
import { getChallenge } from '../api/tasks';
import { Tasks } from '../types/tasks';
import { cn } from '../lib/cn';

import CodeChallengeView from '../components/challenges/CodeChallengeView';
import QuizChallengeView from '../components/challenges/QuizChallengeView';

export default function ChallengePage() {
    const { challengeId } = useParams<{ challengeId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [challenge, setChallenge] = useState<Tasks | null>(null);
    const [loading, setLoading] = useState(true);

    const loadChallenge = async () => {
        if (!challengeId) return;
        try {
            const data = await getChallenge(Number(challengeId));
            setChallenge(data);
        } catch (err) {
            showToast('error', 'Error', 'Can\'t load the data!');
            navigate('/challenges');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChallenge();
    }, []);


    // Визначення кольору складності
    const difficultyLower = (challenge?.difficulty || 'medium').toLowerCase();

    const difficultyColor = {
        easy: 'text-green-500 bg-green-500/10',
        medium: 'text-yellow-500 bg-yellow-500/10',
        hard: 'text-red-500 bg-red-500/10',
    } as const;

    const colorClass = difficultyColor[difficultyLower as keyof typeof difficultyColor] || 'text-gray-500 bg-gray-500/10';


    const getStatusIcon = (status: string) => {
        switch (status) {
            case "draft":
                return <PencilIcon className="w-4 h-4 text-gray-500" />;
            case "published":
                return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
            case "archived":
                return <Archive className="w-4 h-4 text-yellow-500" />;
            default:
                return null;
        }
    };
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "code":
                return <Code2 className="w-4 h-4 text-blue-400" />;
            case "quiz":
                return <CheckCircleIcon className="w-4 h-4 text-indigo-400" />;
            default:
                return null;
        }
    };


    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size={24} text='Loading task...' /></div>;
    }

    if (!challenge) {
        return <div className="text-center py-20 text-red-400">Task not found!</div>;
    }

    // Універсальний рендер в залежності від типу
    const renderChallenge = () => {
        switch (challenge.c_type) {
            case 'code':
                return <CodeChallengeView challenge={challenge} />;
            case 'quiz':
                return <QuizChallengeView challenge={challenge} />;
            default:
                return (
                    <div className="flex items-center gap-4 text-xl text-center py-20 text-yellow-400">
                        <TriangleAlert className="w-5 h-5" />
                        Unknown task type: {challenge.c_type}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className='flex gap-2'>
                    <Button size='icon'
                        variant="btn_glass" 
                        onClick={() => navigate(-1)}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="btn_glass" 
                        onClick={() => navigate("/challenges/")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Challenges
                    </Button>
                </div>

                <div className="pr-2 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-amber-400">
                        <Trophy className="w-5 h-5" />
                        <span className="font-medium">{challenge.points} pts</span>
                    </div>
                    <div className={cn("px-3 py-1 text-xs font-medium rounded-full", colorClass)}>
                        {challenge.difficulty.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-medium">
                            ({getStatusIcon(challenge.status)}
                            {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                        </span>
                        <span>|</span>
                        <span className='flex items-center gap-1'>
                            <p className="flex items-center gap-1 text-sm nz-text-muted">
                                {getTypeIcon(challenge.c_type)}
                                {challenge.c_type.toUpperCase()}
                            </p>)
                        </span>
                    </div>
                </div>
            </div>

            {/* Основний контент залежно від типу */}
            {renderChallenge()}
        </div>
    );
}