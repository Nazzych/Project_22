import { Profile } from "../types/profile"

export interface Course {
    id: string;
    author: Profile;
    title: string;
    description: string;
    tags: string;
    level: string;
    category: string;
    points: number;
    image: string;
    created_at: string;
    updated_at: string;
    lessons: Lesson;
    lessons_count: number;
    completed_lessons_count: number;
}

export interface CourseManageProps {
    onSuccess: () => void;
    onDelete?: () => void;
    course?: Course;
}

export interface CourseCardProps {
    course: any;
    loadCourses?: () => void;
    is_staff?: boolean;
}

export interface Lesson {
    id: string;
    title: string;
    content: string;
    order: number;
    url: string;
    is_unlocked?: boolean;
    is_completed?: boolean;
}