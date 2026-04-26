import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, XCircle, Clock, Edit2, Trophy, Code2, FileText, FileCode, Code, PencilIcon, CheckCircleIcon, Archive } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { CodeEditor } from '../../components/CodeEditor';
import { useToast } from '../../providers/MessageProvider';
import { Tasks, ChallengeViewProps } from '../../types/tasks';
import { formatRelativeTime } from '../../lib/formatDate';

export default function CodeChallengeView ({ challenge }: ChallengeViewProps) {
    const { showToast } = useToast();

    const [userCode, setUserCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);

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

    const tags = challenge?.tags
        ? challenge.tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0)
        : [];

    if (!challenge) {
        return <div className="text-center py-20 text-red-400">Lesson not found!</div>;
    }

    return (
        <div className='space-y-4'>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ліва частина - опис завдання */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-4">{challenge.title}</h1>
                        <div className="flex items-center gap-4 text-sm nz-text-muted">
                            <span className="flex items-center gap-1">
                                <Code2 className='w-4 h-4' />
                                {challenge.code_challenge.language?.toUpperCase() || "---"}
                            </span>
                            <span className='text-xl'>•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatRelativeTime(challenge.created_at)}
                            </span>
                            {challenge.updated_at !== challenge.created_at && (
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
                                {tags.length !== 0 ? (
                                    <div>
                                        <div className="flex flex-wrap gap-2 pl-4">
                                            {tags.map((tag: string, index: number) => (
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
                            {challenge.code_challenge.e_input && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Example:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="nz-background-accent p-4 rounded-xl">
                                            <p className="text-xs nz-text-muted mb-1">Input:</p>
                                            <span className="text-sm text-white font-mono">{challenge.code_challenge.e_input}</span>
                                        </div>
                                        <div className="nz-background-accent p-4 rounded-xl">
                                            <p className="text-xs nz-text-muted mb-1">Output:</p>
                                            <span className="text-sm text-emerald-400 font-mono">{challenge.code_challenge.e_output}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Права частина - редактор коду */}
                <div>
                    <Card size='wf' className="h-full flex flex-col rounded-none rounded-t-xl">
                        <CardHeader className='p-4'>
                            <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 font-semibold"><FileCode className='w-5 h-5' />Code Editor</h3>
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
                                value={challenge.code_challenge.starter_code}
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