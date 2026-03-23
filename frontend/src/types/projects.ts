export type FileExplorerProps = {
    node: FileNode;
    onFileOpen: (file: FileNode) => void;
};

export type ProjectCardProps = {
    id: number;
    proj: any,
    title: string;
    description: string;
    technologies: string[];
    status: string;
    image?: string;
    isGithubRepo?: boolean;
    owner: {
        id: string;
        username: string;
    };
    onEdit?: (projectId: number) => void;
    loadProjs: any;
};

export interface ProjectFormProps {
    onSuccess: () => void;
    onDelete?: () => void;
    project?: Project;
}

export type EditableProject = {
    title: string;
    description: string;
    readme: string;
    technologies: string;
    status: string;
    github_url?: string;
    live_url?: string;
    image?: string;
};

export type ProjectEditFormProps = {
    project: Project;
    onSave: (updated: EditableProject) => void;
    onDelete: () => void;
    onCancel: () => void;
};

export type Project = {
    id: number;
    owner: {
        id: string;
        username: string;
        email: string;
        profile: {
            avatar_url: string;
        }
    };
    title: string;
    description: string;
    readme: string;
    github_url?: string;
    live_url?: string;
    technologies: string;
    status: string;
    image?: string;
    created_at: string;
};

export type FileNode = {
    name: string;
    path: string;
    type: 'file' | 'folder';
    uploaded_at?: string;
    file_id?: number;
    content?: string;
    children?: FileNode[];
};

export interface ActionsCellProps {
    entry: FileNode;
    startRename: (entry: FileNode) => void;
    onDelete: () => void;
    onShare: () => void;
}


export type FullscreenFileViewProps = {
    fileContent: string;
    editContent: string;
    file: FileNode | null;
    project: Project;
    onDownload: () => void;
    onSave: () => void;
    onDelete: () => void;
    onClose: () => void;
    setEditContent: React.Dispatch<React.SetStateAction<string>>;
};

export const extensionToLanguage: Record<string, string> = {
    js: 'JavaScript',
    ts: 'TypeScript',
    tsx: 'TypeScript',
    py: 'Python',
    pyc: 'Python (compiled)',
    json: 'JSON',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    md: 'Markdown',
    ini: 'INI',
    yml: 'YAML',
    yaml: 'YAML',
    pem: 'PEM',
    txt: 'TXT',
    pdf: 'PDF',
    csv: 'Csv',
    sqlite3: 'Sqlite3',
    xml: 'XML',
    c: 'C',
    cpp: 'CPP',
    cs: 'CSharp',
    go: 'Go',
    java: 'Java',
    dart: 'Dart',
    rust: 'Rust',
    swift: 'Swift',
    bath: 'Bath',
    shadowroot: 'ShadowRoot',
};

export const languageColors: Record<string, string> = {
    TXT: 'bg-gradient-to-r from-gray-400 to-gray-600',
    PDF: 'bg-gradient-to-r from-red-400 to-red-600',
    Markdown: 'bg-gradient-to-r from-green-400 to-green-600',
    INI: 'bg-gradient-to-r from-pink-400 to-pink-600',
    Bath: 'bg-gradient-to-r from-blue-400 to-blue-600',
    ShadowRoot: 'bg-gradient-to-r from-gray-400 to-gray-600',
    JSON: 'bg-gradient-to-r from-gray-400 to-gray-600',
    Csv: 'bg-gradient-to-r from-green-400 to-green-600',
    Sqlite3: 'bg-gradient-to-r from-green-400 to-green-600',
    XML: 'bg-gradient-to-r from-gray-400 to-gray-600',
    PEM: 'bg-gradient-to-r from-violet-400 to-violet-600',
    YAML: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    YML: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    Python: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    JavaScript: 'bg-gradient-to-r from-yellow-300 to-yellow-600',
    TypeScript: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    HTML: 'bg-gradient-to-r from-red-400 to-red-600',
    HTM: 'bg-gradient-to-r from-red-400 to-red-600',
    CSS: 'bg-gradient-to-r from-blue-400 to-blue-600',
    PHP: 'bg-gradient-to-r from-purple-400 to-purple-600',
    Go: 'bg-gradient-to-r from-cyan-400 to-cyan-600',
    Java: 'bg-gradient-to-r from-red-400 to-red-600',
    C: 'bg-gradient-to-r from-blue-400 to-blue-600',
    CPP: 'bg-gradient-to-r from-blue-400 to-blue-600',
    CSharp: 'bg-gradient-to-r from-green-400 to-green-600',
    Dart: 'bg-gradient-to-r from-blue-400 to-blue-600',
    Rust: 'bg-gradient-to-r from-orange-400 to-orange-600',
    Swift: 'bg-gradient-to-r from-orange-400 to-orange-600',
};