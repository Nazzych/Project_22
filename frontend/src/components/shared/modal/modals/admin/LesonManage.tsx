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

    // Початковий стан + сортування
    const [lessons, setLessons] = useState<Lesson[]>(() => {
        const base = initial.length > 0 ? initial : [{
            id: '',
            title: '',
            content: '',
            url: '',
            order: 1
        }];
        return [...base].sort(lesson => lesson.order);
    });

    const addLesson = () => {
        setLessons(prev => {
            const maxOrder = Math.max(...prev.map(l => l.order || 0), 0);
            const newLesson: Lesson = {
                id: '',
                title: '',
                content: '',
                url: '',
                order: maxOrder + 1
            };
            return [...prev, newLesson].sort(lesson => lesson.order);
        });
    };

    const removeLesson = (id: string) => {
        if (lessons.length === 1) {
            showToast('warning', 'Minimum one lesson', 'You need to keep at least one lesson.');
            return;
        }
        setLessons(prev => 
            prev.filter(lesson => lesson.id !== id)
            .sort(lesson => lesson.order)
        );
    };

    const updateLesson = (id: string, field: keyof Lesson, value: string | number) => {
        setLessons(prev => 
            prev.map(lesson =>
                lesson.id === id ? { ...lesson, [field]: value } : lesson
            )
        );
    };

    // Swap тільки order-ів двох уроків
    const moveLessonUp = (index: number) => {
        if (index === 0) return;

        setLessons(prev => {
            const newLessons = [...prev];
            const current = newLessons[index];
            const above = newLessons[index - 1];

            // Міняємо тільки order
            const temp = current.order;
            current.order = above.order;
            above.order = temp;

            // Сортуємо за новим order
            return newLessons.sort((a, b) => (a.order || 0) - (b.order || 0));
        });
    };

    const moveLessonDown = (index: number) => {
        if (index === lessons.length - 1) return;

        setLessons(prev => {
            const newLessons = [...prev];
            const current = newLessons[index];
            const below = newLessons[index + 1];

            // Міняємо тільки order
            const temp = current.order;
            current.order = below.order;
            below.order = temp;

            // Сортуємо за новим order
            return newLessons.sort((a, b) => (a.order || 0) - (b.order || 0));
        });
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
                order: idx + 1   // фінальна нумерація перед відправкою
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
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[75vh] overflow-y-auto pr-2">
            {/* ... решта JSX без змін ... */}
            <div className="flex nz-background-primary items-center justify-between sticky top-0 pb-4 border-b z-10">
                <h2 className="text-2xl font-semibold">
                    {initial.length > 0 ? 'Edit Lessons' : 'Create Lessons'}
                </h2>
                <Button type="button" variant="btn_secondary" onClick={addLesson} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Lesson
                </Button>
            </div>

            <div className="space-y-8">
                {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="border rounded-2xl p-6 nz-background-accent">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium text-lg">Lesson {index + 1}</h3>
                            
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="btn_secondary"
                                    size="sm"
                                    onClick={() => moveLessonUp(index)}
                                    disabled={index === 0}
                                >
                                    <ChevronUp className="w-4 h-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="btn_secondary"
                                    size="sm"
                                    onClick={() => moveLessonDown(index)}
                                    disabled={index === lessons.length - 1}
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </Button>

                                {lessons.length > 1 && (
                                    <Button
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

                        {/* Поле Order як індикатор */}
                        <div className="grid md:grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Lesson Title</label>
                                <Input
                                    value={lesson.title}
                                    onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                                    placeholder="e.g. Variables and Data Types"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Order</label>
                                <div className="px-4 py-2 bg-zinc-800/70 rounded text-center font-medium">
                                    {lesson.order}
                                </div>
                            </div>
                        </div>

                        {/* Контент і URL — без змін */}
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

            {/* Кнопки Cancel / Save — без змін */}
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