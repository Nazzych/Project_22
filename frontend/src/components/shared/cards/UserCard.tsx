import React from "react";
import { Crown, Lock, Trophy, Flame, ShieldCheck, User } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { useModal } from '../../../hooks/useModal';
import { Profile } from '../../../types/profile';
import { useProfile } from "../../../contexts/ProfileContext";
import { UserDetailModal } from "./UserDetailModal";
import { Tooltip } from "../../Tooltip";

interface AdminUserCardProps {
    user: any;
    onEdit?: (user: Profile) => void;
}

export function AdminUserCard({ user, onEdit }: AdminUserCardProps) {
    const { openModal } = useModal();
    const { profile } = useProfile();

    const isCurrentUser = profile?.id === user.id;
    const isBanned = !!user.ban_info;

    const openUserDetail = () => {
        openModal({
            id: `user-detail-${user.id}`,
            width: "lg",
            title:
                <div className="flex items-center gap-2 line-clamp-1">
                    <User className="w-5 h-5" />{user.first_name} {user.last_name}{profile?.id === user.id && (<p className="nz-text-muted text-[12px]">(YOU)</p>)}
                </div>,
            content: <UserDetailModal user={user} onEdit={onEdit} />,
        });
    };

    return (
        <Card size="wf"
            onClick={openUserDetail}
            className="cursor-pointer hover:border-violet-500 transition-all group"
        >
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    {/* Аватар */}
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900">
                            {user.profile?.avatar_url ? (
                                <img 
                                    src={user.profile.avatar_url} 
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                                    {(user.first_name?.[0] || user.username?.[0] || "?").toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Статусні іконки */}
                        {isCurrentUser && (
                            <div className="absolute -bottom-1 -right-1 nz-background-primary text-[10px] px-2 py-0.5 rounded-full font-bold border-2">
                                YOU
                            </div>
                        )}

                        {user.is_superuser && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 p-1 rounded-full border-2">
                                <Crown className="w-4 h-4 text-black" />
                            </div>
                        )}

                        {user.is_staff && !user.is_superuser && (
                            <div className="absolute -top-1 -right-1 bg-cyan-500 p-1 rounded-full border-2">
                                <ShieldCheck className="w-4 h-4 text-black" />
                            </div>
                        )}

                        {isBanned && (
                            <div className="absolute -top-1 -right-1 bg-red-600 p-1 rounded-full border-2">
                                <Lock className="w-4 h-4 text-black" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg truncate">
                                {user.first_name} {user.last_name}
                            </h3>
                            {/* {user.is_superuser && (
                                <Crown className="w-5 h-5 text-indigo-400" />
                            )}
                            {user.is_staff && (
                                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                            )} */}
                        </div>
                        <p className="text-zinc-400 text-sm">@{user.username}</p>

                        <div className="flex items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1 text-amber-400">
                                <Trophy className="w-4 h-4" />
                                <span>{user.profile?.total_points || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-orange-400">
                                <Flame className="w-4 h-4" />
                                <span>{user.profile?.current_streak || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}