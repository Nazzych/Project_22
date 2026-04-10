import { Profile } from "../types/profile"

export interface Course {
    id: string;
    title: string;
    description: string;
    tegs: string;
    level: string;
    category: string;
    points: number;
    image: string;
    created_at: string;
    author: Profile;
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
}