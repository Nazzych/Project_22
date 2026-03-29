import { ArrowLeft, Star, Calendar, Github, TriangleAlert, Code2, MessageCircle, GitBranch, FileText, File, LineChart, FolderTree, CircleDot, BookOpen, Book, Tag, XCircle, Folder, Save, Fullscreen, Copy, X, FolderOpen, MinusCircle, Download, CopyCheck, Check, MonitorDot, Activity, Archive, CheckCircle2 } from 'lucide-react';
import { FullscreenFileView } from '../components/shared/modal/modals/projects/FileView';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'
import { useEffect, useState } from 'react';
import { getProject, getTree, getFile, downloadFile, updateFile, deleteFile, renameFile } from '../api/projects';
import { Project, FileNode, extensionToLanguage, languageColors } from '../types/projects';
import { useToast } from '../providers/MessageProvider';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatJoinDate } from '../lib/formatDate';
import { getCsrfToken } from '../api/auth';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../contexts/ProfileContext';
import { useModal } from '../hooks/useModal';
import { FileExplorerProps } from '../types/projects';
import { CodeEditor } from '../components/CodeEditor';
import { ActionsCellProj } from '../components/ActionCell';
import { cn } from '../lib/cn';


const ProjectPage = () => {
    const { projectIdSlug } = useParams();
    const navigate = useNavigate();
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; text: string } | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { profile } = useProfile();
    const { showToast } = useToast();
    const { openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editContent, setEditContent] = useState<string>('');
    const [fileContent, setFileContent] = useState<string>('');

    var isModified = editContent !== fileContent;

    useEffect(() => {
        // const { showToast } = useToast();
        const id = parseInt(projectIdSlug?.split('-')[0] || '', 10);
        if (!isNaN(id)) {
            getProject(id)
                .then((data) => {
                    setProject(data);
                    setError(null);
                    // showToast ('error', 'Get project failed', `${data}`);
                })
                .catch((err) => {
                    console.error('Error fetching project:', err);
                    setError('Can\'t upload project. Maybe, it isnyje or happened server error.');
                })
                .finally(() => setLoading(false));
        } else {
            setError('Uncorect inditificator of project.');
            setLoading(false);
        }
    }, [projectIdSlug]);

    const tags = project?.technologies
        ? project.technologies.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : null;

    const TABS = [
        {
            id: 'overview',
            label: 'Description',
            icon: FileText,
            count: [project?.title, project?.description, project?.technologies, project?.image].filter(Boolean).length,
        },
        {
            id: 'code',
            label: 'Code',
            icon: Code2,
            // count: 42,
        },
        {
            id: 'coments',
            label: 'Coments',
            icon: MessageCircle,
            // count: 12,
        },
        {
            id: 'history',
            label: 'History',
            icon: CircleDot,
            // count: 5,
        },
        {
            id: 'pulls',
            label: 'Pull Requests',
            icon: GitBranch,
            // count: 3,
        }
    ]
    const [activeTab, setActiveTab] = useState<string>(TABS[0].id);
    const handleTabChange = (newTab: string) => {
        if (newTab !== activeTab) {
            setActiveTab(newTab);
        }
    };

    const RenderTree = ({
        node,
        prefix = '',
        isLast = true,
        isRoot = true,
    }: {
        node: FileNode;
        prefix?: string;
        isLast?: boolean;
        isRoot?: boolean;
    }) => {
        const connector = isRoot ? '' : isLast ? '└── ' : '├── ';
        const icon =
            node.type === 'folder' ? (
                <Folder className="inline w-4 h-4 mr-1 text-yellow-500" />
            ) : (
                <File className="inline w-4 h-4 mr-1 text-blue-500" />
            );

        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        const children = node.children || [];
//? {node.name.replace ("root", "main")}
        return (
            <>
                <div className="font-mono text-sm">
                    <span className="nz-text-muted">{prefix + connector}</span>
                    {icon}
                    {node.name.replace ("root", "CODEHUB")}
                </div>
                {/* <div className="font-mono text-sm m-2">
                    <span className="nz-text-muted">{prefix + connector}</span>
                    <span className='p-1 nz-background-accent rounded-md w-fit'>{icon}{node.name}</span>
                </div> */}

                {children.map((child, index) => (
                    <RenderTree
                    key={child.name + child.type}
                    node={child}
                    prefix={newPrefix}
                    isLast={index === children.length - 1}
                    isRoot={false}
                    />
                ))}
            </>
        );
    };

    const [structure, setStructure] = useState<FileNode | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            if (!project) return;
                await getCsrfToken();
            const data = await getTree(project.id);
            setStructure(data);
        };
        fetchData();
    }, [project?.id]);

    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    useEffect(() => {
    if (selectedFile && fileContent !== editContent) {
        setEditContent(fileContent);
    }
    }, [selectedFile]);

// Додаємо стани для редагування
    const [editingFileName, setEditingFileName] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

// Функція початку редагування
    const startRename = (entry: FileNode) => {
        setEditingFileName(entry.name);
        setEditValue(entry.name);
    };

// Збереження нової назви
    const saveRename = async (entry: FileNode) => {
        //? console.info('saveRename викликано для файлу:', entry.name);
        //? console.info('Нова назва:', editValue);

        if (!editValue.trim() || editValue === entry.name) {
            cancelRename();
            return;
        }

        try {
            await renameFile(Number(entry.file_id), entry.path, editValue);
            showToast('success', 'Renamed', `File renamed to ${editValue}`);
            // refreshFiles(); // оновлення списку
        } catch (err) {
            console.error('Помилка перейменування:', err);
            showToast('error', 'Error renaming', "We can't rename file.");
        } finally {
            cancelRename();
        }
    };

// Скасування
    const cancelRename = () => {
        setEditingFileName(null);
        setEditValue('');
    };

    useEffect(() => {
        const newContent = localStorage.getItem('savedFile');
        setEditContent(newContent!);
        localStorage.removeItem('savedFile');
    }, []);

    const handleFullScreenHide = async () => {
        // showToast("info", "[DEBUG]", `${newContent}`)
        closeModal();
        const saved = localStorage.getItem('isSaved');
        if (saved == "true") {
            showToast("info", "Changes detected")
            localStorage.setItem('isSaved', "true");
            setIsSaving(true);
            const timeout = setTimeout(() => {
                setIsSaving(false);
                localStorage.removeItem('isSaved');
            }, 20000);
            return () => clearTimeout(timeout);
        }
        const newContent = localStorage.getItem('savedFile');
        setEditContent(newContent!);
        localStorage.removeItem('savedFile');
    };


    const saveFile = async (projectId: number, path: string, content: string) => {
        try {
            showToast("success", "Saved!", `Changes saved after 25 sec.`);
            const newContent = localStorage.getItem('savedFile');
            if (newContent) {
                setEditContent(newContent);
                setFileContent(newContent);
                await updateFile(projectId, {path, content: newContent});
            } else {
                await updateFile(projectId, {path, content});
                setFileContent(content);
                setEditContent(content);
            }
            setIsSaving(true);
            localStorage.setItem('isSavingFile', 'true');
        } catch (error) {
            showToast("error", "Save failed", `Could not save the file.\n${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setTimeout(() => {
                localStorage.removeItem('isSavingFile')
                setIsSaving(false)
            }, 20000);
        }
    };

    const ClockdeleteFile = async (projectId: number, filePath: string) => {
        await deleteFile(projectId, String(currentFolder?.name + "/" + filePath));
        showToast("success", "Deleted!", `File - "${filePath}" deleted successfully.`);
        setSelectedFile(null);
        setFileContent('');
        if (currentFolder && currentFolder.children) {
            const updatedChildren = currentFolder.children.filter(child => child.name !== filePath);
            setCurrentFolder({ ...currentFolder, children: updatedChildren });
        }
    };

    const handleDownloadFile = async (projectId: number, path: string, content: string) => {
        try {
            await getCsrfToken();
            await downloadFile(projectId, { path, content });

            const freshContent = await getFile(projectId, `${currentFolder?.name || ''}/${path}`);
            const blob = new Blob([freshContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = path.split('/').pop() || 'file.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast ("info", "Download started", `Your file "${path.split('/').pop()}" is downloading.`);
        } catch (error) {
            showToast("error", "Download failed", `Could not download the file.\n${error instanceof Error ? error.message : String(error)}`);
            console.error(error);
        }
    };

    const [getFileError, setGetFileError] = useState(false);
    const handleFileClick = async (file: FileNode) => {
        if (!file) showToast("error", "No file selected", "Please select a file to view.");
        if (file.type === "file") {
            await getCsrfToken();
            const filePath = file.path || file.name;
            const content = await getFile(project!.id, filePath);
            setFileContent(content);
            setEditContent(content);
            setSelectedFile(file);
            if (content === "✕ Error retrieving file content") {
                showToast("error", "Server Error", "Please try again later.");
                setGetFileError(true);
            }
        }
    };

    const openFile = (title: string, folder: string) => {
        openModal({
            id: 'project-fullscreen',
            width: 'wf',
            x: false,
            title: (
                <span className="flex items-center gap-2">
                    <div className="w-fit nz-background-accent rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                        <File className="w-5 h-5 text-blue-400" />
                        <span className="nz-foreground">{title}</span>
                    </div>
                </span>
            ),
            content: (
                <FullscreenFileView
                    fileContent={fileContent}
                    editContent={editContent}
                    setEditContent={setEditContent}
                    file={selectedFile}
                    project={project!}
                    onDownload={() => handleDownloadFile(project!.id, String(currentFolder?.name + "/" + selectedFile?.name), editContent)}
                    onSave={() => saveFile(project!.id, folder, editContent)}
                    onDelete={() => ClockdeleteFile(project!.id, selectedFile?.name || '')}
                    onClose={() => handleFullScreenHide()}//TODO: handleFullScreenHide()
                />
            ),
        });
    };

    const FileExplorer = ({ node, onFileOpen }: FileExplorerProps) => {
        const [open, setOpen] = useState(true);

        const handleClick = () => {
            if (node.type === 'folder') {
                setOpen(!open);
            } else {
                onFileOpen(node);
            }
        };

        return (
            <div className="ml-4">
                <div
                    className="flex items-center gap-2 cursor-pointer hover:text-primary"
                    onClick={handleClick}
                >
                    {node.type === 'folder' ? (
                        <Folder className="w-4 h-4 text-yellow-500" />
                    ) : (
                        <File className="w-4 h-4 text-blue-500" />
                    )}
                    <span>{node.name}</span>
                </div>

                {node.type === 'folder' && open && (
                    <div className="ml-4">
                        {node.children?.map(child => (
                            <FileExplorer key={child.path} node={child} onFileOpen={onFileOpen} />
                        ))}
                    </div>
                )}
            </div>
        );
    };
    const [currentFolder, setCurrentFolder] = useState<FileNode | null>(structure);
    const [history, setHistory] = useState<FileNode[]>([]);
    useEffect(() => {
        setCurrentFolder(structure);
        setHistory([]);
    }, [structure]);

    const countLanguages = (node: FileNode, counts: Record<string, number> = {}) => {
        if (node.type === 'file') {
            const ext = node.name.split('.').pop()?.toLowerCase();
            const lang = ext && extensionToLanguage[ext];
            if (lang) {
            counts[lang] = (counts[lang] || 0) + 1;
            }
        } else if (node.children) {
            node.children.forEach(child => countLanguages(child, counts));
        }
        return counts;
    };
    const languageStats = structure ? countLanguages(structure) : {};
    const sortedLanguages = Object.entries(languageStats).sort((a, b) => b[1] - a[1]);

    if (loading) return <LoadingSpinner size={20} text="Loading..." />;

    if (error) {
        return (
            <div className="flex justify-center">
                <div className="flex justify-center items-center gap-4 p-3 nz-background-secondary border nz-border rounded-md nz-text-foreground">
                    <h2 className="flex flex-col items-center nz-text-warning text-lg font-semibold"><TriangleAlert className='w-12 h-12' />Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex justify-center">
                <div className="flex justify-center items-center gap-4 p-3 nz-background-secondary border nz-border rounded-md nz-text-foreground">
                    <h2 className="flex flex-col items-center nz-text-warning text-lg font-semibold"><TriangleAlert className='w-12 h-12' />Error</h2>
                    <p>Can't get project data from server!</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Button
                variant="btn_secondary"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-2 rounded-lg"
            >
                <ArrowLeft className="h-4 w-4" />
                Go Back
            </Button>
            <div className="rounded-2xl p-6 md:p-8 nz-background-primary relative overflow-hidden border">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    {/* Project Icon/Image */}
                    <div className="h-32 w-full md:w-32 rounded-2xl overflow-hidden shrink-0 border-2 shadow-xl">
                        {project.image ? (
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex justify-center items-center h-full w-full nz-background-accent">
                                <Folder className="w-16 h-16 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 nz-foreground">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold line-clamp-2">
                                    {project.title}
                                </h1>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap">
                                <Button
                                    variant="btn_secondary"
                                    size="sm"
                                    className="glass h-9 text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10"
                                >
                                    <Star className="h-4 w-4 mr-2 fill-current text-yellow-400" />
                                    <span className='text-yellow-400'>Star</span>
                                    <span className="ml-2 px-1.5 py-0.5 bg-yellow-400/20 rounded-full text-xs text-yellow-200">
                                        {project.stars.toLocaleString()}
                                    </span>
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm nz-text-muted">
                            <div className="flex items-center gap-2">
                                <img
                                    src={project.owner.profile.avatar_url}
                                    alt="-"
                                    className="w-8 h-8 border object-cover rounded-full"
                                />
                                <span className="font-medium nz-foreground hover:underline hover:cursor-pointer">@{project.owner.username}</span>
                            </div>
                            <span className='text-xl font-bold'>•</span>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatJoinDate(project.created_at)}</span>
                            </div>
                            <span className='text-xl font-bold'>•</span>
                            <div className="inline-flex items-center gap-2">
                                {project.status === 'active' && <Activity className="w-4 h-4 nz-text-primary" />}
                                {project.status === 'completed' && <CheckCircle2 className="w-4 h-4 nz-text-accent" />}
                                {project.status === 'archived' && <Archive className="w-4 h-4 nz-text-secondary" />}
                                <span className="font-medium capitalize">
                                    {project.status || 'unknown'}
                                </span>
                            </div>
                            {project.github_url && (
                                <>                                
                                    <span className='text-xl font-bold'>•</span>
                                    <div>
                                        <Link to={String (project.github_url)} target="_blank" className="flex items-center gap-1 hover:text-sky-400 transition-colors">
                                            <Github className="h-4 w-4" />
                                            View to GitHub
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-b overflow-x-auto scrollbar-hide mt-4">
                <div className="flex border-b border-border bg-muted/50 gap-6 min-w-max px-2">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <div className="relative nz-text-muted">
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center gap-2 pb-3 px-1 transition-all ${activeTab === tab.id && 'nz-foreground'}`}
                                >
                                    {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="addproj-tab-underline"
                                        className="absolute bottom-0 left-1 right-1 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-full"
                                    />
                                    )}
                                    {Icon && <Icon className="h-4 w-4" />}
                                    <span>{tab.label}</span>
                                    {tab.count && (
                                    <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-xs">
                                        {tab.count}
                                    </span>
                                    )}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="px-0 md:px-4">
                    {activeTab === 'overview' && (
                        <div>
                            <div className="w-full my-4">
                                <Card size='wf' className="overflow-hidden border">
                                    <CardContent className="p-4 max-w-none space-y-6">
                                        <div>
                                            <p className='flex items-center gap-2 text-xl font-bold mb-2 py-1 px-2 nz-background-accent rounded-md w-fit'>• <File className='w-5 h-5' />Title</p>
                                            <div className="text-lg nz-foreground pl-8 leading-relaxed">
                                                {project.title || <p className='flex items-center gap-2 nz-text-destructive'><XCircle className='w-6 h-6' />No name of current project</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <p className='flex items-center gap-2 text-xl font-bold mb-2 py-1 px-2 nz-background-accent rounded-md w-fit'>• <Book className='w-5 h-5' />Description of project</p>
                                            <div className="text-lg nz-foreground pl-8 leading-relaxed">
                                                {project.description || <p className='flex items-center gap-2 nz-text-muted'><XCircle className='w-6 h-6' />No description</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <p className='flex items-center gap-2 text-xl font-bold mb-2 py-1 px-2 nz-background-accent rounded-md w-fit'>• <Tag className='w-5 h-5' />Used tehnologies in project</p>
                                            {tags ? (
                                                <div>
                                                    <div className="flex flex-wrap gap-2 pl-8">
                                                        {tags.map((tag, index) => (
                                                            <span
                                                                key={`${tag}-${index}`}
                                                                className="nz-background-primary text-sm font-medium px-3 py-1 rounded-full"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className='flex items-center pl-8 gap-2 nz-text-muted'><XCircle className='w-6 h-6' />No tags</p>
                                            )}
                                        </div>
                                        {sortedLanguages.length > 0 && (
                                            <div>
                                                <p className="flex items-center gap-2 text-xl font-bold mb-2 py-1 px-2 nz-background-accent rounded-md w-fit">
                                                    • <LineChart className="w-5 h-5" />Used languages in project
                                                </p>
                                                <div className="w-[95%] space-y-2 pl-8">
                                                {sortedLanguages.map(([lang, count]) => {
                                                    const total = sortedLanguages.reduce((sum, [, c]) => sum + c, 0);
                                                    return (
                                                        <ProgressBar
                                                            key={lang}
                                                            value={count}
                                                            max={total}
                                                            label={lang}
                                                            showValue
                                                            colorClass={languageColors[lang] || 'bg-gradient-to-r from-gray-300 to-gray-500'}
                                                        />
                                                    );
                                                })}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="w-full">
                                <Card size='wf' className="overflow-hidden border">
                                    <CardHeader className="bg-white/5 border-b py-3 px-4 text-xl flex flex-row items-center gap-2">
                                        <BookOpen className="h-8 w-8 p-1 nz-background-accent rounded-lg nz-text-foreground" />
                                        <span className="font-medium">README.md</span>
                                    </CardHeader>
                                    <CardContent className="p-8 max-w-none">
                                        <ReactMarkdown>{project?.readme || "❌ No added README.md file!"}</ReactMarkdown>
                                    </CardContent>
                                </Card>
                            </div>
                            <div>
                                <Card size='wf' className="mt-4 overflow-hidden border">
                                    <CardHeader className="bg-white/5 border-b py-3 px-4 flex flex-row items-center gap-2">
                                    <FolderTree className="h-8 w-8 p-1 nz-background-accent rounded-lg nz-text-foreground" />
                                        <h2 className="text-xl font-semibold mb-2">Project structure</h2>
                                    </CardHeader>
                                    <CardContent className="p-8 max-w-none">
                                        {structure && (
                                            <pre className="font-mono text-sm whitespace-pre">
                                                <RenderTree node={structure} />
                                            </pre>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === "code" && (
                        <div className="w-full space-y-4 mt-4">
                            <Card size="wf" className="overflow-hidden rounded-lg border">
                                <CardHeader className="flex flex-row justify-between items-center border-b bg-muted px-4 py-2">
                                    {currentFolder !== structure ? (
                                        <>
                                            <p className="text-lg font-medium"><FolderOpen className="inline-block mr-2" />{currentFolder?.name}/</p>
                                            <Button
                                                className="text-md rounded-full"
                                                onClick={() => {
                                                    if (history.length > 0) {
                                                    setCurrentFolder(history[history.length - 1]);
                                                    setHistory(history.slice(0, -1));
                                                    setSelectedFile(null);
                                                    }
                                                }}
                                            >
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                cd ..
                                            </Button>
                                        </>
                                    ) : (
                                        <h2 className="text-lg font-medium py-2">Code Explorer</h2>
                                    )}
                                </CardHeader>

                                <CardContent className="p-0">
                                    <div className="flex min-h-[calc(100vh-280px)] justify-between flex-col md:flex-row overflow-hidden">
                                        <div className="w-full max-h-[90vh] md:w-1/2 border-r overflow-auto">
                                            <table className="w-full text-sm text-left text-white">
                                                <thead className="nz-background-primary text-xs uppercase">
                                                    <tr>
                                                        <th className="px-4 py-2">NAME</th>
                                                        <th className="px-4 py-2">LAST COMMIT</th>
                                                        <th className="px-4 py-2">UPDATED</th>
                                                        <th className="px-4 py-2"><MonitorDot className='w-4 h-4' /></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentFolder?.children?.map((entry: FileNode, idx: number) => (
                                                        <tr
                                                            key={idx}
                                                            className={cn("border-y hover:nz-background-accent hover:nz-text-hover cursor-default", entry.name === selectedFile?.name ? "nz-bg-primary nz-text-primary" : "")}
                                                            onClick={() => {
                                                                if (entry.type === "folder") {
                                                                    setHistory([...history, currentFolder]);
                                                                    setCurrentFolder(entry);
                                                                    setSelectedFile(null);
                                                                } else {
                                                                    handleFileClick(entry);
                                                                }
                                                            }}
                                                        >
                                                            <td className="px-4 py-2 flex items-center gap-2">
                                                                {entry.type === "folder" ? (
                                                                    <Folder className="w-5 h-5 text-yellow-300" />
                                                                ) : (
                                                                    <File className="w-5 h-5 text-blue-400" />
                                                                )}
                                                                {editingFileName === entry.name ? (
                                                                    <input
                                                                        type="text"
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                saveRename(entry);
                                                                            } else if (e.key === 'Escape') {
                                                                                cancelRename();
                                                                            }
                                                                        }}
                                                                        onBlur={() => saveRename(entry)}
                                                                        autoFocus
                                                                        className="bg-transparent border-b-2 text-white outline-none flex-1 min-w-0"
                                                                        onFocus={(e) => {
                                                                            const dotIndex = entry.name.lastIndexOf('.');
                                                                            const end = dotIndex > 0 ? dotIndex : entry.name.length;
                                                                            e.target.setSelectionRange(0, end);
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span className="flex-1 min-w-0 truncate">{entry.name}</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2">{entry.content || "-"}</td>
                                                            <td className="px-4 py-2">{entry.uploaded_at || "-"}</td>
                                                            <td><ActionsCellProj entry={entry} startRename={startRename} onDelete={() => {}} onShare={() => {}} /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="w-full md:w-1/2 overflow-y-auto nz-background-secondary flex flex-col">
                                            {selectedFile ? (
                                                <div className="flex flex-col h-full md:space-y-1 space-y-0">
                                                    {profile && project.owner.username === profile.username ? (
                                                        <>
                                                            <div className="relative flex-1">
                                                                <CodeEditor
                                                                    value={editContent}
                                                                    file={String(selectedFile?.name)}
                                                                    onChange={(newValue) => setEditContent(newValue)}
                                                                />
                                                                {isSaving && (
                                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-md">
                                                                        <div className="text-center px-6 py-4 nz-background-secondary rounded-xl border border-zinc-600">
                                                                            <LoadingSpinner text="Saving and safyting with security checking..." />
                                                                            <p className="mt-2 text-right text-xs nz-text-muted">*Can take 30 seconds.</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap sm:flex-nowrap p-4 md:p-2 justify-between items-center gap-2 md:gap-3">
                                                                {getFileError ? (
                                                                <p className="flex items-center gap-2 font-bold text-red-500">
                                                                    <TriangleAlert className="w-5 h-5" />
                                                                    No can get the file!
                                                                </p>
                                                                ) : (
                                                                    <div className="inline-flex flex-wrap sm:flex-nowrap rounded-full overflow-hidden border border-zinc-700 bg-zinc-900/80">
                                                                        <Button
                                                                            className="rounded-none rounded-l-full px-4 py-2"
                                                                            onClick={async () => {
                                                                                await navigator.clipboard.writeText(editContent);
                                                                                setCopied(true);
                                                                                showToast("success", "Copied!", "Content copied to clipboard.");
                                                                                setTimeout(() => setCopied(false), 1500);
                                                                            }}
                                                                            disabled={!editContent}
                                                                        >
                                                                            {copied ? (
                                                                                <CopyCheck className="w-4 h-4 text-green-400" />
                                                                            ) : (
                                                                                <Copy className="w-4 h-4" />
                                                                            )}
                                                                        </Button>
                                                                        <Button
                                                                            className="rounded-none px-4 py-2 relative"
                                                                            onDoubleClick={() => handleDownloadFile(project.id, selectedFile.path || selectedFile.name, editContent)}
                                                                            disabled={isSaving || !editContent}
                                                                        >
                                                                            <Download className="w-4 h-4" />
                                                                            <span className='absolute -bottom-1 text-[7px] nz-text-muted'>Double click</span>
                                                                        </Button>
                                                                        <span className="relative"
                                                                            onMouseEnter={(e) => {
                                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                                setTooltipPos({ top: rect.top, left: rect.left + rect.width / 2, text: 'Open fullscreen the file' });
                                                                            }}
                                                                            onMouseLeave={() => setTooltipPos(null)}>
                                                                            <Button
                                                                                className="relative px-4 py-2 rounded-none"
                                                                                onClick={() =>
                                                                                    openFile(
                                                                                        selectedFile.name,
                                                                                        String (currentFolder?.name + "/" + (selectedFile.path || selectedFile.name))
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Fullscreen className="w-4 h-4" />
                                                                                {/* <span className='absolute -bottom-1 text-[7px] nz-text-muted'>TEHNICAL FIX</span> */}
                                                                            </Button>
                                                                            {tooltipPos && (
                                                                                <div 
                                                                                    className="fixed w-max max-w-xs nz-background-accent border rounded-md shadow-lg p-2 text-xs nz-text-foreground z-50 whitespace-pre-wrap break-words pointer-events-none animate-in fade-in"
                                                                                    style={{
                                                                                        top: `${tooltipPos.top}px`,
                                                                                        left: `${tooltipPos.left}px`,
                                                                                        transform: 'translate(-50%, -110%)',
                                                                                    }}
                                                                                >
                                                                                    {tooltipPos.text}
                                                                                </div>
                                                                            )}
                                                                        </span>
                                                                        <span className="relative"
                                                                            onMouseEnter={(e) => {
                                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                                setTooltipPos({ top: rect.top, left: rect.left + rect.width / 2, text: 'Delete the current file' });
                                                                            }}
                                                                            onMouseLeave={() => setTooltipPos(null)}>
                                                                            <Button
                                                                                className="rounded-none px-4 py-2 relative"
                                                                                onDoubleClick={() => ClockdeleteFile(project.id, selectedFile.path || selectedFile.name)}
                                                                                disabled={isSaving}
                                                                            >
                                                                                <MinusCircle className="w-4 h-4" />
                                                                                <span className='absolute -bottom-1 text-[7px] nz-text-muted'>Double click</span>
                                                                            </Button>
                                                                            {tooltipPos && (
                                                                                <div 
                                                                                    className="fixed w-max max-w-xs nz-background-accent border rounded-md shadow-lg p-2 text-xs nz-text-foreground z-50 whitespace-pre-wrap break-words pointer-events-none animate-in fade-in"
                                                                                    style={{
                                                                                        top: `${tooltipPos.top}px`,
                                                                                        left: `${tooltipPos.left}px`,
                                                                                        transform: 'translate(-50%, -110%)',
                                                                                    }}
                                                                                >
                                                                                    {tooltipPos.text}
                                                                                </div>
                                                                            )}
                                                                        </span>
                                                                        <Button
                                                                            className="rounded-none rounded-r-full px-4 py-2"
                                                                            onClick={async () => {
                                                                                if (!selectedFile?.name) {
                                                                                    showToast("error", "Error", "No path or file");
                                                                                    return;
                                                                                }
                                                                                await saveFile(project.id, String(currentFolder?.name + "/" + (selectedFile.path || selectedFile.name)), editContent);
                                                                                setSaved(true);
                                                                                setTimeout(() => setSaved(false), 1500);
                                                                            }}
                                                                            disabled={!isModified || isSaving}
                                                                        >
                                                                            {saved ? (
                                                                                <Check className="w-4 h-4 text-green-400" />
                                                                            ) : (
                                                                                <Save className="w-4 h-4" />
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                <Button
                                                                    className="rounded-full px-3 py-2"
                                                                    onClick={() => setSelectedFile(null)}
                                                                >
                                                                    <X className="w-4 h-4 mr-2" />
                                                                    Close
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <pre className="flex-1 whitespace-pre-wrap text-white bg-zinc-900 p-4 rounded text-sm overflow-auto min-h-[40vh] md:min-h-[55vh]">
                                                            {fileContent || <LoadingSpinner size={20} text="Loading the contenr..." />}
                                                        </pre>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-zinc-500">
                                                    <p>Chose file for preview and manage</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {activeTab === "coments" && (
                            <div className="w-full my-4">
                                <Card size='wf' className="overflow-hidden border">
                                    <CardContent className="p-4 prose prose-invert max-w-none">
                                        <p>Coments here</p>
                                    </CardContent>
                                </Card>
                            </div>
                    )}

                    {activeTab === "history" && (
                            <div className="w-full my-4">
                                <Card size='wf' className="overflow-hidden border">
                                    <CardContent className="p-4 prose prose-invert max-w-none">
                                        <p>History yeap!</p>
                                    </CardContent>
                                </Card>
                            </div>
                    )}

                    {activeTab === "pulls" && (
                            <div className="w-full my-4">
                                <Card size='wf' className="overflow-hidden border">
                                    <CardContent className="p-4 prose prose-invert max-w-none">
                                        <p>Pulls! But what is it, I don't know?</p>
                                    </CardContent>
                                </Card>
                            </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ProjectPage;
