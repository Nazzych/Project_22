import React, { useEffect, useRef } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';

interface QuizQuestion {
    id: string;
    question_text: string;
    options: string[];
    correct_answer: number;
}

interface QuizChallengeManageProps {
    questions: QuizQuestion[];
    setQuestions: (update: any) => void;
}

export function QuizChallengeManage({ questions, setQuestions }: QuizChallengeManageProps) {
    const currentQuestions = Array.isArray(questions) ? questions : [];
    // const initialized = useRef(false);
    //? && !initialized.current

    useEffect(() => {
        if (currentQuestions.length === 0) {
            // initialized.current = true;
            addQuestion();
        }
    }, [currentQuestions.length]);
    // useEffect(() => {
    //     setQuestions((prev: QuizQuestion[]) => {
    //         // Якщо в стейті вже щось є, нічого не додаємо
    //         if (prev.length > 0) return prev;
    //         // Якщо порожньо — створюємо перше
    //         return [{ 
    //             id: crypto.randomUUID(), 
    //             question_text: '', 
    //             options: ['', '', '', ''], 
    //             correct_answer: 0 
    //         }];
    //     });
    // }, []);

    const addQuestion = () => {
        setQuestions((prev: QuizQuestion[]) => [
            ...prev, 
            { 
                id: crypto.randomUUID(), 
                question_text: '', 
                options: ['', '', '', ''], 
                correct_answer: 0 
            }
        ]);
    };

    const removeQuestion = (id: string) => {
        if (currentQuestions.length <= 1) return;
        setQuestions((prev: QuizQuestion[]) => prev.filter(q => q.id !== id));
    };

    const updateQuestionText = (id: string, text: string) => {
        setQuestions((prev: QuizQuestion[]) => prev.map(q =>
            q.id === id ? { ...q, question_text: text } : q
        ));
    };

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        setQuestions((prev: QuizQuestion[]) => prev.map(q => {
            if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const setCorrectAnswer = (questionId: string, index: number) => {
        setQuestions((prev: QuizQuestion[]) => prev.map(q =>
            q.id === questionId ? { ...q, correct_answer: index } : q
        ));
    };

    return (
        <div className="space-y-8 text-left">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Questions ({currentQuestions.length})
                </h3>
                <Button type="button" onClick={addQuestion} variant="btn_accent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                </Button>
            </div>

            <AnimatePresence mode="popLayout">
                {currentQuestions.map((question, index) => (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="border rounded-3xl p-6 nz-background-accent mb-4"
                    >
                        <div className="flex justify-between mb-4">
                            <span className="nz-text-muted text-md font-medium">Question {index + 1}</span>
                            {currentQuestions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(question.id)}
                                    className="text-red-400 hover:text-red-500 transition-colors"
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
                            {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={question.correct_answer === optIndex}
                                        onChange={() => setCorrectAnswer(question.id, optIndex)}
                                        className="accent-emerald-500 w-4 h-4"
                                    />
                                    <Input
                                        value={option}
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