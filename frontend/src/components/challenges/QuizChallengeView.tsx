import React, { useState } from 'react';
import { CheckCircle, Clock, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '../.../../ui/Button';
import { Card, CardContent, CardHeader } from '../.../../ui/Card';
import { useToast } from '../../providers/MessageProvider';
import { Tasks, ChallengeViewProps } from '../../types/tasks';
import { cn } from '../../lib/cn';

export default function QuizChallengeView({ challenge }: ChallengeViewProps) {
    const { showToast } = useToast();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    // Тут поки що використовуємо заглушки, бо в моделі ще немає питань
    // Коли будеш додавати модель QuizQuestion — заміниш цей масив
    const questions = challenge.questions || []; // <-- пізніше будеш брати з бекенду

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
        // Заглушка для підрахунку балів
        let calculatedScore = 0;
        // Логіка підрахунку буде пізніше, коли додаси правильні відповіді

        setScore(calculatedScore);
        setIsSubmitted(true);

        showToast("success", "Тест завершено!", `Ваш результат: ${calculatedScore} балів`);
    };

    if (questions.length === 0) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="py-16 text-center">
                    <p className="text-xl text-zinc-400">У цьому тесті ще немає питань.</p>
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

    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold mb-2">Тест завершено!</h2>
                <p className="text-2xl text-emerald-400 mb-8">
                    Ваш результат: <span className="font-bold">{score}</span> / {questions.length}
                </p>
                <Button onClick={() => window.history.back()} variant="btn_primary">
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
                            <span className="font-medium">Питання {currentQuestionIndex + 1} з {questions.length}</span>
                        </div>
                        <div className="text-sm nz-text-muted">
                            {challenge.points} балів
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* Питання */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 leading-tight">
                            {currentQuestion?.question_text || "Питання не завантажено"}
                        </h2>
                    </div>

                    {/* Варіанти відповідей */}
                    <div className="space-y-3">
                        {currentQuestion?.answers?.map((answer: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswerSelect(idx)}
                                className={cn(
                                    "w-full text-left p-5 rounded-2xl border transition-all",
                                    selectedAnswers[currentQuestionIndex] === idx
                                        ? "border-violet-500 bg-violet-500/10"
                                        : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900"
                                )}
                            >
                                <span className="text-lg">{answer.text}</span>
                            </button>
                        ))}
                    </div>

                    {/* Кнопка далі */}
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleNext}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                            className="px-10"
                        >
                            {currentQuestionIndex === questions.length - 1 ? "Завершити тест" : "Наступне питання"}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}