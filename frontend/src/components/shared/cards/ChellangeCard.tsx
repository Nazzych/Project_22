import React, { useState, useRef } from 'react';
import {
    XCircle, Code2, Pen, Tag, Trophy, Circle, CheckCircle, MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { useModal } from '../../../hooks/useModal';
import { ConfirmModal } from '../../shared/modal/ConfirmModal';
import { getCsrfToken } from '../../../api/auth';
import { useToast } from '../../../providers/MessageProvider';
import { ChallangeManage } from '../../shared/modal/modals/admin/ChallangeManage';
import { deleteTask } from '../../../api/admin';
import { cn } from '../../../lib/cn';

interface ChallengeCardProps {
    challenge: any;
    loadChallenges?: () => void;
    is_staff: boolean;
}

export const ChallengeCard = ({
    challenge,
    loadChallenges,
    is_staff
}: ChallengeCardProps) => {
    const navigate = useNavigate();
    const { openModal, closeModal } = useModal();
    const { showToast } = useToast();

    const slugify = (text: string) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, '-')
            .replace(/^-+|-+$/g, '');

    const handleView = () => {
        const slug = slugify(challenge.title);
        navigate(`/challenges/${challenge.id}/${slug}`);
    };

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
                            await getCsrfToken();
                            await deleteTask (id);
                            showToast('success', 'Success', 'Chellange successfully deleted.');
                            if (loadChallenges) loadChallenges();
                            closeModal();
                        }}
                        onCancel={closeModal}
                    />
                ),
            });
        } catch (error) {
            showToast('error', 'Помилка', 'Не вдалося видалити завдання.');
            console.error('Помилка видалення:', error);
        }
    };

    const handleEdit = (task: any) => {
        openModal({
            id: 'edit-challenge',
            width: 'xl',
            x: false,
            title: (
                <div className="flex items-center gap-2">
                    <Pen className="w-5 h-5 text-primary" />
                    <span className="line-clamp-1">Editing "{challenge.title}"</span>
                </div>
            ),
            content: (
                <ChallangeManage
                    task={task}
                    onSuccess={loadChallenges && loadChallenges()}
                    onDelete={() => DeleteChallenge(challenge.id)}
                />
            ),
        });
    };

    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
    const tagRef = useRef<HTMLSpanElement>(null);
    const tags: string[] = challenge?.tegs
        ? challenge.tegs.split(',').map((tag: string) => tag.trim()).filter(Boolean)
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
    
    // Визначення кольору складності
    const difficultyLower = (challenge.difficul || 'medium').toLowerCase();

    const difficultyColor = {
        easy: 'text-green-500 bg-green-500/10',
        medium: 'text-yellow-500 bg-yellow-500/10',
        hard: 'text-red-500 bg-red-500/10',
    } as const;

    const colorClass = difficultyColor[difficultyLower as keyof typeof difficultyColor] || 'text-gray-500 bg-gray-500/10';
    return (
        <Card
            onClick={(e) => {
                e.stopPropagation();
                handleView();
            }}
            size="wf"
            variant="card_primary"
            className="relative group transition duration-300 border overflow-hidden min-h-[20vh] hover:nz-background-secondary"
        >
            {/* Бейдж складності */}
            <span
                className={cn(
                    'absolute top-3 right-3 px-3 py-1 text-xs font-medium group-hover:nz-background-primary rounded-full cursor-default',
                    colorClass
                )}
            >
                {challenge.difficul ? challenge.difficul.slice(0, 3).toUpperCase() : 'MEDIUM'}
            </span>

            <CardHeader className="py-2 mb-1 border-b-2">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex items-center gap-2">
                        {!is_staff && (
                            challenge.status 
                                ? <CheckCircle className="w-5 h-5 text-indigo-500" /> 
                                : <Circle className="w-5 h-5 text-indigo-500" />
                        )}
                        <h3 className="w-[80%] text-lg font-semibold nz-text-foreground line-clamp-1">
                            {challenge.title}
                        </h3>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Опис */}
                <p className="text-sm font-mono text-muted-foreground line-clamp-3 min-h-[60px] cursor-default">
                    {challenge.description || 'Немає опису...'}
                </p>

                {/* Додаткова інформація */}
                <div className="flex justify-between flex-wrap gap-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground cursor-default">
                        <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            {challenge.points} pts
                        </div>
                        <div className="flex items-center gap-1">
                            <Code2 className="w-4 h-4" />
                            {challenge.language?.toUpperCase() || '—'}
                        </div>
                        {/* Теги */}
                        {challenge?.tegs && (
                            <div className="relative">
                                <span 
                                    ref={tagRef}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseEnter={handleTagHover}
                                    onMouseLeave={() => setTooltipPos(null)}
                                    className="text-xs nz-background-secondary px-2 py-1 rounded-full text-muted-foreground border group-hover:nz-background-primary cursor-default"
                                >
                                    Tags
                                </span>

                                {/* Tooltip - Fixed positioning */}
                                {tooltipPos && (
                                    <div 
                                        className="fixed w-max max-w-xs nz-background-accent border rounded-md shadow-lg p-2 text-xs nz-text-foreground z-50 whitespace-pre-wrap break-words pointer-events-none animate-in fade-in"
                                        style={{
                                            top: `${tooltipPos.top}px`,
                                            left: `${tooltipPos.left}px`,
                                            transform: 'translate(-50%, -100%)',
                                        }}
                                    >
                                        {tags.join(', ')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {is_staff && (
                        <div>
                            <button onClick={(e) => {e.stopPropagation(); handleEdit(challenge)}} className='p-1 border rounded-full  nz-background-secondary group-hover:nz-background-primary cursor-pointer'><MoreVertical className='w-4 h-4' /></button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};