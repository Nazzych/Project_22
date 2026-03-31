import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useModal } from '../hooks/useModal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ProjectCard } from '../components/shared/cards/ProjectCard';
import { useNavigate } from 'react-router-dom';
import { Search, FolderGit2, Folder, Plus, X, Flame, CheckCircle, Star, Layers2, Code2, XCircle } from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';
import { ProjectManage } from '../components/shared/modal/modals/projects/ProjectManage';
import { fetchProjects } from '../api/projects';
import { useToast } from '../hooks/useToast';
import { Skeleton } from '../components/LoadingSpinner';
import { Project } from '../types/projects';

export function ProjectsHub() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();

    const handleViewProject = (userId: string, projectId: string) => {
        navigate(`/projects/${userId}/${projectId}`);
    };

    const clearFilters = () => {
        setSearchQuery('')
    }

    const { profile } = useProfile();
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
    const { openModal, closeModal } = useModal();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const tab = activeTab === 'my' ? 'my' : 'all';
            const data = await fetchProjects(tab);
            setProjects(data);
        } catch (err) {
            showToast('error', 'Get project failed', `${err}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, [activeTab]);

    const handleClick = () => {
        openModal({
            id: 'create-project',
            x: false,
            width: "lg",
            title: (
                <div className='w-fit flex flex-row justify-center items-center gap-2'>
                    <Code2 className="w-5 h-5 text-primary" /> Add Project
                </div>
            ),
            content: (
                <ProjectManage
                    onSuccess={() => loadProjects()}
                />
            ),
        });
    };

    return (
        <>
            {loading ? (
                <div className="p-6 space-y-8">
                    {/* Заголовок */}
                    <div className="flex flex-col md:flex-row justify-start md:justify-between md:items-center gap-3">
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-6 w-[50%]" />
                        </div>
                        <Skeleton className="h-8 w-28 rounded-[125px]" />
                    </div>

                    {/* Пошук */}
                    <Skeleton className="h-12 w-full rounded-[18px]" />

                    {/* Таби */}
                    <Skeleton className="h-6 w-[25%] rounded-lg" />

                    {/* Список проектів */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mt-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-52 md:h-60 w-full rounded-[18px]" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="projects-hub"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold nz-foreground flex items-center gap-3">
                                        <FolderGit2 className="h-8 w-8 text-primary" />
                                        Project HUB
                                    </h1>
                                    <p className="text-muted-foreground mt-1">
                                        There you can manage your projects and explore others.
                                    </p>
                                </div>
                                <div className="relative flex p-1 border nz-background-secondary rounded-full overflow-hidden w-fit">
                                    <motion.div
                                        layout
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className={`absolute top-1 bottom-1 left-1 w-24 rounded-full nz-background-primary z-0 ${activeTab === 'my' ? 'left-1/2' : 'left-0'
                                            }`}
                                    />
                                    <button
                                        className={`relative z-10 w-24 py-1 text-sm font-medium rounded-full transition-all duration-300 ${activeTab === 'all' ? 'text-white' : 'text-muted-foreground'
                                            }`}
                                        onClick={() => setActiveTab('all')}
                                    >
                                        All Projects
                                    </button>
                                    <button
                                        className={`relative z-10 w-24 py-1 text-sm font-medium rounded-full transition-all duration-300 ${activeTab === 'my' ? 'text-white' : 'text-muted-foreground'
                                            }`}
                                        onClick={() => setActiveTab('my')}
                                    >
                                        My Projects
                                    </button>
                                </div>
                            </div>
                            {/* Search Input */}
                            <div className="flex flex-row nz-background-secondary gap-4 p-4 rounded-2xl">
                                <div className="w-full">
                                    <Input
                                        placeholder="Python, C++, AI/ML, Maxon, @шгш..."
                                        icon={<Search className="h-4 w-4" />}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div>
                                    {(searchQuery) && (
                                        <Button
                                            variant="btn_glass"
                                            size="icon"
                                            onClick={clearFilters}
                                            title="Clear filters"
                                            className="glass"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {/* Projects Section */}
                            <div>
                                <div className='flex flex-col md:flex-row gap-4 justify-between items-start text-2xl font-bold text-foreground mb-4 transition-all duration-300'>
                                    <div className='flex flex-row items-center gap-2'>
                                        <Folder className="h-6 w-6" />
                                        <span>Projects</span>
                                        <span className='text-accent'>
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={activeTab}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {activeTab === 'all' ? 'All' : 'My'}
                                                </motion.span>
                                            </AnimatePresence>
                                        </span>
                                    </div>
                                </div>
                                {activeTab === 'all' ? (
                                    <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {projects.length === 0 ? (
                                                <div className="flex flex-row col-span-full p-2 text-center nz-foreground">
                                                    <XCircle className="mr-2" /> You haven't added any projects yet. Click "Add Project" to create your first one!
                                                </div>
                                            ) : projects.map((card) => (
                                                    <ProjectCard
                                                        key={card.id}
                                                        id={card.id}
                                                        proj={card}
                                                        title={card.title}
                                                        description={card.description}
                                                        technologies={card.technologies.split(', ')}
                                                        status={card.status}
                                                        image={card.image}
                                                        owner={card.owner}
                                                        canEdit={false}
                                                        loadProjs={() => {}}
                                                    />
                                                ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="my" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Left: Projects */}
                                            <div className="lg:col-span-2 space-y-6 max-h-4xl overflow-y-auto">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                                    {projects.length === 0 ? (
                                                        <div className="flex flex-row col-span-full p-2 text-center nz-foreground">
                                                            <XCircle className="mr-2" /> You haven't added any projects yet. Click "Add Project" to create your first one!
                                                        </div>
                                                    ) : projects.map((card) => (
                                                            <ProjectCard
                                                                key={card.id}
                                                                id={card.id}
                                                                proj={card}
                                                                title={card.title}
                                                                description={card.description}
                                                                technologies={card.technologies.split(', ')}
                                                                status={card.status}
                                                                image={card.image}
                                                                owner={card.owner}
                                                                canEdit={true}
                                                                loadProjs={() => {}}
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                            {/* Right: Sticky Profile */}
                                            <div className="hidden lg:block">
                                                <div className="relative">
                                                    {/* Banner */}
                                                    <div className="h-40 rounded-3xl overflow-hidden relative border border-white/10">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 animate-pulse-neon" />
                                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent" />
                                                    </div>
                                                    {/* Profile Info */}
                                                    <div className="px-2 md:px-10 -mt-20 relative z-10 p-4 nz-background-primary rounded-b-3xl">
                                                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                                                            <div className="relative group w-fit">
                                                                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                                                                <div className="relative z-10">
                                                                    <img
                                                                        src={profile?.profile.avatar_url}
                                                                        alt="User avatar"
                                                                        className="h-20 w-20 rounded-full object-cover border border-white/10 shadow-md nz-ring" />
                                                                    <div className="absolute bottom-1 -right-2 nz-background-accent nz-foreground border border-primary text-[9.5px] font-bold px-2 py-1 rounded-full shadow-sm">
                                                                        LVL {profile?.profile.total_points || "0"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 space-y-2 mt-2 md:mb-4">
                                                                <div className="flex flex-col">
                                                                    <h1 className="text-2xl font-bold nz-foreground tracking-tight">
                                                                        {profile?.first_name} {profile?.last_name}
                                                                    </h1>
                                                                    <p className="font-medium nz-text-muted">
                                                                        @{profile?.username.toLocaleLowerCase()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='m-2 my-6 flex flex-col md:flex-row gap-2'>
                                                            <div className='w-full nz-background-accent p-2 rounded-lg flex flex-col items-center'>
                                                                <span className='font-semibold text-md'>{profile?.profile.global_rank || 0}</span>
                                                                <p className='nz-text-muted text-[10px]'>Projects</p>
                                                            </div>
                                                            <div className='w-full nz-background-accent p-2 rounded-lg flex flex-col items-center'>
                                                                <span className='font-semibold text-md'>{profile?.profile.total_points ?? 0}</span>
                                                                <p className='nz-text-muted text-[10px]'>Points</p>
                                                            </div>
                                                            <div className='w-full nz-background-accent p-2 rounded-lg flex flex-col items-center'>
                                                                <span className='font-semibold text-md'># {profile?.profile.global_rank || "N/A"}</span>
                                                                <p className='nz-text-muted text-[10px]'>Rank</p>
                                                            </div>
                                                        </div>
                                                        <div className='flex flex-col gap-4 mx-2 mb-4'>
                                                            <div className='w-full flex flex-row items-center gap-2'>
                                                                <CheckCircle className="h-5 w-5" />
                                                                <p className='nz-text-muted'>{profile?.profile.problems_solved || 0} challenges solved</p>
                                                            </div>
                                                            <div className='w-full flex flex-row items-center gap-2'>
                                                                <Flame className="h-5 w-5" />
                                                                <p className='nz-text-muted'>{profile?.profile.current_streak || 0} day streak</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button onClick={() => handleClick()} size='wf' variant="btn_primary" className='my-4 rounded-xl border-none'>
                                                        <Plus className='h-6 w-6 mr-2' />
                                                        Add Project
                                                    </Button>
                                                    <div className='mb-4'>
                                                        <Card size='wf' variant='card_primary' className='border-none'>
                                                            <CardContent className='pt-4'>
                                                                <h1 className='flex flex-row gap-2 items-center nz-text-primary ml-1 text-md font-bold'>
                                                                    <Star className="h-5 w-5" />
                                                                    Top Skils
                                                                </h1>
                                                            </CardContent>
                                                            <CardContent className="space-y-4">
                                                                <ProgressBar colorClass='nz-bg-primary' label="JavaScript" value={75} />
                                                                <ProgressBar colorClass='nz-bg-secondary' label="React" value={60} />
                                                                <ProgressBar colorClass='nz-bg-accent' label="Algorithms" value={45} />
                                                                <ProgressBar colorClass='nz-bg-primary' label="Python" value={80} />
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                    <div>
                                                        <Card size='wf' variant='card_primary' className='border-none'>
                                                            <CardContent className='pt-4'>
                                                                <h1 className='flex flex-row gap-2 items-center nz-text-primary ml-1 text-md font-bold'>
                                                                    <Layers2 className="h-5 w-5" />
                                                                    Project Stats
                                                                </h1>
                                                            </CardContent>
                                                            <CardContent className="space-y-2">
                                                                <div className='flex flex-row justify-between'>
                                                                    <span className='flex flex-row items-center gap-2'>
                                                                        <span className="h-2 w-2 rounded-full bg-red-500" data-id="element-1014"></span>
                                                                        <p className='nz-text-muted'>Active</p>
                                                                    </span>
                                                                    <span className='font-bold'>1</span>
                                                                </div>
                                                                <div className='flex flex-row justify-between'>
                                                                    <span className='flex flex-row items-center gap-2'>
                                                                        <span className="h-2 w-2 rounded-full bg-green-500" data-id="element-1014"></span>
                                                                        <p className='nz-text-muted'>Completed</p>
                                                                    </span>
                                                                    <span className='font-bold'>0</span>
                                                                </div>
                                                                <div className='flex flex-row justify-between'>
                                                                    <span className='flex flex-row items-center gap-2'>
                                                                        <span className="h-2 w-2 rounded-full bg-blue-500" data-id="element-1014"></span>
                                                                        <p className='nz-text-muted'>Archived</p>
                                                                    </span>
                                                                    <span className='font-bold'>0</span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </>
    );
}
