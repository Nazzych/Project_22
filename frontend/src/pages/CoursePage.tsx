// pages/CourseDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, Plus, Clock, Trophy, Users, PlayCircle, Lock, CheckCircle, BookOpen, ChevronUp, ChevronDown, Share2, Play, MessageCirclePlusIcon, PlusCircle } from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext'
import { useToast } from '../providers/MessageProvider';
import { useModal } from '../hooks/useModal';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDateNumeric } from '../lib/formatDate';
import { cn } from '../lib/cn';
import axios from 'axios';

import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LessonManage } from '../components/shared/modal/modals/admin/LesonManage';
import { CourseManage } from '../components/shared/modal/modals/admin/CourseManage';
import { ConfirmModal } from '../components/shared/modal/ConfirmModal';
import { LessonViewerModal } from '../components/shared/modal/modals/curses/LessonModal';
import { ActionsCellInChannel } from '../components/ActionCell';
import { getCsrfToken } from '../api/auth';
import { deleteCourse } from '../api/admin';
import { getCourse } from '../api/curses';
import { Course, Lesson } from '../types/curses';

export function CoursePage() {
    const { courseId } = useParams<{ courseId: string }>();
    const { showToast } = useToast();
    const { profile } = useProfile();
    const { openModal, closeModal } = useModal();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
    const toggleExpande = () => setIsExpanded(!isExpanded);

    const loadCourseData = async () => {
        if (!courseId) return;
        try {
            const courseData = await getCourse(Number(courseId))
            setCourse(courseData.course);
            setLessons(courseData.lessons);
        } catch (err) {
            console.error ("Error geting current curse with lessons: ", err)
            showToast('error', 'Error', 'Not can load the courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourseData();
    }, [courseId]);

    const firstUnlocked = lessons.findIndex((lesson: any) => lesson.is_unlocked);
    const initialId = firstUnlocked !== -1 ? lessons[firstUnlocked].id : lessons[0]?.id;

    const OpenEditCourse = (course: Course) => {
        openModal({
            id: 'forum-course',
            width: "lg",
            x: false,
            title: (
                <span className="flex items-center gap-2">
                    <div className="w-fit nz-background-accent rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                        <MessageCirclePlusIcon className="w-5 h-5" />
                        <span className="nz-foreground">Edit course</span>
                    </div>
                </span>
            ),
            content: (
                <CourseManage
                    course={course}
                    onSuccess={loadCourseData}
                    onDelete={() => {clickDeleteCourse(course.id)}}
                />
            ),
        });
    }

    const handleDeleteCourse = async (course_id: string) => {
        try {
            if (course_id) {
                await getCsrfToken();
                await deleteCourse (course_id);
                document.location.href = '/forum';
                showToast('success', 'Course deleted', 'Your course has been successfully deleted.');
            }
        } catch (err) {
            console.error('Error deleting Course:', err);
            if (axios.isAxiosError(err) && err.response?.data) {
                const { type, message } = err.response.data;
                showToast(type || 'error', 'Deleting failed', message || 'Unknown error');
            } else {
                showToast('error', 'Deleting failed', 'Something went wrong while deleting your Course.');
            }
        }
    }

    const clickDeleteCourse = async (course_id: string) => {
        openModal({
            id: 'confirm-delete-course',
            width: "md",
            content: (
                <ConfirmModal
                    message= {
                        <div className="flex items-center gap-2 relative">
                            <div className="nz-background-secondary absolute left-1 top-0 h-full w-1.5 rounded-full"></div>
                            <p className="text-sm pl-4">You really want to delete your course? This action cannot be undone.</p>
                        </div>
                    }
                    onConfirm={() => {handleDeleteCourse(course_id); closeModal()}}
                    onCancel={closeModal}
                    confirmText="Yes, delete"
                    cancelText="Cancel"
                />
            ),
        });
    }

    const OpenAddLesson = () => {
        openModal({
            id: 'course-add-lessons',
            width: "xl",
            x: false,
            title: (
                <span className="flex items-center gap-2">
                    <div className="w-fit nz-background-accent rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        <span className="nz-foreground">Add lesson for curse</span>
                    </div>
                </span>
            ),
            content: (
                <LessonManage
                    courseId={Number(course?.id)}
                    onSuccess={() => {loadCourseData(); closeModal()}}
                />
            ),
        });
    };

    const toggleLesson = (lessonId: number) => {
        setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
    };

    const beginStudy = () => {
        const coursePoints = course?.points ?? 0;
        const userPoints = profile?.profile?.total_points ?? 0;

        if (coursePoints > userPoints) {
            showToast ("info", "You not have points for it course", `Need points - ${coursePoints - userPoints}`);
        }
        showToast("info", "Good luck in study");
        openModal({
            id: 'course-begin-lesson',
            content: (
                <LessonViewerModal
                    courseId={Number(course?.id)}
                    lessons={lessons}
                    initialLessonId={initialId}
                    onClose={closeModal}
                    onLessonComplete={() => {
                        loadCourseData();
                    }}
                />
            ),
        })
    };

    const difficultyLower = (course?.level || 'medium').toLowerCase();

    const difficultyColor = {
        easy: 'text-green-500',
        medium: 'text-yellow-500',
        hard: 'text-red-500',
    } as const;

    const colorClass = difficultyColor[difficultyLower as keyof typeof difficultyColor] || 'text-gray-500';

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Course Loading ...</div>;
    }

    if (!course) {
        return <div className="text-center py-20 text-red-400">Course not found</div>;
    }

    return (
        <div className="space-y-8">
            {/* Шапка курсу */}
            <div className="relative rounded-3xl overflow-hidden border border-border">
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
                <div className="relative p-4 pt-12 sm:p-6 sm:pt-14 h-full flex flex-col">
                    <div className="flex flex-col sm:flex-row flex-wrap items-start gap-4 sm:gap-8 flex-1 w-full">
                        {/* Аватар */}
                        <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 overflow-hidden flex-shrink-0">
                                {course.image ? (
                                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-bold bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white cursor-default">
                                        {course.title[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.45 }}
                                        className="overflow-hidden w-full"
                                    >
                                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-2 text-xs nz-text-muted w-full">
                                            <div className='flex justify-between flex-wrap'>
                                                <span className="block">Created</span>
                                                <span className="font-medium text-white">
                                                    {formatDateNumeric(course.created_at)}
                                                </span>
                                            </div>
                                            <div className='flex justify-between flex-wrap'>
                                                <span className="block">Students</span>
                                                <span className="font-medium text-white">0</span>
                                            </div>
                                            <div className='flex justify-between flex-wrap'>
                                                <span className="block">Points</span>
                                                <span className="flex items-center gap-1 font-medium text-white">
                                                    <Trophy className="w-3 h-3 text-amber-400" />
                                                    {course.points ? course.points : "Free"}
                                                </span>
                                            </div>
                                            <div className='flex justify-between flex-wrap'>
                                                <span className="block">Level</span>
                                                <span className={cn("font-medium text-white", colorClass)}>
                                                    {course.level.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {/* Назва + кнопка */}
                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <h1 className={`font-bold text-white leading-tight transition-all duration-300 ${
                                    isExpanded ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-3xl line-clamp-2'
                                }`}>
                                    {course.title}
                                </h1>
                            </div>
                            <p className="flex flex-wrap items-center text-zinc-300 text-xs sm:text-sm gap-2 mt-1">
                                <span className="hover:underline cursor-pointer">@{course.author?.username}</span> <span className={cn("flex items-center gap-2 " + (isExpanded ? "opacity-0" : "opacity-100"))}>• <Button size="sm" variant='btn_glass' className="flex items-center gap-2 mt-1" onClick={beginStudy} disabled={isExpanded}><Play className="w-4 h-5" />Begin</Button></span>
                            </p>
                            {/* Розгорнутий опис */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.45 }}
                                        className="mt-4 overflow-hidden"
                                    >
                                        <span className="text-xs nz-text-muted block mb-2">Description</span>
                                        <p className="max-h-[100px] nz-background-accent text-zinc-200 p-2 leading-relaxed font-medium rounded-xl overflow-y-auto text-xs sm:text-base">
                                            {course.description || "No description available."}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-x-2 gap-y-3 text-xs sm:text-sm nz-text-muted">
                                            <Button size="sm" variant='btn_glass' className="flex items-center gap-2" onClick={beginStudy}><Play className="w-4 h-5" />Begin</Button>
                                            <Button size="sm" variant='btn_glass' className="flex items-center gap-2"><Share2 className="w-4 h-5" />Share</Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                {/* Кнопки керування */}
                <Button size='sm'
                    variant="btn_glass" 
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <Link to="/courses">
                    <Button variant="btn_glass" size="sm" className="absolute top-4 left-16">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Courses
                    </Button>
                </Link>
                {profile?.is_staff && (
                    <ActionsCellInChannel onEdit={() => OpenEditCourse(course)} onDelete={() => {clickDeleteCourse (course.id)}} onShare={() => {}} />
                )}
                <Button 
                    variant="btn_glass" 
                    size="icon"
                    onClick={() => toggleExpande()}
                    className="absolute top-4 right-4"
                >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
            </div>
{/* Полоса курсу */}
            <div className="flex items-center justify-between flex-wrap gap-2 border p-2 px-6 nz-background-primary rounded-3xl md:rounded-full">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                    <PlayCircle className="w-6 h-6 nz-text-primary" />
                    Curse Lessons
                </h2>
                {profile?.is_staff && (
                    <Button variant='btn_glass' className='flex items-center gap-2' onClick={OpenAddLesson}>
                        <Plus className="w-4 h-4" />
                        Add Lesson
                    </Button>
                )}
            </div>
{/* Список уроків */}
            <div>
                <div className="space-y-4">
                    {lessons?.length === 0 ? (
                        <Card variant='card_primary' size="wf">
                            <CardContent className="py-10 text-center">
                                <p>In this course not lessons</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className='max-h-[45vh] p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 nz-background-primary border overflow-y-auto rounded-3xl'>
                            {
                                lessons
                                .sort((a: any, b: any) => a.order - b.order)
                                .map((lesson: Lesson, index: number) => (
                                    <Card variant='card_accent' size='wf'
                                        key={lesson.id}
                                        className="h-fit overflow-hidden transition-all"
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="min-w-8 min-h-8 rounded-xl nz-background-secondary border flex items-center justify-center text-sm font-mono">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium line-clamp-1">{lesson.title}</h3>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}