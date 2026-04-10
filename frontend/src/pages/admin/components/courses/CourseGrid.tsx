import React from 'react';
import { XCircle } from 'lucide-react';
import { Skeleton } from '../../../../components/LoadingSpinner';
import { CourseCard } from '../../../../components/shared/cards/CourseCard';
import { Course } from '../../../../types/curses';

interface CourseGridProps {
    courses: Course[];
    loading: boolean;
    isStaff?: boolean;
}

export default function CourseGrid({ courses, loading, isStaff = true }: CourseGridProps) {
    if (loading) {
        return (
            <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}>
                            <Skeleton className="h-52 w-full rounded-[18px]" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <XCircle className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No curses found</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Try changing filters or reload the page
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                    is_staff={isStaff}
                />
            ))}
        </div>
    );
}