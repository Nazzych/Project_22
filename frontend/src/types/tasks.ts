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
};

export interface ChallengeViewProps {
    challenge: any;
}
