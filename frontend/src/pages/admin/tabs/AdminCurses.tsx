import React from 'react';
import { Plus, CirclePlus, Edit2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useModal } from '../../../hooks/useModal';
import { CourseManage } from '../../../components/shared/modal/modals/admin/CourseManage';
import { useCourse } from '../hooks/useCourse';
import CourseFilters from '../components/courses/CourseFilters';
import CourseGrid from '../components/courses/CourseGrid';


export default function AdminChallenges() {
    const { openModal } = useModal();
    const courses = useCourse();

    const OpenAddCourse = () => {
        openModal({
            id: 'admin-course',
            width: "lg",
            title: (
                <span className="flex items-center gap-2">
                    <div className="w-fit nz-background-accent rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                        <CirclePlus className="w-5 h-5" />
                        <span className="nz-foreground">Add course</span>
                    </div>
                </span>
            ),
            content: (
                <CourseManage 
                    onSuccess={courses.loadCourses}
                />
            ),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
                <CourseFilters 
                    search={courses.search}
                    setSearch={courses.setSearch}
                    difficulty={courses.difficulty}
                    setDifficulty={courses.setDifficulty}
                    language={courses.language}
                    setLanguage={courses.setLanguage}
                    clearFilters={courses.clearFilters}
                    filtersActive={courses.filtersActive}
                />
                <Button onClick={OpenAddCourse}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                </Button>
            </div>

            <CourseGrid 
                courses={courses.filteredCourses}
                loading={courses.loading}
            />
        </div>
    );
}