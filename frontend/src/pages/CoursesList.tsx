import React, { useState, useEffect } from 'react';
import { Search, Laptop, X, XCircle, Library } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { Tasks } from '../types/tasks';
import { tasksList } from '../api/tasks';
import { Skeleton } from '../components/LoadingSpinner';

export function CoursesList() {
    const { showToast } = useToast();

    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [language, setLanguage] = useState('');
    const [showCompleted, setShowCompleted] = useState(true);
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<Tasks[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Tasks[]>([]);

    // Завантаження завдань
    const loadTasks = async () => {
        setLoading(true);
        try {
            const data = await tasksList();
            setTasks(data);
            setFilteredTasks(data);
        } catch (err) {
            showToast('error', 'Get tasks failed', `${err}`);
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     loadTasks();
    // }, []);

    // Фільтрація (пошук + складність + мова)
    useEffect(() => {
        let result = [...tasks];

        // Пошук по назві та тегах
        if (search.trim()) {
            const searchLower = search.toLowerCase().trim();
            result = result.filter(task =>
                task.title.toLowerCase().includes(searchLower) ||
                task.tegs?.toLowerCase().includes(searchLower)
            );
        }

        // Фільтр по складності
        if (difficulty) {
            result = result.filter(task => task.difficul?.toLowerCase() === difficulty.toLowerCase());
        }

        // Фільтр по мові
        if (language) {
            result = result.filter(task => task.language?.toLowerCase() === language.toLowerCase());
        }

        setFilteredTasks(result);
    }, [search, difficulty, language, tasks]);

    // Очищення всіх фільтрів
    const clearFilters = () => {
        setSearch('');
        setDifficulty('');
        setLanguage('');
    };

    // Чи активні фільтри (для показу хрестика)
    const filtersActive = search.trim() || difficulty || language;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="challenges-hub"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
            >
                <div className="space-y-8">
                    <div className="flex flex-wrap justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold nz-foreground flex items-center gap-3">
                                <Library className="h-8 w-8 text-primary" />
                                Courses
                            </h1>
{/* TODO: {count} courses completed */}
                            <p className="text-muted-foreground mt-1">
                                {filteredTasks.length} courses found
                            </p>
                        </div>
                        <Button
                            className="rounded-full"
                            variant={showCompleted ? 'btn_secondary' : 'btn_accent'}
                            onClick={() => setShowCompleted(!showCompleted)}
                        >
                            {showCompleted ? 'Hide' : 'Show'} Completed
                        </Button>
                    </div>

                    {/* Фільтри */}
                    <div className="flex flex-col md:flex-row nz-background-secondary gap-4 p-4 rounded-2xl relative">
                        {/* Пошук */}
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Search courses or tags..."
                                icon={<Search className="h-4 w-4" />}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Складність */}
                        <Select
                            className="w-full md:w-[150px] nz-background-accent rounded-xl"
                            placeholder="Difficulty"
                            options={[
                                { value: 'easy', label: 'Easy' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'hard', label: 'Hard' },
                            ]}
                            value={difficulty}
                            onChange={(value) => setDifficulty(value)}
                        />

                        {/* Мова */}
                        <Select
                            className="w-full md:w-[150px] nz-background-accent rounded-xl"
                            placeholder="Language"
                            options={[
                                { value: 'JavaScript', label: 'JavaScript' },
                                { value: 'Python', label: 'Python' },
                                { value: 'TypeScript', label: 'TypeScript' },
                                { value: 'Java', label: 'Java' },
                            ]}
                            value={language}
                            onChange={(value) => setLanguage(value)}
                        />

                        {/* Хрестик очищення (показується, коли є хоч один активний фільтр) */}
                        {filtersActive && (
                            <Button
                                variant="btn_glass"
                                size="icon"
                                onClick={clearFilters}
                                title="Clear all filters"
                                className="absolute top-2 right-2 md:static md:w-12 glass"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Список завдань */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, idx) => (
                                <div key={idx} className="w-full">
                                    <Skeleton className="h-32 w-full mb-4" />
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))
                        ) : filteredTasks.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center nz-foreground">
                                <XCircle className="w-12 h-12 mb-4 text-muted-foreground" />
                                <p className="text-lg font-medium">No challenges found</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Try changing filters or reload the page
                                </p>
                            </div>
                        ) : (
                            filteredTasks.map((card) => (
                                <div key={card.id} className="col-span-1">
                                    <p className="text-lg font-bold">{card.title}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}