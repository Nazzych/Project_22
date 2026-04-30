import React, { useState, useEffect, useCallback } from 'react';
import { 
    File, FileText, Tag, Trophy, Save, Trash2, ArrowRight, AlertOctagon,
    FileCode
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { Select } from '../../../../ui/Select';
import { LoadingSpinner } from '../../../../LoadingSpinner';

import { QuizChallengeManage } from '../tasks/QuizChallengeManage';
import { CodeChallengeManage } from '../tasks/CodeChallengeManage';

import { useToast } from '../../../../../providers/MessageProvider';
import { useModal } from '../../../../../hooks/useModal';
import { getCsrfToken } from '../../../../../api/auth';
import { createTask, updateTask } from '../../../../../api/admin';

const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
];

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
];

const typeOptions = [
    { value: 'code', label: 'Code Challenge' },
    { value: 'quiz', label: 'Quiz Challenge' },
];

const pointsOptions = [
    { value: "10", label: "10 Points" },
    { value: "20", label: "20 Points" },
    { value: "50", label: "50 Points" },
    { value: "80", label: "80 Points" },
    { value: "100", label: "100 Points" },
    { value: "150", label: "150 Points" },
    { value: "200", label: "200 Points" },
];

const languageOptions = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'go', label: 'Go' },
];

interface ChallangeManageProps {
    task?: any;
    onSuccess: () => void;
    onDelete?: () => void;
}

interface ChallangeManageProps {
    task?: any;
    onSuccess: () => void;
    onDelete?: () => void;
}

export function ChallangeManage({ task, onSuccess, onDelete }: ChallangeManageProps) {
    const { showToast } = useToast();
    const { closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'code' | 'quiz'>('general');

    // Конвертація бекенд → локальний формат
    const convertBackendToLocal = useCallback((backendQuestions: any[] = []): any[] => {
        if (!Array.isArray(backendQuestions) || backendQuestions.length === 0) return [];

        return backendQuestions.map((q: any) => ({
            id: crypto.randomUUID(),
            backend_question_id: q.id,
            question_text: q.question_text || '',
            options: (q.answers || []).map((a: any) => a.answer_text || ''),
            correct_answer: (q.answers || []).findIndex((a: any) => a.is_correct) || 0,
        }));
    }, []);

    const [form, setForm] = useState(() => ({
        title: task?.title || "",
        description: task?.description || "",
        tegs: task?.tegs || "",
        points: task?.points || 50,
        difficul: task?.difficul ?? "medium",
        language: task?.language ? task?.quiz_challenge?.language : "python",
        status: task?.status ?? "draft",
        c_type: task?.c_type ?? "code",

        e_input: task?.code_challenge?.e_input || "",
        e_output: task?.code_challenge?.e_output || "",
        code: task?.code_challenge?.starter_code || "",

        // Quiz — конвертуємо одразу при ініціалізації
        quiz_questions: task?.quiz_challenge?.questions 
            ? convertBackendToLocal(task.quiz_challenge.questions) 
            : [],
    }));

    const isEditMode = !!task;

    // Оновлюємо форму, якщо task змінився (наприклад, при повторному відкритті)
    useEffect(() => {
        if (task) {
            setForm({
                title: task.title || "",
                description: task.description || "",
                tegs: task.tags || "",
                points: task.points || 50,
                difficul: task.difficulty ?? "medium",
                language: task.language ? task?.quiz_challenge?.language : "python",
                status: task.status ?? "draft",
                c_type: task.c_type ?? "code",

                e_input: task.code_challenge?.e_input || "",
                e_output: task.code_challenge?.e_output || "",
                code: task.code_challenge?.starter_code || "",

                quiz_questions: task.quiz_challenge?.questions 
                    ? convertBackendToLocal(task.quiz_challenge.questions) 
                    : [],
            });
        }
    }, [task, convertBackendToLocal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (field: string) => (value: string) => {
        setForm(prev => ({ ...prev, [field]: field === 'points' ? Number(value) : value }));
    };

    const convertLocalToBackend = useCallback((localQuestions: any[]) => {
        return localQuestions.map((q, order) => ({
            question_text: q.question_text,
            order: order + 1,
            answers: q.options.map((text: string, idx: number) => ({
                answer_text: text,
                is_correct: idx === q.correct_answer
            }))
        }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!form.title.trim() || !form.description.trim()) {
            showToast('warning', 'Missing fields', 'Title and description are required.');
            setLoading(false);
            return;
        }

        try {
            await getCsrfToken();

            const payload = {
                ...form,
                quiz_questions: form.c_type === 'quiz' 
                    ? convertLocalToBackend(form.quiz_questions) 
                    : []
            };

            if (isEditMode) {
                await updateTask(task.id, payload);
                showToast('success', 'Task updated', 'Successfully updated!');
            } else {
                await createTask(payload);
                showToast('success', 'Task created', 'Successfully created!');
            }

            onSuccess();
            closeModal();
        } catch (err: any) {
            console.error(err);
            showToast('error', 'Save failed', err?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const updateQuiz = (update: any) => {
        setForm(prev => ({
            ...prev,
            quiz_questions: typeof update === 'function' 
                ? update(prev.quiz_questions || []) 
                : update
        }));
    };

    const showCodeTab = form.c_type === 'code';
    const showQuizTab = form.c_type === 'quiz';

    return (
        <form onSubmit={handleSubmit} className="w-full">
            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/50">
                <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className={`flex flex-col items-center px-6 text-sm font-medium transition-all flex-1`}
                >
                    General
                    {activeTab === 'general' && (
                        <motion.div
                            layoutId="challenge-tab-underline"
                            className="w-[50%] h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-full"
                        />
                    )}
                </button>

                {showCodeTab && (
                    <button
                        type="button"
                        onClick={() => setActiveTab('code')}
                        className={`flex flex-col items-center px-6 text-sm font-medium transition-all flex-1`}
                    >
                        Code Challenge
                    {activeTab === 'code' && (
                        <motion.div
                            layoutId="challenge-tab-underline"
                            className="w-[50%] h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-full"
                        />
                    )}
                    </button>
                )}

                {showQuizTab && (
                    <button
                        type="button"
                        onClick={() => setActiveTab('quiz')}
                        className={`flex flex-col items-center px-6 text-sm font-medium transition-all flex-1`}
                    >
                        Quiz Challenge
                    {activeTab === 'quiz' && (
                        <motion.div
                            layoutId="challenge-tab-underline"
                            className="w-[50%] h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-full"
                        />
                    )}
                    </button>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* ==================== GENERAL TAB ==================== */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Title</label>
                                <Input icon={<File className='w-4 h-4' />}
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Two Sum"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-1.5"><Trophy className='w-4 h-4 text-amber-400' />Points</label>
                                <Select className='nz-bg-input rounded-xl'
                                    options={pointsOptions}
                                    value={String(form.points)}
                                    onChange={handleSelectChange('points')}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Description</label>
                            <Textarea icon={<FileText className='w-4 h-4' />}
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Write a detailed description..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Difficulty</label>
                                <Select className='nz-bg-input rounded-xl'
                                    options={difficultyOptions}
                                    value={form.difficul}
                                    onChange={handleSelectChange('difficul')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Language</label>
                                <Select className='nz-bg-input rounded-xl'
                                    options={languageOptions}
                                    value={form.language}
                                    onChange={handleSelectChange('language')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Status</label>
                                <Select className='nz-bg-input rounded-xl'
                                    options={statusOptions}
                                    value={form.status}
                                    onChange={handleSelectChange('status')}
                                />
                            </div>
                        </div>

                        <div className='flex flex-col md:flex-row gap-4'>
                            <div className='flex-1'>
                                <label className="block text-sm font-medium mb-1.5">Tags <span className='text-[12px] nz-text-muted'>(comma separated)</span></label>
                                <Input icon={<Tag className='w-4 h-4' />}
                                    name="tegs"
                                    value={form.tegs}
                                    onChange={handleChange}
                                    placeholder="array, hashmap, easy"
                                />
                            </div>

                            {/* Вибір типу завдання */}
                            <div className='md:w-[30%]'>
                                <label className="flex items-center gap-2 text-sm font-medium mb-1.5"><AlertOctagon className='w-4 h-4 text-red-500' />Type of Challenge</label>
                                <Select className='nz-bg-input rounded-xl'
                                    options={typeOptions}
                                    value={form.c_type}
                                    onChange={handleSelectChange('c_type')}
                                />
                            </div>
                        </div>
                        {form.c_type === 'code' && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-1.5 text-amber-500"><FileCode className='w-4 h-4' />Code Challenge are not stable and unsupported yet!</label>
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== CODE TAB ==================== */}
                {activeTab === 'code' && (
                    <CodeChallengeManage form={form} setForm={setForm} />
                )}

                {/* ==================== QUIZ TAB ==================== */}
                {activeTab === 'quiz' && (
                    <QuizChallengeManage
                        questions={form.quiz_questions}
                        setQuestions={updateQuiz}
                    />
                )}
            </div>

            {/* Bottom Buttons */}
            <div className="flex justify-between pt-6 border-t border-border px-6 pb-6">
                {isEditMode && onDelete && (
                    <Button
                        type="button"
                        variant="btn_destructive"
                        onDoubleClick={onDelete}
                        disabled={loading}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Task
                        <span className='absolute -bottom-1 font-bold right-2 text-[8px]'>Double click</span>
                    </Button>
                )}

                <div className="flex gap-3">
                    <Button type="button" variant="btn_secondary" onClick={closeModal} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant={isEditMode ? "btn_warning" : "btn_success"} disabled={loading}>
                        <Save className='w-4 h-4 mr-2' />
                        {loading ? <LoadingSpinner text="Saving..." /> : isEditMode ? 'Save Changes' : 'Create Task'}
                    </Button>
                </div>
            </div>
        </form>
    );
}