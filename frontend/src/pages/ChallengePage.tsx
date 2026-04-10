import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, XCircle, Clock, Edit2, Trophy, Code2, FileText, FileCode, Users, Play, CheckCircle, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { CodeEditor } from '../components/CodeEditor';
import { useToast } from '../providers/MessageProvider';
import { getChallenge } from '../api/tasks';
import { Tasks } from '../types/tasks';
import { formatRelativeTime } from '../lib/formatDate';

export default function ChallengePage() {
    const { challengeId } = useParams<{ challengeId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [challenge, setChallenge] = useState<Tasks | null>(null);
    const [loading, setLoading] = useState(true);
    const [userCode, setUserCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const loadChallenge = async () => {
            if (!challengeId) return;
            try {
                const data = await getChallenge(Number(challengeId));
                setChallenge(data);
                setUserCode(data.starter_code || ''); // якщо є стартовий код
            } catch (err) {
                showToast('error', 'Помилка', 'Не вдалося завантажити завдання');
            } finally {
                setLoading(false);
            }
        };

        loadChallenge();
    }, [challengeId]);

    const handleSubmit = async () => {
        if (!challenge) return;

        setIsSubmitting(true);
        try {
            // const res = await submitSolution(challenge.id, userCode);
            // setResult(res);
            showToast('success', 'Вітаємо!', 'Завдання виконано успішно!');
            // if (res.success) {
            //     showToast('success', 'Вітаємо!', 'Завдання виконано успішно!');
            // } else {
            //     showToast('warning', 'Не пройшло', res.message || 'Спробуй ще раз');
            // }
        } catch (err) {
            showToast('error', 'Помилка', 'Не вдалося відправити рішення');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Визначення кольору складності
    const difficultyLower = (challenge?.difficul || 'medium').toLowerCase();

    const difficultyColor = {
        easy: 'text-green-500 bg-green-500/10',
        medium: 'text-yellow-500 bg-yellow-500/10',
        hard: 'text-red-500 bg-red-500/10',
    } as const;

    const colorClass = difficultyColor[difficultyLower as keyof typeof difficultyColor] || 'text-gray-500 bg-gray-500/10';

    const tags = challenge?.tegs
        ? challenge.tegs.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : null;


    if (loading) {
        return <div className="text-center py-20">Завантаження завдання...</div>;
    }

    if (!challenge) {
        return <div className="text-center py-20 text-red-400">Завдання не знайдено</div>;
    }

    return (
        <div className='space-y-4'>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className='flex flex-wrap gap-2'>
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

                <div className="flex items-center gap-4">
                    <div className={cn("px-3 py-1 text-xs font-medium rounded-full", colorClass)}>
                        {challenge.difficul.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400">
                        <Trophy className="w-5 h-5" />
                        <span className="font-medium">{challenge.points} pts</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ліва частина - опис завдання */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-4">{challenge.title}</h1>
                        <div className="flex items-center gap-4 text-sm nz-text-muted">
                            <span className="flex items-center gap-1">
                                <Code2 className='w-4 h-4' />
                                {challenge.language?.toUpperCase()}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatRelativeTime(challenge.created_at)}
                            </span>
                            {challenge.updated_at && (
                                <>
                                    <span>|</span>
                                    <span className="flex items-center gap-1">
                                        <Edit2 className="w-[14px] h-[14px]" />
                                        {formatRelativeTime(challenge.updated_at)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <Card size='wf'>
                        <CardContent className="p-8 prose prose-invert max-w-none">
                            <h1 className='flex items-center gap-2 text-xl font-bold mb-2'><FileText className='w-4 h-4' />Description</h1>
                            <p className="leading-relaxed">{challenge.description}</p>
                            <div className='my-4 p-2 nz-background-accent rounded-lg'>
                                {tags ? (
                                    <div>
                                        <div className="flex flex-wrap gap-2 pl-4">
                                            {tags.map((tag, index) => (
                                                <span
                                                    key={`${tag}-${index}`}
                                                    className="nz-background-primary text-sm font-medium px-3 py-1 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className='flex items-center pl-4 gap-2 nz-text-muted'><XCircle className='w-4 h-4' />No tags</p>
                                )}
                            </div>
                            {challenge.e_input && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Example:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="nz-background-accent p-4 rounded-xl">
                                            <p className="text-xs nz-text-muted mb-1">Input:</p>
                                            <pre className="text-sm text-white">{challenge.e_input}</pre>
                                        </div>
                                        <div className="nz-background-accent p-4 rounded-xl">
                                            <p className="text-xs nz-text-muted mb-1">Output:</p>
                                            <pre className="text-sm text-emerald-400">{challenge.e_output}</pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Права частина - редактор коду */}
                <div className="">
                    <Card size='wf' className="h-full flex flex-col rounded-none rounded-t-xl">
                        <CardHeader className='p-4'>
                            <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 font-semibold"><FileCode className='w-4 h-4' />Code Editor</h3>
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={isSubmitting}
                                    variant="btn_success"
                                >
                                    {isSubmitting ? 'Checking...' : 'Send solution'}
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <CodeEditor
                                value={challenge.code}
                                onChange={setUserCode}
                            />
                        </CardContent>
                        {/* Результат виконання */}
                        {result && (
                            <div className={`p-4 border-t ${result.success ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'}`}>
                                <p className={`font-medium ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {result.success ? '✅ Challenge passed!' : '❌ You have error'}
                                </p>
                                {result.message && <p className="text-sm mt-1">{result.message}</p>}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}