import React from "react";
import { Crown, Calendar, Trophy, Flame, ShieldCheck, User } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { useModal } from '../../../hooks/useModal';
import { Profile } from '../../../types/profile';
import { UserDetailModal } from "./UserDetailModal";

interface AdminUserCardProps {
    user: Profile;
    onEdit?: (user: Profile) => void;
}

export function AdminUserCard({ user, onEdit }: AdminUserCardProps) {
    const { openModal } = useModal();

    const openUserDetail = () => {
        openModal({
            id: `user-detail-${user.id}`,
            width: "lg",
            title:
                <div className="flex items-center gap-2 line-clamp-1">
                    <User className="w-5 h-5" />{user.first_name} {user.last_name}
                </div>,
            content: <UserDetailModal user={user} onEdit={onEdit} />,
        });
    };

    return (
        <Card 
            onClick={openUserDetail}
            className="cursor-pointer hover:border-violet-500 transition-all group"
        >
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    {/* Аватар */}
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                        {user.profile?.avatar_url ? (
                            <img 
                                src={user.profile.avatar_url} 
                                alt={user.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                                {user.first_name?.[0] || user.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg truncate">
                                {user.first_name} {user.last_name}
                            </h3>
                            {user.id === 1 && (
                                <Crown className="w-5 h-5 text-indigo-400" />
                            )}
                            {user.is_staff && (
                                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                            )}
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