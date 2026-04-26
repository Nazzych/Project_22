import React, { useState, useEffect } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Grid2X2Check, ArrowRight, PartyPopper, PieChart, XCircle, ArrowLeft, Eye, Play, Info } from 'lucide-react';
import { Button } from '../.../../ui/Button';
import { Card, CardContent, CardHeader } from '../.../../ui/Card';
import { useToast } from '../../providers/MessageProvider';
import { submitQuiz } from '../../api/tasks';
import { cn } from '../../lib/cn';
import { LoadingSpinner } from '../LoadingSpinner';
import SvipeModal from '../shared/modal/SvipeModal';
import { getCsrfToken } from '../../api/auth';
import { Tasks } from '../../types/tasks';

interface QuizAnswer {
    id: number;
    answer_text: string;
    is_correct: boolean;
}

interface QuizQuestion {
    id: number;
    question_text: string;
    order: number;
    time_limit_minutes?: number;
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
        user_progress?: {
            status: string;
            selected_answers?: Record<number, number>; // { question_id: answer_index }
            submitted_code?: string;
            submitted_at?: string;
            mentor_feedback?: string;
            mentor_score?: number;
            completed_at?: string;
            attempts?: number;
        } | null;
    };
}

export default function QuizChallengeView({ challenge }: ChallengeViewProps) {
    const { showToast } = useToast();
    const { fetchProfile } = useProfile();
    const navigate = useNavigate();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [isChevronOpen, setIsChevronOpen] = useState(false);
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

    const handleSubmitQuiz = async () => {
        let calculatedScore = 0;
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

        try {
            await getCsrfToken();
            // ✅ Виправлено: передаємо правильний формат { question_id: answer_index }
            const answersPayload = {} as Record<number, number>;
            questions.forEach((question, idx) => {
                if (selectedAnswers[idx] !== undefined) {
                    answersPayload[question.id] = selectedAnswers[idx];
                }
            });

            await submitQuiz(challenge.id, answersPayload);   // ← передаємо об'єкт з question_id

            if (totalScore === 100) {
                showToast("success", "Congratulations!", "You passed the quiz with flying colors!");
            } else if (totalScore >= 70) {
                showToast("info", "Test completed!", `Your score: ${calculatedScore}/${questions.length} (${totalScore}%)`);
            } else {
                showToast("warning", "Test completed!", `Your score: ${calculatedScore}/${questions.length} (${totalScore}%). Keep practicing!`);
            }

            // Якщо максимальний бал — оновити профіль
            if (totalScore === 100 && fetchProfile) {
                setTimeout(() => {
                    fetchProfile();
                }, 500);
            }
        } catch (error) {
            console.error(error);
            showToast("error", "Error submitting quiz", "Please try again.");
        }
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setShowReview(false);
        setScore(0);
    };

    const handleChevronClick = () => {
        setIsChevronOpen(prev => !prev);
    };

    // Порожній тест
    if (questions.length === 0) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="py-8 text-center">
                    <p className="text-xl text-zinc-400 mb-4">No quiz in this chellange.</p>
                    <Button 
                        variant="btn_primary" 
                        className="mt-6"
                        onClick={() => window.history.back()}
                    >
                        Come back
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
                    <LoadingSpinner text='Loading quiz...' size={20}/>
                </CardContent>
            </Card>
        );
    }

    if (isChevronOpen) {
        return (
            <SvipeModal
                isOpen={isChevronOpen}
                onClose={() => setIsChevronOpen(false)}
                title="Challenge Details"
                size="md"
                position="top"
            >
                <div className="max-h-[70vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4">{challenge.title}</h2>
                    <p className="nz-text-muted text-sm mb-2">Description:</p>
                    {challenge.description}
                </div>
            </SvipeModal>
        );
    }

    // Результат
    if (isSubmitted || challenge.user_progress?.status) {
        const isPassed = score >= 70;
        const correctCount = Math.round((score / 100) * questions.length);

        return (
            <div className="flex justify-center">
                {/* Результат тесту */}
                <Card className="overflow-hidden">
                    <CardContent className="py-8 text-center">
                        <div className="flex justify-center mb-8">
                            {challenge.user_progress?.status === "completed" ? (
                                <PartyPopper className="h-20 w-20 text-emerald-500" />
                            ) : challenge.user_progress?.status === "failed" ? (
                                <XCircle className="h-20 w-20 text-red-500" />
                            ) : (
                                isPassed ? (
                                    <PartyPopper className="h-20 w-20 text-emerald-500" />
                                ) : score > 0 ? (
                                    <PieChart className="h-20 w-20 text-blue-500" />
                                ) : (
                                    <XCircle className="h-20 w-20 text-red-500" />
                                )
                            )}
                        </div>

                        <h2 className="text-4xl font-bold mb-2">
                            {challenge.user_progress?.status ? (
                                <span className="capitalize">{challenge.user_progress.status}</span>
                                
                            ) : (
                                isPassed ? "Excellent!" : score > 0 ? "Test Completed" : "Try Again"
                            )}
                        </h2>

                        {!challenge.user_progress?.status && (
                            <>
                                <p className={cn(
                                    "text-7xl font-black mb-3 transition-all",
                                    isPassed ? "text-emerald-400" : score > 0 ? "text-blue-400" : "text-red-400"
                                )}>
                                    {score}%
                                </p>

                                <p className="text-xl text-zinc-400">
                                    {correctCount} out of {questions.length} correct
                                </p>
                            </>
                        )}

                        <div className="flex flex-wrap gap-4 justify-center mt-10">
                            <Button 
                                onClick={() => navigate ("/challenges")} 
                                variant="btn_glass" 
                                className="px-8"
                            >
                                Back to Challenges
                            </Button>

                            {challenge.user_progress?.status !== "failed" || score !== 100 && (
                                <Button 
                                    onClick={handleRestart} 
                                    variant="btn_primary" 
                                    className="px-8"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                            )}

                            <Button 
                                onClick={() => setShowReview(true)} 
                                variant="btn_accent" 
                                className="px-8"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Review Answers
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Перегляд відповідей — Side Sheet / Bottom Sheet */}
                <SvipeModal
                    isOpen={showReview}
                    onClose={() => setShowReview(false)}
                    title={
                        <div className='flex items-center gap-2 line-clamp-1'>
                            <Eye className='w-5 h-5' /> Review Your Answers
                        </div>
                    }
                    size="lg"
                    position="right"
                >
                    <div className="space-y-8 max-h-[82.5vh] md:max-h-[70vh] overflow-y-auto pr-2">
                        {questions.map((question, idx) => {
                            const savedAnswerIndex = challenge.user_progress?.selected_answers?.[question.id];
                            // Якщо користувач вже вибрав щось в цьому сеансі — беремо його
                            const selectedIdx = selectedAnswers[idx] !== undefined 
                                ? selectedAnswers[idx] 
                                : savedAnswerIndex;
                            const correctIdx = question.answers.findIndex(a => a.is_correct);
                            const isCorrect = selectedIdx === correctIdx;
                            const answered = selectedIdx !== undefined;

                            return (
                                <div key={question.id} className="nz-background-accent border rounded-2xl p-6">
                                    <div className="flex justify-between mb-4">
                                        <h4 className="font-semibold">Question {idx + 1}</h4>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-sm font-medium",
                                            isCorrect ? "bg-emerald-500/20 text-emerald-400" :
                                            answered ? "bg-red-500/20 text-red-400" : "bg-zinc-700 text-zinc-400"
                                        )}>
                                            {isCorrect ? "Correct" : answered ? "Wrong" : "Not answered"}
                                        </span>
                                    </div>

                                    <p className="text-lg mb-6">{question.question_text}</p>

                                    <div className="space-y-3">
                                        {question.answers.map((answer, aIdx) => {
                                            const isSelected = selectedIdx === aIdx;
                                            const isRightAnswer = aIdx === correctIdx;

                                            return (
                                                <div 
                                                    key={aIdx}
                                                    className={cn(
                                                        "p-4 rounded-xl border flex items-start gap-3",
                                                        isRightAnswer ? "border-emerald-500 bg-emerald-500/10" :
                                                        isSelected ? "border-red-500 bg-red-500/10" : "nz-background-secondary"
                                                    )}
                                                >
                                                    <span className="font-mono w-6 nz-text-muted mt-0.5 shrink-0">
                                                        {String.fromCharCode(65 + aIdx)}
                                                    </span>
                                                    <span className="flex-1">{answer.answer_text}</span>
                                                    {isRightAnswer && <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />}
                                                    {isSelected && !isRightAnswer && <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SvipeModal>            </div>
        );
    }

    return (
        <div className="flex justify-center">
            <Card className='min-w-[400px]'>
                <CardHeader className="pb-4">
                    <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Grid2X2Check className="w-6 h-6 nz-text-accent" />
                            <span className="font-medium">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1 nz-text-muted">
                                <Clock className="w-4 h-4" />
                                {currentQuestion.time_limit_minutes ? `${currentQuestion.time_limit_minutes} sec` : "Time unlimited"}
                            </div>
                            <button onClick={handleChevronClick} className="nz-background-primary p-1.5 hover:nz-background-accent border rounded-full">
                                <Info className="w-4 h-4 nz-text-muted" />
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* Питання */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 leading-tight">
                            {currentQuestion?.question_text || "No question"}
                        </h2>
                        {currentQuestion?.order && (
                            <span className="inline-block nz-bg-accent nz-text-accent text-xs px-3 py-1 rounded-full">
                                Question #{currentQuestion.order}
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
                                        : "border nz-background-accent hover:nz-background-primary"
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
                                <ArrowLeft className="mr-2 w-5 h-5" />
                                Back
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                            className="px-8"
                            variant={currentQuestionIndex === questions.length - 1 ? "btn_success" : "btn_primary"}
                        >
                            {currentQuestionIndex === questions.length - 1 
                                ? (
                                    <>
                                        Finish quiz
                                        <CheckCircle className="ml-2 w-5 h-5" />
                                    </>
                                ) 
                                : (
                                    <>
                                        Next
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