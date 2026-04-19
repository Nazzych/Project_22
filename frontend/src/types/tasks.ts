export type Tasks = {
    id: number;
    title: string;
    description: string;
    tegs: string;
    status: string;
    e_input: string;
    e_output: string;
    c_type: string;
    code: string;
    questions: [question_text: string, answers: []];
    difficul: string;
    language: string;
    points: number;
    created_at: string;
    updated_at: string;
};

export interface ChallengeViewProps {
    challenge: any;
}
