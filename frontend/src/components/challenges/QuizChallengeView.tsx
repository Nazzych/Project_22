import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '../.../../ui/Button';
import { Card, CardContent, CardHeader } from '../.../../ui/Card';
import { useToast } from '../../providers/MessageProvider';
import { cn } from '../../lib/cn';

interface QuizAnswer {
    id: number;
    answer_text: string;
    is_correct: boolean;
}

interface QuizQuestion {
    id: number;
    question_text: string;
    order: number;
    answers: QuizAnswer[];
}

interface ChallengeViewProps {
    challenge: {
        id: number;
        title: string;
        description: string;
        points: number;
        quiz_challenge?: {
            questions: QuizQuestion[];
        };
    };
}

export default function QuizChallengeView({ challenge }: ChallengeViewProps) {
    const { showToast } = useToast();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ Правильне отримання питань з бекенду
    const questions: QuizQuestion[] = challenge.quiz_challenge?.questions || [];
    
    // Скидаємо стан при зміні виклику
    useEffect(() => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setScore(0);
        setIsLoading(false);
    }, [challenge.id]);

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswerSelect = (answerIndex: number) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: answerIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmitQuiz();
        }
    };

    const handleSubmitQuiz = () => {
        let calculatedScore = 0;
        
        // ✅ Правильний підрахунок балів
        questions.forEach((question, idx) => {
            const selectedIndex = selectedAnswers[idx];
            if (selectedIndex !== undefined) {
                const isCorrect = question.answers[selectedIndex]?.is_correct;
                if (isCorrect) {
                    calculatedScore += 1;
                }
            }
        });

        const totalScore = Math.round((calculatedScore / questions.length) * 100);
        setScore(totalScore);
        setIsSubmitted(true);

        showToast("success", "Тест завершено!", `Ваш результат: ${calculatedScore}/${questions.length} (${totalScore}%)`);
    };

    // Порожній тест
    if (questions.length === 0) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="py-16 text-center">
                    <p className="text-xl text-zinc-400 mb-4">У цьому тесті ще немає питань.</p>
                    <Button 
                        variant="btn_primary" 
                        className="mt-6"
                        onClick={() => window.history.back()}
                    >
                        Повернутися назад
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card className="max-w-3xl mx-auto">
                <CardContent className="py-16 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4 rounded-full"></div>
                    <p>Завантажуємо тест...</p>
                </CardContent>
            </Card>
        );
    }

    // Результат
    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className={`text-6xl mb-6 ${score >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {score >= 70 ? '🎉' : '📊'}
                </div>
                <h2 className="text-3xl font-bold mb-2">Тест завершено!</h2>
                <p className="text-2xl mb-8">
                    Ваш результат: <span className="font-bold text-emerald-400">{score}%</span>
                    <br />
                    <span className="text-lg text-zinc-400">({score / 10}/{questions.length} правильних)</span>
                </p>
                <Button onClick={() => window.history.back()} variant="btn_primary" className="px-12">
                    Повернутися до завдань
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-amber-400" />
                            <span className="font-medium">
                                Питання {currentQuestionIndex + 1} з {questions.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 nz-text-muted">
                                <Clock className="w-4 h-4" />
                                Без обмежень часу
                            </div>
                            <div className="text-amber-400 font-medium">
                                {challenge.points} балів
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* Питання */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 leading-tight">
                            {currentQuestion?.question_text || "Питання не завантажено"}
                        </h2>
                        {currentQuestion?.order && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                                Питання #{currentQuestion.order}
                            </span>
                        )}
                    </div>

                    {/* Варіанти відповідей */}
                    <div className="space-y-3">
                        {currentQuestion?.answers?.map((answer: QuizAnswer, idx: number) => (
                            <button
                                key={answer.id || idx}
                                onClick={() => handleAnswerSelect(idx)}
                                className={cn(
                                    "w-full text-left p-5 rounded-2xl border transition-all group hover:shadow-lg",
                                    selectedAnswers[currentQuestionIndex] === idx
                                        ? "border-violet-500 bg-violet-500/10 shadow-violet-500/25"
                                        : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-sm font-medium mt-0.5">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="text-lg leading-relaxed flex-1">{answer.answer_text}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Прогрес бар */}
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
                            }}
                        />
                    </div>

                    {/* Кнопка далі */}
                    <div className="flex justify-between items-center pt-4">
                        {currentQuestionIndex > 0 && (
                            <Button
                                type="button"
                                variant="btn_secondary"
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                className="px-6"
                            >
                                Назад
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                            className="px-10"
                            variant={currentQuestionIndex === questions.length - 1 ? "btn_success" : "btn_primary"}
                        >
                            {currentQuestionIndex === questions.length - 1 
                                ? (
                                    <>
                                        Завершити тест
                                        <CheckCircle className="ml-2 w-5 h-5" />
                                    </>
                                ) 
                                : (
                                    <>
                                        Наступне питання
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )
                            }
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}