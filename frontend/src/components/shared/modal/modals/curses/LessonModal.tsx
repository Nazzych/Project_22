import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Lock, CheckCircle, BookOpen } from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { useToast } from '../../../../../providers/MessageProvider';
import { Lesson } from '../../../../../types/curses';
import { lessonFinish } from '../../../../../api/curses';
import { cn } from '../../../../../lib/cn';
import { getCsrfToken } from '../../../../../api/auth';

interface LessonViewerModalProps {
    courseId: number;
    lessons: Lesson[];
    initialLessonId?: number;
    onClose: () => void;
    onLessonComplete?: (lessonId: number) => void;
}

export function LessonViewerModal({
    courseId,
    lessons,
    initialLessonId,
    onClose,
    onLessonComplete
}: LessonViewerModalProps) {
    const { showToast } = useToast();
    const [currentLessonIndex, setCurrentLessonIndex] = useState(1);
    const [localCompletedIds, setLocalCompletedIds] = useState<number[]>([]);

    useEffect(() => {
        if (initialLessonId) {
            const index = lessons.findIndex(l => Number(l.id) === initialLessonId);
            if (index !== -1) setCurrentLessonIndex(index);
        }
    }, [initialLessonId, lessons]);

// YouTube helpers
    const isYouTubeUrl = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');
    const convertToYouTubeEmbed = (url: string) => {
        const regExp = /^.*(youtu\.be\/|v\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    // Універсальна функція перевірки статусів
    const getLessonStatus = (index: number) => {
        const lesson = lessons[index];
        if (!lesson) return { unlocked: false, completed: false };
        const isCompleted = lesson.is_completed || localCompletedIds.includes(Number(lesson.id));
        
        // Розблоковано якщо: перший урок АБО попередній завершений
        let isUnlocked = lesson.is_unlocked || index === 0;
        if (index > 0) {
            const prev = lessons[index - 1];
            if (prev.is_completed || localCompletedIds.includes(Number(prev.id))) {
                isUnlocked = true;
            }
        }
        return { isUnlocked, isCompleted };
    };

    const currentLesson = lessons[currentLessonIndex];
    const { isUnlocked: currentUnlocked, isCompleted: currentCompleted } = getLessonStatus(currentLessonIndex);
    const hasNextLesson = currentLessonIndex < lessons.length - 1;
    const nextLessonStatus = hasNextLesson ? getLessonStatus(currentLessonIndex + 1) : null;

    const handleComplete = async () => {
        const lessonId = Number(currentLesson.id);
        await getCsrfToken();
        await lessonFinish (lessonId);
        if (!localCompletedIds.includes(lessonId)) {
            setLocalCompletedIds(prev => [...prev, lessonId]);
        }
        onLessonComplete?.(lessonId);
        if (!hasNextLesson) {
            showToast("success", "Course completed!", "Now you can go to next course.");
        }
    };

    const goToNext = () => {
        if (hasNextLesson) {
            setCurrentLessonIndex(prev => prev + 1);
        }
    };

    if (!currentLesson) return null;

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="nz-background-primary border rounded-3xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4 nz-background-accent">
                    <div className="flex items-center gap-4">
                        <div className="p-2 nz-background-primary rounded-lg">
                            <BookOpen className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="font-bold line-clamp-1">{currentLesson.title}</h2>
                            <p className="text-xs nz-text-muted uppercase tracking-widest">Lesson - {currentLessonIndex + 1} of {lessons.length}</p>
                        </div>
                    </div>
                    <Button variant="btn_glass" size='sm' onClick={onClose} className="rounded-full">
                        ESC
                    </Button>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-72 border-r nz-background-primary overflow-y-auto hidden md:block">
                        <div className="p-4 space-y-2">
                            {lessons.map((lesson, idx) => {
                                const { isUnlocked, isCompleted } = getLessonStatus(idx);
                                const isActive = idx === currentLessonIndex;
                                return (
                                    <button
                                        key={lesson.id}
                                        disabled={!isUnlocked}
                                        onClick={() => setCurrentLessonIndex(idx)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                                            isActive ? "nz-bg-primary italic shadow-lg shadow-violet-900/20" : "hover:nz-bg-hover",
                                            !isUnlocked && "opacity-30 cursor-not-allowed"
                                        )}
                                    >
                                        <div className="text-xs font-bold opacity-50">{idx + 1}</div>
                                        <div className="flex-1 text-sm truncate text-left">{lesson.title}</div>
                                        {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                                        {!isUnlocked && <Lock className="w-3.5 h-3.5 text-zinc-500" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col nz-background-accent overflow-y-auto custom-scrollbar">
                        <div className="max-w-4xl mx-auto w-full p-4 md:p-8">
                            {/* Video/Image Section */}
                            {currentLesson.url && (
                                <div className="mb-10 overflow-hidden border nz-background-secondary shadow-2xl aspect-video rounded-2xl">
                                    {isYouTubeUrl(currentLesson.url) ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={convertToYouTubeEmbed(currentLesson.url)}
                                            title={currentLesson.title}
                                            allowFullScreen
                                            className="w-full"
                                        />
                                    ) : (
                                        <img 
                                            src={currentLesson.url} 
                                            alt={currentLesson.title}
                                            className="w-full max-h-[460px] object-contain nz-background-secondary"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Text Content */}
                            <article className="prose prose-invert max-w-none mb-12">
                                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                                    {currentLesson.content}
                                </p>
                            </article>

                            {/* NAVIGATION INSIDE CONTENT - Твоя ідея тут */}
                            <div className="py-12 border-t flex flex-col items-center gap-6">
                                {!currentCompleted ? (
                                    <Button 
                                        variant="btn_success" 
                                        onClick={handleComplete}
                                        className="w-full max-w-md h-14 text-lg font-bold rounded-2xl shadow-xl shadow-emerald-900/20"
                                    >
                                        Finish lesson
                                    </Button>
                                ) : hasNextLesson ? (
                                    <div className="text-center space-y-4 w-full max-w-md">
                                        <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium">
                                            <CheckCircle className="w-5 h-5" /> Lesson completed
                                        </div>
                                        <Button 
                                            variant="btn_primary" 
                                            onClick={goToNext}
                                            className="w-full h-14 text-lg font-bold rounded-2xl bg-violet-600 hover:bg-violet-500 shadow-xl shadow-violet-900/20"
                                        >
                                            Open next lesson
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                                        <h3 className="text-emerald-400 font-bold text-xl mb-1">Congratulations!</h3>
                                        <p className="text-zinc-400">You have successfully completed this course.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Minimalist */}
                <div className="p-4 border-t nz-background-primary flex justify-between px-8">
                    <Button 
                        variant="btn_glass" 
                        onClick={() => setCurrentLessonIndex(prev => prev - 1)}
                        disabled={currentLessonIndex === 0}
                        className="text-zinc-400 hover:text-white"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div className="text-zinc-600 text-xs font-mono self-center uppercase tracking-widest">
                        CODE-HUB-NH Learning System
                    </div>
                </div>
            </div>
        </div>
    );
}