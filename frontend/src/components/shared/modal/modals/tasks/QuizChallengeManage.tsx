import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';

interface BackendQuizAnswer {
    id?: number;
    answer_text: string;
    is_correct: boolean;
}

interface BackendQuizQuestion {
    id?: number;
    question_text: string;
    order?: number;
    answers?: BackendQuizAnswer[];
}

interface QuizQuestion {
    id: string;
    question_text: string;
    options: string[];
    correct_answer: number;
    backend_question_id?: number;
}

interface QuizChallengeManageProps {
    questions: (QuizQuestion | BackendQuizQuestion)[] | null | undefined;
    setQuestions: (update: any) => void;
}

export function QuizChallengeManage({ questions: rawQuestions, setQuestions }: QuizChallengeManageProps) {
    // ✅ Безпечне отримання питань
    const safeQuestions = Array.isArray(rawQuestions) ? rawQuestions : [];
    const currentQuestions = safeQuestions;

    // Конвертує бекенд формат в локальний
    const convertBackendToLocal = useCallback((backendQuestions: BackendQuizQuestion[]): QuizQuestion[] => {
        return backendQuestions.map(q => ({
            id: `local_${q.id || 0}_${crypto.randomUUID().slice(0, 8)}`,
            backend_question_id: q.id,
            question_text: q.question_text || '',
            options: (q.answers || []).map((a: BackendQuizAnswer) => a.answer_text || ''),
            correct_answer: (q.answers || []).findIndex((a: BackendQuizAnswer) => a.is_correct)
        })).filter(q => q.question_text.trim()); // Фільтруємо порожні
    }, []);

    // ✅ Безпечна обробка питань
    const processedQuestions = useMemo(() => {
        if (currentQuestions.length === 0) return [];
        
        const firstQuestion = currentQuestions[0];
        
        // Якщо це бекенд формат
        if ('answers' in firstQuestion && firstQuestion.answers) {
            return convertBackendToLocal(currentQuestions as BackendQuizQuestion[]);
        }
        
        // Якщо локальний формат
        return currentQuestions.filter((q: any) => q && q.options && Array.isArray(q.options)) as QuizQuestion[];
    }, [currentQuestions, convertBackendToLocal]);

    // Ініціалізує перше питання якщо порожньо
    useEffect(() => {
        if (processedQuestions.length === 0) {
            addQuestion();
        }
    }, []); // ✅ Порожній dependency array

    const addQuestion = () => {
        setQuestions((prev: QuizQuestion[]) => [
            ...prev.filter(Boolean), // ✅ Фільтруємо undefined
            { 
                id: crypto.randomUUID(), 
                question_text: '', 
                options: ['', '', '', ''], 
                correct_answer: 0 
            }
        ]);
    };

    const removeQuestion = (id: string) => {
        if (processedQuestions.length <= 1) return;
        setQuestions((prev: QuizQuestion[]) => 
            prev.filter(q => q && q.id !== id)
        );
    };

    const updateQuestionText = (id: string, text: string) => {
        setQuestions((prev: QuizQuestion[]) => prev.map(q =>
            q && q.id === id ? { ...q, question_text: text } : q
        ));
    };

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        setQuestions((prev: QuizQuestion[]) => prev.map(q => {
            if (q && q.id === questionId) {
                const newOptions = [...(q.options || ['', '', '', ''])];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const setCorrectAnswer = (questionId: string, index: number) => {
        setQuestions((prev: QuizQuestion[]) => prev.map(q =>
            q && q.id === questionId ? { ...q, correct_answer: index } : q
        ));
    };

    return (
        <div className="space-y-8 text-left">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Questions ({processedQuestions.length})
                </h3>
                <Button type="button" onClick={addQuestion} variant="btn_accent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                </Button>
            </div>

            <AnimatePresence mode="popLayout">
                {processedQuestions.map((question) => (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="border rounded-3xl p-6 nz-background-accent mb-4"
                    >
                        <div className="flex justify-between mb-4">
                            <span className="nz-text-muted text-md font-medium">
                                Question {processedQuestions.indexOf(question) + 1}
                                {question.backend_question_id && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                                        ID: {question.backend_question_id}
                                    </span>
                                )}
                            </span>
                            {processedQuestions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(question.id)}
                                    className="text-red-400 hover:text-red-500 transition-colors"
                                    title="Remove question"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <Textarea
                            value={question.question_text}
                            onChange={(e) => updateQuestionText(question.id, e.target.value)}
                            placeholder="Enter your question here..."
                            rows={3}
                            className="mb-6"
                        />

                        <div className="space-y-4">
                            {(question.options || []).map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={question.correct_answer === optIndex}
                                        onChange={() => setCorrectAnswer(question.id, optIndex)}
                                        className="accent-emerald-500 w-4 h-4"
                                    />
                                    <Input
                                        value={option || ''}
                                        onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                        className="flex-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}