import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useModal } from '../hooks/useModal';
import { ChallangeManage } from '../components/shared/modal/modals/admin/ChallangeManage'
import { ChallengeCard } from '../components/shared/cards/ChellangeCard';
import { useToast } from '../providers/MessageProvider'
import { Tasks } from '../types/tasks';
import { tasksList } from '../api/tasks';
import { LoadingSpinner } from '../components/LoadingSpinner'
import {
    X,
    XCircle,
    ShieldAlert,
    Users,
    MessageSquareCode,
    Code2,
    Trash2,
    Plus,
    Search,
    CheckCircle,
    Activity,
    LayoutDashboard,
    AlertTriangle,
    ExternalLink,
} from 'lucide-react'
const TABS = [
    {
        id: 'dashboard',
        label: 'Overview',
        icon: LayoutDashboard,
    },
    {
        id: 'forum',
        label: 'Forum',
        icon: MessageSquareCode,
    },
    {
        id: 'challenges',
        label: 'Challenges',
        icon: Code2,
    },
]
export function AdminPanel() {
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('dashboard')
    const [searchQuery, setSearchQuery] = useState('')

    const { openModal, closeModal } = useModal();

    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [language, setLanguage] = useState('');
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

    useEffect(() => {
        loadTasks();
    }, []);

    // Очищення всіх фільтрів
    const clearFilters = () => {
        setSearch('');
        setDifficulty('');
        setLanguage('');
    };

    // Чи активні фільтри (для показу хрестика)
    const filtersActive = search.trim() || difficulty || language;

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

    const OpenAddChallange = () => {
        openModal({
            id: 'admin-challange',
            width: "xl",
            x: false,
            title: (
                <span className="flex items-center gap-2">
                    <div className="w-fit nz-background-accent rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                        <Code2 className="w-5 h-5" />
                        <span className="nz-foreground">Challange manage</span>
                    </div>
                </span>
            ),
            content: (
                <ChallangeManage 
                    onSuccess={loadTasks}
                    onDelete={() => closeModal()}
                />
            ),
        });
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/20">
                        <ShieldAlert className="h-7 w-7 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Control Center</h1>
                        <p className="nz-foreground">
                            System administration & content management
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border-green-500/30 text-green-400 text-sm font-medium">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    System Online
                </div>
            </div>

            {/* Custom Tabs */}
            <div className="relative border-b">
                <div className="flex gap-8">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative pb-4 flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === tab.id ? 'nz-foreground' : 'nz-text-muted hover:nz-text-hover'}`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="admin-tab-underline"
                                        className="absolute bottom-0 left-1 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-full"
                                        transition={{
                                            type: 'spring',
                                            bounce: 0.2,
                                            duration: 0.6,
                                        }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: -20,
                        }}
                        className="space-y-6 w-full"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card size='wf' className="hover:border-green-500/20 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl nz-background-accent">
                                            <Code2 className="h-6 w-6" />
                                        </div>
                                        +12%
                                    </div>
                                    <div className="text-3xl font-bold mb-1">
                                        14
                                    </div>
                                    <div className="text-sm nz-foreground">
                                        Total Challenges
                                    </div>
                                </CardContent>
                            </Card>

                            <Card size='wf' className="hover:border-blue-500/20 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                            <MessageSquareCode className="h-6 w-6" />
                                        </div>
                                        +5%
                                    </div>
                                    <div className="text-3xl font-bold mb-1">
                                        541 071
                                    </div>
                                    <div className="text-sm nz-foreground">
                                        Forum Posts
                                    </div>
                                </CardContent>
                            </Card>

                            <Card size='wf' className="hover:border-purple-500/20 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        +24
                                    </div>
                                    <div className="text-3xl font-bold mb-1">142</div>
                                    <div className="text-sm nz-foreground">
                                        Active Users
                                    </div>
                                </CardContent>
                            </Card>

                            <Card size='wf' className="hover:border-green-500/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                                            <Activity className="h-6 w-6" />
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="text-3xl font-bold mb-1">99.9%</div>
                                    <div className="text-sm nz-foreground">
                                        System Uptime
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Activity */}
                            <Card size="wf" className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* {forumPosts.slice(0, 5).map((post) => ( */}
                                            <div
                                                // key={post.id}
                                                className="flex items-center justify-between p-3 nz-background-secondary rounded-xl hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                                                        {/* {post.author[0]} */}
                                                        Andre K
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Cyber Security</div>
                                                        <div className="text-xs nz-foreground">
                                                        {/* by {post.author} • {post.date} */}
                                                        by Andre K • 14.03.26
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="btn_glass" size="sm">
                                                    View
                                                </Button>
                                            </div>
                                        {/* ))} */}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card size='wf' className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('challenges')}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New Challenge
                                    </Button>
                                    <Button className="w-full justify-start">
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        View Reports
                                    </Button>
                                    <Button className="w-full justify-start">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        System Logs
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'forum' && (
                    <motion.div
                        key="forum"
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: -20,
                        }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <div className="w-full max-w-md">
                                <Input
                                    placeholder="Search posts..."
                                    icon={<Search className="h-4 w-4" />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {/* {filteredPosts.map((post) => ( */}
                                <div
                                // key={post.id}
                                className="flex items-center justify-between border p-4 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full border flex items-center justify-center font-bold group-hover:nz-bg-hover">
                                        AK
                                    </div>
                                    <div>
                                        <h3 className="font-medium group-hover:text-primary transition-colors">
                                            Cyber Security
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs nz-foreground mt-1">
                                            <span>Andre K</span>
                                            <span>•</span>
                                            {/* <Badge
                                                variant="outline"
                                                className="text-[10px] h-5 px-1.5"
                                            >
                                            {post.category}
                                            </Badge> */}
                                            <span>Save team</span>
                                            <span>•</span>
                                            <span>14.03.26</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="btn_destructive"
                                    size="sm"
                                    // onClick={() => deleteForumPost(post.id)}python manage.py migrate; python manage.py makemigratio
                                    onClick={() => {}}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                                </div>
                            {/* ))}
                            {filteredPosts.length === 0 && (
                                <div className="text-center py-10 nz-foreground">
                                No posts found
                                </div>
                            )} */}
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center nz-foreground">
                                <XCircle className="w-12 h-12 mb-4 text-muted-foreground" />
                                <p className="text-lg font-medium">No posts found</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Try changing filters or reload the page
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'challenges' && (
                    <motion.div
                        key="challenges"
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: -20,
                        }}
                        className="space-y-6"
                    >
{/* Фільтри */}
                        <div className="flex flex-col lg:flex-row gap-2 justify-between lg:items-center">
                            <div className="flex flex-col lg:flex-row nz-background-secondary gap-4 p-4 rounded-2xl relative">
                                {/* Пошук */}
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Search challenges or tags..."
                                        icon={<Search className="h-4 w-4" />}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                {/* Складність */}
                                <Select
                                    className="w-full lg:w-[150px] nz-background-accent rounded-xl"
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
                                    className="w-full lg:w-[150px] nz-background-accent rounded-xl"
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
                                        className="lg:absolute lg:top-2 lg:right-2 lg:static w-full lg:w-12 glass"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <Button onClick={() => OpenAddChallange()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Challenge
                            </Button>
                        </div>
{/* Список завдань */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                                {loading ? (
                                    <div className="col-span-full flex justify-center items-center py-12">
                                        <LoadingSpinner text="Завантаження завдань..." />
                                    </div>
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
                                        <ChallengeCard
                                            key={card.id}
                                            is_staff={true}
                                            challenge={card}
                                            loadChallenges={() => loadTasks()}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
