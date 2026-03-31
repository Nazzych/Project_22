import { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../../providers/MessageProvider';
import { tasksList } from '../../../api/tasks';
import { Tasks } from '../../../types/tasks';

export const useChallenges = () => {
    const [tasks, setTasks] = useState<Tasks[]>([]);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [language, setLanguage] = useState('');
    const [loading, setLoading] = useState(true);

    const { showToast } = useToast();

    const loadTasks = async () => {
        setLoading(true);
        try {
            const data = await tasksList();
            setTasks(data);
        } catch (err) {
            showToast('error', 'Не вдалося завантажити завдання', String(err));
        } finally {
            setLoading(false);
        }
    };

    // Фільтровані завдання
    const filteredTasks = useMemo(() => {
        let result = [...tasks];

        if (search.trim()) {
            const q = search.toLowerCase().trim();
            result = result.filter(task =>
                task.title?.toLowerCase().includes(q) ||
                task.tegs?.toLowerCase().includes(q)
            );
        }

        if (difficulty) {
            result = result.filter(task => 
                task.difficul?.toLowerCase() === difficulty.toLowerCase()
            );
        }

        if (language) {
            result = result.filter(task => 
                task.language?.toLowerCase() === language.toLowerCase()
            );
        }

        return result;
    }, [tasks, search, difficulty, language]);

    const clearFilters = () => {
        setSearch('');
        setDifficulty('');
        setLanguage('');
    };

    const filtersActive = !!(search.trim() || difficulty || language);

    useEffect(() => {
        loadTasks();
    }, []);

    return {
        tasks,
        filteredTasks,
        search,
        setSearch,
        difficulty,
        setDifficulty,
        language,
        setLanguage,
        loading,
        loadTasks,
        clearFilters,
        filtersActive,
    };
};