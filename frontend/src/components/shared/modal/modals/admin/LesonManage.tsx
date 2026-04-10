import React, { useState } from 'react';
import { Plus, Trash2, Save, ArrowRight } from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { useToast } from '../../../../../providers/MessageProvider';
import { useModal } from '../../../../../hooks/useModal';
import { getCsrfToken } from '../../../../../api/auth';
import { createLessons } from '../../../../../api/admin';
import { Lesson } from '../../../../../types/curses';

interface LessonBulkCreateProps {
    courseId?: number;
    onSuccess: () => void;
}

export function LessonManage ({ courseId, onSuccess }: LessonBulkCreateProps) {
    const { showToast } = useToast();
    const { closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const [lessons, setLessons] = useState<Lesson[]>([
        { id: '1', title: '', content: '', order: 1 , url: ''}
    ]);

    const addLesson = () => {
        const newOrder = Math.max(...lessons.map(l => l.order)) + 1;
        setLessons([...lessons, {
            id: Date.now().toString(),
            title: '',
            content: '',
            url: '',
            order: newOrder
        }]);
    };

    const removeLesson = (id: string) => {
        if (lessons.length === 1) {
            showToast('warning', 'What?', 'Need one lesson for operation.');
            return;
        }
        setLessons(lessons.filter(lesson => lesson.id !== id));
    };

    const updateLesson = (id: string, field: keyof Lesson, value: string | number) => {
        setLessons(lessons.map(lesson =>
            lesson.id === id ? { ...lesson, [field]: value } : lesson
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Валідація
        const invalid = lessons.some(l => !l.title.trim() || !l.content.trim());
        if (invalid) {
            showToast('warning', 'Fields requaried', 'All fields are requaried');
            console.log('Sending lessons data:', JSON.stringify(lessons, null, 2));
            setLoading(false);
            return;
        }

        try {
            await getCsrfToken();
            await createLessons(courseId!, lessons);

            showToast('success', 'Success!', `${lessons.length} lessons created`);

            onSuccess();
            closeModal();
        } catch (err: any) {
            console.error(err);
            showToast('error', 'Error', 'Can\'t create lessons');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[75vh] overflow-y-auto pr-2">
            <div className="flex nz-background-primary items-center justify-between sticky top-0 pb-4 border-b z-10">
                <h2 className="text-2xl font-semibold">Add lessons to course</h2>
                <Button type="button" variant="btn_secondary" onClick={addLesson} className="flex items-center gap-2 rounded-full">
                    <Plus className="w-4 h-4" />
                    Add lesson
                </Button>
            </div>

            <div className="space-y-8">
                {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="border rounded-2xl p-6 nz-background-secondary">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium text-lg">Lesson {index + 1}</h3>
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

                        <div className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Lesson name</label>
                                    <Input
                                        value={lesson.title}
                                        name='title'
                                        onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                                        placeholder="Example: vars and data types"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Lesson order</label>
                                    <Input
                                        type="number"
                                        name='order'
                                        value={lesson.order}
                                        onChange={(e) => updateLesson(lesson.id, 'order', parseInt(e.target.value) || 1)}
                                        min={1}
                                    />
                                </div>

                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Lesson content</label>
                                <Textarea
                                    value={lesson.content}
                                    name='content'
                                    onChange={(e) => updateLesson(lesson.id, 'content', e.target.value)}
                                    rows={10}
                                    placeholder="There lesson material..."
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Lesson URL</label>
                                <Input
                                    name='url'
                                    value={lesson.url}
                                    placeholder='Image or YouTube video url...'
                                    onChange={(e) => updateLesson(lesson.id, 'url', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="sticky nz-background-primary bottom-0 pt-6 border-t flex gap-3">
                <Button 
                    type="button" 
                    variant="btn_secondary" 
                    onClick={closeModal}
                    disabled={loading}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    variant="btn_success" 
                    disabled={loading}
                    className="flex-1"
                >
                    {loading ? (
                        <LoadingSpinner text="Creating..." />
                    ) : (
                        <>Create {lessons.length} lesson's <ArrowRight className="ml-2 w-4 h-4" /></>
                    )}
                </Button>
            </div>
        </form>
    );
}