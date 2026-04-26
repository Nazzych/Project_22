export type Tasks = {
    id: number;
    title: string;
    description: string;
    tags: string;
    status: string;
    c_type: string;
    questions: [question_text: string, answers: []];
    difficulty: string;
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
