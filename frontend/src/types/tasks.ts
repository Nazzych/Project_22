export type Tasks = {
    id: number;
    title: string;
    description: string;
    tags: string;
    status: string;
    c_type: string;
    questions: [question_text: string, answers: []];
    difficulty: string;
    language: string;
    points: number;
    created_at: string;
    updated_at: string;
    user_progress?: {
        status: string;
        submitted_code?: string;
        submitted_at?: string;
        mentor_feedback?: string;
        mentor_score?: number;
        completed_at?: string;
        attempts?: number;
    } | null;
};

export interface ChallengeViewProps {
    challenge: any;
}


export interface ChallengeCardProps {
    challenge: any;
    loadChallenges?: () => void;
    is_staff: boolean;
}

export const LANGUAGE_LABELS: Record<string, string> = {
    py: "Python",
    go: "Go",
    dart: "Dart",
    rs: "Rust",
    kt: "Kotlin",
    swift: "Swift",
    java: "Java",
    js: "JavaScript",
    ts: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    html: "HTML",
    css: "CSS",
    c: "C",
    cpp: "C++",
    md: "Markdown",
    json: "JSON",
    xml: "XML",
    csv: "CSV",
    yaml: "YAML",
    yml: "YML",
    pem: "PEM",
    env: "Env",
    sqlite3: "SQLite3",
    db: "Database",
    sh: "Shell Script",
    bat: "Batch",
    ini: "INI",
};
