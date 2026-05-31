import React, { useState, useRef } from 'react';
import { 
    Trophy, Code2, Edit, CircleCheck, XCircle, Circle, 
    Grid2X2Check, CodeSquare 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../ui/Card';
import { useModal } from '../../../hooks/useModal';
import { ConfirmModal } from '../modal/ConfirmModal';
import { getCsrfToken } from '../../../api/auth';
import { useToast } from '../../../providers/MessageProvider';
import { ChallangeManage } from '../modal/modals/admin/ChallangeManage';
import { deleteTask } from '../../../api/admin';
import { ChallengeCardProps, LANGUAGE_LABELS } from '../../../types/tasks';
import { cn } from '../../../lib/cn';

export const ChallengeCard = ({
    challenge,
    loadChallenges,
    is_staff
}: ChallengeCardProps) => {
    const navigate = useNavigate();
    const { openModal, closeModal } = useModal();
    const { showToast } = useToast();

    const slugify = (text: string) =>
        text.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');

    const handleView = () => {
        const slug = slugify(challenge.title);
        navigate(`/challenges/${challenge.id}/${slug}`);
    };

    // === Гарний бейдж типу (Quiz / Code) ===
    const isQuiz = challenge.c_type === "quiz";

    const typeStyle = isQuiz 
        ? "from-purple-600 via-pink-600 to-violet-600" 
        : "from-cyan-600 via-blue-600 to-sky-600";

    const TypeIcon = isQuiz ? Grid2X2Check : CodeSquare;
    const typeLabel = isQuiz ? "QUIZ" : "CODE";

    // === Функціонал ===
    const DeleteChallenge = async (id: string) => {
        try {
            openModal({
                id: 'confirm-delete-challenge',
                title: 'Confirm deleting',
                x: false,
                content: (
                    <ConfirmModal
                        message="You really want delete challenge?"
                        confirmText="Yes, delete"
                        cancelText="Cancel"
                        onConfirm={async () => {
                            try {
                                await getCsrfToken();
                                await deleteTask(id);
                                showToast('success', 'Success', 'Challenge successfully deleted.');
                                if (loadChallenges) loadChallenges();
                                closeModal();
                            } catch (error) {
                                showToast('error', 'Error', "Can't delete challenge.");
                                console.error('Deleting error:', error);
                            }
                        }}
                        onCancel={closeModal}
                    />
                ),
            });
        } catch (error) {
            showToast('error', 'Error', "Can't delete challenge.");
            console.error('Deleting error:', error);
        }
    };

    const handleEdit = (task: any) => {
        openModal({
            id: 'edit-challenge',
            width: 'xl',
            x: false,
            title: (
                <div className="w-fit nz-background-secondary rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                    <Edit className="w-5 h-5 text-primary" />
                    <span className="line-clamp-1">Editing "{challenge.title}"</span>
                </div>
            ),
            content: (
                <ChallangeManage
                    task={task}
                    onSuccess={() => loadChallenges && loadChallenges()}
                    onDelete={() => DeleteChallenge(challenge.id)}
                />
            ),
        });
    };

    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
    const tagRef = useRef<HTMLSpanElement>(null);

    const tags: string[] = challenge?.tags
        ? challenge.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : [];

    const handleTagHover = () => {
        if (tagRef.current) {
            const rect = tagRef.current.getBoundingClientRect();
            setTooltipPos({
                top: rect.top - 10,
                left: rect.left + rect.width / 2,
            });
        }
    };

    const difficultyLower = (challenge.difficulty || 'medium').toLowerCase();
    const difficultyColor = {
        easy: 'text-green-500 border-green-500',
        medium: 'text-yellow-500 border-yellow-500',
        hard: 'text-red-500 border-red-500',
    } as const;

    const colorClass = difficultyColor[difficultyLower as keyof typeof difficultyColor] || 'text-gray-500 bg-gray-500/10';

    return (
        <Card
            onClick={handleView}
            className="relative group overflow-hidden border hover:border-violet-700 transition-all duration-300 cursor-pointer h-full flex flex-col"
        >
            {/* === ГРАДІЄНТНИЙ БЛОК З ВЕЛИКИМ ТЕКСТОМ === */}
            <div className={cn(
                "relative h-40 flex items-center justify-center bg-gradient-to-br overflow-hidden",
                typeStyle
            )}>
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px]"></div>

                <div className="text-center z-10">
                    <TypeIcon className="w-14 h-14 mx-auto mb-3 opacity-90" />
                    <div className="text-4xl font-black tracking-tighter drop-shadow-2xl text-white">
                        {typeLabel}
                    </div>
                </div>

                {/* Складність */}
                <div className={cn(
                    "absolute top-4 right-4 px-4 py-1 text-xs font-bold rounded-full border bg-black/65",
                    colorClass
                )}>
                    {challenge.difficulty?.toUpperCase() || 'MEDIUM'}
                </div>
            </div>

            <CardContent className="flex-1 p-3 flex flex-col space-y-2">
                <h3 className="text-lg font-semibold nz-text-foreground line-clamp-2">
                    {challenge.title}
                </h3>

                <p className="text-sm nz-text-muted line-clamp-3 flex-1">
                    {challenge.description || 'No description...'}
                </p>

                {/* Нижня інформація */}
                <div className="flex justify-between items-center text-sm pt-4 border-t">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-1 text-amber-400">
                            <Trophy className="w-4 h-4" />
                            <span>{challenge.points}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-400">
                            <Code2 className="w-4 h-4" />
                            <span>{LANGUAGE_LABELS[challenge.language] || '—'}</span>
                        </div>
                    </div>

                    {challenge.user_progress?.status === "completed" && (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                            <CircleCheck className="w-4 h-4" />
                            COMPLETED
                        </div>
                    )}
                    {challenge.user_progress?.status === "failed" && (
                        <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
                            <XCircle className="w-4 h-4" />
                            FAILED
                        </div>
                    )}

                    {/* Кнопка редагування для staff */}
                    {is_staff && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(challenge); }}
                            className="p-1.5 nz-background-accent hover:nz-background-primary rounded-xl transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};