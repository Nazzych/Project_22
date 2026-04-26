import React, { useState, useCallback, useEffect } from 'react';
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
    backend_question_id?: number;
}

interface QuizChallengeManageProps {
    questions: QuizQuestion[];
    setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
}

export function QuizChallengeManage({ questions, setQuestions }: QuizChallengeManageProps) {
    // ✅ Безпечний ID generator
    const generateId = useCallback(() => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    useEffect(() => {
        if (!questions || questions.length === 0) {
            setQuestions([{
                id: crypto.randomUUID(),
                question_text: '',
                options: ['', '', '', ''],
                correct_answer: 0,
            }]);
        }
    }, []);

    const addQuestion = () => {
        setQuestions((prev: any[]) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                question_text: '',
                options: ['', '', '', ''],
                correct_answer: 0,
            }
        ]);
    };
    const removeQuestion = useCallback((id: string) => {
        if (questions.length <= 1) return;
        setQuestions(prev => prev.filter(q => q.id !== id));
    }, [questions.length, setQuestions]);

    const updateQuestionText = useCallback((id: string, text: string) => {
        setQuestions(prev => prev.map(q => 
            q.id === id ? { ...q, question_text: text } : q
        ));
    }, [setQuestions]);

    const updateOption = useCallback((questionId: string, optionIndex: number, value: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    }, [setQuestions]);

    const setCorrectAnswer = useCallback((questionId: string, index: number) => {
        setQuestions(prev => prev.map(q =>
            q.id === questionId ? { ...q, correct_answer: index } : q
        ));
    }, [setQuestions]);

    // ✅ Ініціалізація першого питання
    useEffect(() => {
        if (questions.length === 0) {
            addQuestion();
        }
    }, []); // ✅ Порожній dependency

    return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center -mt-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Questions ({questions.length})
                </h3>
                <Button 
                    type="button" 
                    onClick={addQuestion} 
                    variant="btn_accent" 
                    size="sm"
                    className="px-4 h-9"
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add
                </Button>
            </div>

            <AnimatePresence mode="popLayout">
                {questions.map((question, index) => (
                    <motion.div
                        key={question.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border border-zinc-700/50 rounded-2xl p-5 bg-card/50 backdrop-blur-sm shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                            <span className="text-muted-foreground font-medium text-sm">
                                Question {index + 1}
                                {question.backend_question_id && (
                                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        #{question.backend_question_id}
                                    </span>
                                )}
                            </span>
                            {questions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(question.id)}
                                    className="p-1.5 hover:bg-destructive/10 rounded-lg transition-all text-destructive hover:text-destructive/90"
                                    title="Remove question"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <Textarea
                            value={question.question_text}
                            onChange={(e) => updateQuestionText(question.id, e.target.value)}
                            placeholder="Enter your question here..."
                            rows={2}
                            className="mb-4 min-h-[80px] resize-none"
                        />

                        <div className="grid grid-cols-1 gap-2.5">
                            {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 group">
                                    <input
                                        type="radio"
                                        id={`correct-${question.id}-${optIndex}`}
                                        name={`correct-${question.id}`}
                                        checked={question.correct_answer === optIndex}
                                        onChange={() => setCorrectAnswer(question.id, optIndex)}
                                        className="accent-emerald-500 w-4 h-4 mt-0.5 flex-shrink-0"
                                    />
                                    <label 
                                        htmlFor={`correct-${question.id}-${optIndex}`}
                                        className="flex-1 cursor-pointer group-hover:text-foreground/90"
                                    >
                                        <Input
                                            value={option}
                                            onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                            className="h-10 border-border/50 bg-background/50"
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}