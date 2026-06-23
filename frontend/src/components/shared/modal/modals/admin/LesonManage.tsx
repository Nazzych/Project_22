import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { useToast } from '../../../../../providers/MessageProvider';
import { useModal } from '../../../../../hooks/useModal';
import { getCsrfToken } from '../../../../../api/auth';
import { createLessons, updateLessons } from '../../../../../api/admin';
import { Lesson } from '../../../../../types/curses';
import { cn } from '../../../../../lib/cn';

interface LessonManageProps {
    courseId: number;
    initialLessons?: Lesson[] | null;
    onSuccess: () => void;
}

export function LessonManage({ 
    courseId, 
    initialLessons = [], 
    onSuccess 
}: LessonManageProps) {
    const { showToast } = useToast();
    const { closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const initial = Array.isArray(initialLessons) ? initialLessons : initialLessons ? [initialLessons] : [];

    const [lessons, setLessons] = useState<Lesson[]>(() => {
        const base = initial.length > 0 ? initial : [{
            id: Date.now().toString(),
            title: '',
            content: '',
            url: '',
            order: 1
        }];
        return [...base].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    // Допоміжна функція сортування
    const sortLessons = (list: Lesson[]): Lesson[] => {
        return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    const addLesson = () => {
        setLessons(prev => {
            const maxOrder = Math.max(...prev.map(l => l.order || 0), 0);
            const newLesson: Lesson = {
                id: Date.now().toString(),
                title: '',
                content: '',
                url: '',
                order: maxOrder + 1
            };
            return sortLessons([...prev, newLesson]);
        });
    };

    const removeLesson = (id: string) => {
        if (lessons.length === 1) {
            showToast('warning', 'Minimum one lesson', 'You need to keep at least one lesson.');
            return;
        }
        setLessons(prev => sortLessons(prev.filter(l => l.id !== id)));
    };

    const updateLesson = (id: string, field: keyof Lesson, value: string | number) => {
        setLessons(prev => prev.map(lesson =>
            lesson.id === id ? { ...lesson, [field]: value } : lesson
        ));
    };

    // ========== UP ==========
    const moveLessonUp = (index: number) => {
        // Якщо урок уже перший, вище підняти не можна
        if (index === 0) return;

        // Робимо копію поточного масиву уроків
        const newLessons = [...lessons];

        const currentLesson = { ...newLessons[index] };
        const aboveLesson = { ...newLessons[index - 1] }; // Той, що над ним

        // Твоя логіка обміну order-ами
        const currentLessOrder = currentLesson.order;
        currentLesson.order = aboveLesson.order;
        aboveLesson.order = currentLessOrder;

        // Замінюємо старі уроки на наші оновлені
        newLessons[index] = aboveLesson;
        newLessons[index - 1] = currentLesson;

        // Використовуємо твою функцію сортування і оновлюємо стейт
        const sorted = sortLessons(newLessons);
        setLessons(sorted);

        const debugInfo = sorted
            .map(l => `${l.title || 'Untitled'} (order: ${l.order})`)
            .join(" | ");
        showToast("info", "[DEBUG] After Up", debugInfo);
        console.info(`After Up: ${debugInfo}.`)
    };

    // ========== DOWN ==========
    const moveLessonDown = (index: number) => {
        // Якщо урок останній, нижче опустити не можна
        if (index === lessons.length - 1) return;

        const newLessons = [...lessons];

        const currentLesson = { ...newLessons[index] };
        const belowLesson = { ...newLessons[index + 1] }; // Той, що під ним

        const currentLessOrder = currentLesson.order;
        currentLesson.order = belowLesson.order;
        belowLesson.order = currentLessOrder;

        newLessons[index] = belowLesson;
        newLessons[index + 1] = currentLesson;

        const sorted = sortLessons(newLessons);
        setLessons(sorted);

        const debugInfo = sorted
            .map(l => `${l.title || 'Untitled'} (order: ${l.order})`)
            .join(" | ");
        showToast("info", "[DEBUG] After Down", debugInfo);
        console.info(`After Down: ${debugInfo}.`)
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const invalid = lessons.some(l => !l.title?.trim() || !l.content?.trim());
        if (invalid) {
            showToast('warning', 'Fill required fields', 'Title and content are required');
            setLoading(false);
            return;
        }

        try {
            await getCsrfToken();

            const payload = lessons.map((lesson, idx) => ({
                ...lesson,
                order: idx + 1
            }));

            if (initial.length > 0) {
                await updateLessons(courseId, payload);
                showToast('success', 'Success!', 'Lessons updated successfully');
            } else {
                await createLessons(courseId, payload);
                showToast('success', 'Success!', `${payload.length} lessons created`);
            }

            onSuccess();
            closeModal();
        } catch (err: any) {
            console.error(err);
            showToast('error', 'Error', initial.length > 0 ? 'Failed to update lessons' : 'Failed to create lessons');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[75vh] pr-2 overflow-y-auto scrollbar-thin scrollbar-track-transparent">
            {/* ... (верхня частина з заголовком і кнопкою Add Lesson) ... */}
            <div className="flex nz-background-primary items-center justify-between sticky top-0 pb-4 border-b z-10">
                <div>
                    <h2 className="text-2xl font-semibold">
                        {initial.length > 0 ? 'Edit Lessons' : 'Create Lessons'}
                    </h2>
                    <p className="text-xs nz-text-muted mt-0.5 tracking-wide">Manage course structure and dynamic ordering</p>
                </div>
                <Button type="button" variant="btn_secondary" size='sm' onClick={addLesson} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Lesson
                </Button>
            </div>

            <div className="space-y-8">
                {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="border rounded-2xl p-6 nz-background-accent">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="font-medium text-lg">Lesson {index + 1}</h3>
                                <span className="text-xs font-mono font-semibold px-2.5 py-1 nz-background-primary rounded-md border">
                                    DB Order: {lesson.order}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <Button className={cn('rounded-l-full', index === 0 && 'cursor-not-allowed')}
                                    type="button"
                                    variant="btn_secondary"
                                    size="sm"
                                    onClick={() => moveLessonUp(index)}
                                    disabled={index === 0}
                                >
                                    <ChevronUp className="w-4 h-4" />
                                </Button>
                                <Button className={cn('rounded-none', index === lessons.length - 1 && 'cursor-not-allowed')}
                                    type="button"
                                    variant="btn_secondary"
                                    size="sm"
                                    onClick={() => moveLessonDown(index)}
                                    disabled={index === lessons.length - 1}
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </Button>

                                {lessons.length > 1 && (
                                    <Button className='rounded-r-full'
                                        type="button"
                                        variant="btn_destructive"
                                        size="sm"
                                        onClick={() => removeLesson(lesson.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className='mb-5'>
                            <label className="block text-sm font-medium mb-1.5">Lesson Title</label>
                            <Input
                                value={lesson.title}
                                onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                                placeholder="e.g. Variables and Data Types"
                            />
                        </div>

                        {/* Контент і URL */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Lesson Content</label>
                                <Textarea
                                    value={lesson.content}
                                    onChange={(e) => updateLesson(lesson.id, 'content', e.target.value)}
                                    rows={10}
                                    placeholder="Lesson material goes here..."
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">URL (Video or Image)</label>
                                <Input
                                    value={lesson.url || ''}
                                    onChange={(e) => updateLesson(lesson.id, 'url', e.target.value)}
                                    placeholder="https://youtube.com/... or image link"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Кнопки внизу */}
            <div className="sticky bottom-0 nz-background-primary pt-6 border-t flex gap-3">
                <Button type="button" variant="btn_secondary" onClick={closeModal} disabled={loading} className="flex-1">
                    Cancel
                </Button>
                <Button type="submit" variant="btn_success" disabled={loading} className="flex-1">
                    {loading ? <LoadingSpinner text="Saving..." /> : initial.length > 0 ? 'Save Changes' : `Create ${lessons.length} Lessons`}
                </Button>
            </div>
        </form>
    );
}