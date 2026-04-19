import React, { useState, useRef } from 'react';
import { 
    BookOpen, Tag, Trophy, Clock, MoreVertical, Users, Edit2, GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { useModal } from '../../../hooks/useModal';
import { ConfirmModal } from '../../shared/modal/ConfirmModal';
import { getCsrfToken } from '../../../api/auth';
import { useCourse } from '../../../pages/admin/hooks/useCourse';
import { useToast } from '../../../providers/MessageProvider';
import { deleteCourse } from '../../../api/admin';
import { formatRelativeTime } from '../../../lib/formatDate';
import { CourseManage } from '../../../components/shared/modal/modals/admin/CourseManage';
import { Course, CourseCardProps } from '../../../types/curses';
import { Tooltip } from '../../Tooltip';
import { cn } from '../../../lib/cn';


export const CourseCard = ({
    course,
    loadCourses,
    is_staff = false
}: CourseCardProps) => {
    const navigate = useNavigate();
    const courses = useCourse();
    const { openModal, closeModal } = useModal();
    const { showToast } = useToast();
    const tagRef = useRef<HTMLSpanElement>(null);

    const tags: string[] = course?.tegs 
        ? course.tegs.split(',').map((t: string) => t.trim()).filter(Boolean) 
        : [];

    const handleView = () => {
        navigate(`/courses/${course.id}`);
    };

    const OpenEditCourse = (course: Course) => {
        openModal({
            id: 'admin-course-edit',
            width: "lg",
            title: (
                <span className="flex items-center gap-2">
                    <div className="w-fit nz-background-accent rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                        <Edit2 className="w-5 h-5" />
                        <span className="nz-foreground">Edit course</span>
                    </div>
                </span>
            ),
            content: (
                <CourseManage
                    onSuccess={courses.loadCourses}
                    onDelete={DeleteCourse}
                    course={course}
                />
            ),
        });
    };

    const DeleteCourse = async () => {
        try {
            openModal({
                id: 'confirm-delete-course',
                title: 'Course delete',
                content: (
                    <ConfirmModal
                        message="You really want to delete this course?."
                        confirmText="Yes, delete"
                        cancelText="Cancel"
                        onConfirm={async () => {
                            await getCsrfToken();
                            await deleteCourse(course.id);
                            if (loadCourses) loadCourses();
                            showToast('success', 'Course deleted', 'Course successfuly deleted.');
                            closeModal();
                        }}
                        onCancel={closeModal}
                    />
                ),
            });
        } catch (error) {
            showToast('error', 'Помилка', 'Не вдалося видалити курс.');
        }
    };

    const difficultyLower = (course?.level || 'medium').toLowerCase();

    const difficultyColor = {
        easy: 'nz-foreground bg-green-500/50',
        medium: 'nz-foreground bg-yellow-500/50',
        hard: 'nz-foreground bg-red-500/50',
    } as const;

    const colorClass = difficultyColor[difficultyLower as keyof typeof difficultyColor] || 'text-gray-500 bg-gray-500/10';

    return (
        <Card
            onClick={handleView}
            size="wf"
            variant="card_primary"
            className="relative group transition-all duration-300 border overflow-hidden min-h-[22vh] hover:nz-background-secondary cursor-pointer rounded-3xl"
        >
            {/* Обкладинка / Іконка */}
            <div className="h-40 bg-gradient-to-br from-zinc-800 to-zinc-950 relative overflow-hidden">
                {course.image ? (
                    <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-16 h-16" />
                    </div>
                )}

                {/* Бейдж рівня */}
                <div className="absolute top-3 left-3">
                    <span className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full border", colorClass)}>
                        {course.level?.toUpperCase() || 'BEGINNER'}
                    </span>
                </div>
            </div>

            <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2 transition-colors">
                    {course.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-3 min-h-[58px]">
                    {course.description || 'No description...'}
                </p>

                {/* Нижня частина */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            {course.points ? course.points + " pts" : "Free"}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatRelativeTime(course.created_at) || '?'}
                        </div>
                    </div>

                    {/* Теги */}
                    {tags.length !== 0 && (
                        <Tooltip text={tags.join(", ")}>
                            <span onClick={(e) => {e.stopPropagation()}}
                                ref={tagRef}
                                className="text-xs px-2.5 py-1 nz-background-accent rounded-full border group-hover:nz-background-primary cursor-default"
                            >
                                Tags
                            </span>
                        </Tooltip>
                    )}
                </div>
            </CardContent>

            {/* Кнопки для адміна */}
            {is_staff && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); OpenEditCourse(course); }}
                        className="p-2 nz-background-primary hover:nz-background-accent rounded-full"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </Card>
    );
};