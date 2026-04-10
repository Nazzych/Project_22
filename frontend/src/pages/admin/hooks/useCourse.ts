import { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../../providers/MessageProvider';
import { getCourses } from '../../../api/admin';
import { Course } from '../../../types/curses';

export const useCourse = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [language, setLanguage] = useState('');
    const [loading, setLoading] = useState(true);

    const { showToast } = useToast();

    const loadCourses = async () => {
        setLoading(true);
        try {
            const data = await getCourses();
            setCourses(data);
        } catch (err) {
            showToast('error', 'Не вдалося завантажити завдання', String(err));
        } finally {
            setLoading(false);
        }
    };

    // Фільтровані завдання
    const filteredCourses = useMemo(() => {
        let result = [...courses];

        if (search.trim()) {
            const q = search.toLowerCase().trim();
            result = result.filter(task =>
                task.title?.toLowerCase().includes(q) ||
                task.tegs?.toLowerCase().includes(q)
            );
        }

        if (difficulty) {
            result = result.filter(task => 
                task.level?.toLowerCase() === difficulty.toLowerCase()
            );
        }

        if (language) {
            result = result.filter(task => 
                task.category?.toLowerCase() === language.toLowerCase()
            );
        }

        return result;
    }, [courses, search, difficulty, language]);

    const clearFilters = () => {
        setSearch('');
        setDifficulty('');
        setLanguage('');
    };

    const filtersActive = !!(search.trim() || difficulty || language);

    useEffect(() => {
        loadCourses();
    }, []);

    return {
        courses,
        filteredCourses,
        search,
        setSearch,
        difficulty,
        setDifficulty,
        language,
        setLanguage,
        loading,
        loadCourses,
        clearFilters,
        filtersActive,
    };
};