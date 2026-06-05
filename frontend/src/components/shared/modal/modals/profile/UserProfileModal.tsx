import React from 'react';
import { X, Trophy, Calendar, MapPin, Link as LinkIcon, Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../../../../../hooks/useModal';
import { UserProfile } from '../../../../../types/profile';
import { Card, CardContent } from '../../../../ui/Card';
import { cn } from '../../../../../lib/cn';

interface UserProfileModalProps {
    user: UserProfile;
    isOpen: boolean;
}

export const UserProfileModal = ({ user, isOpen }: UserProfileModalProps) => {
    const { closeModal } = useModal();

    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl"
                    >
                        <Card className="nz-background-primary border border-zinc-700 overflow-hidden">
                            {/* Header */}
                            <div className="relative h-48 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600">
                                <button
                                    onClick={closeModal}
                                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>

                                <div className="absolute -bottom-12 left-6">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-zinc-900">
                                        {user.profile?.avatar_url ? (
                                            <img 
                                                src={user.profile.avatar_url} 
                                                alt={user.username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-5xl font-bold text-white">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <CardContent className="pt-16 pb-6 px-6">
                                {/* Ім'я та статус */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            {user.first_name} {user.last_name}
                                        </h2>
                                        <p className="text-zinc-400">@{user.username}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-amber-400">
                                        <Trophy className="w-5 h-5" />
                                        <span className="font-semibold">{user.profile?.total_points || 0}</span>
                                    </div>
                                </div>

                                {/* Біо */}
                                {user.profile?.bio && (
                                    <p className="mt-4 text-zinc-300 leading-relaxed">
                                        {user.profile.bio}
                                    </p>
                                )}

                                {/* Статистика */}
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">{user.profile?.problems_solved || 0}</div>
                                        <div className="text-xs text-zinc-500">Solved</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">{user.profile?.current_streak || 0}</div>
                                        <div className="text-xs text-zinc-500">Streak</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">#{user.profile?.global_rank || '—'}</div>
                                        <div className="text-xs text-zinc-500">Rank</div>
                                    </div>
                                </div>

                                {/* Соціальні посилання */}
                                <div className="mt-8 flex flex-wrap gap-3">
                                    {user.profile?.git && (
                                        <a href={user.profile.git} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors">
                                            <Github className="w-4 h-4" /> GitHub
                                        </a>
                                    )}
                                    {user.profile?.twitter && (
                                        <a href={user.profile.twitter} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors">
                                            <Twitter className="w-4 h-4" /> Twitter
                                        </a>
                                    )}
                                    {user.profile?.linkedin && (
                                        <a href={user.profile.linkedin} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors">
                                            <Linkedin className="w-4 h-4" /> LinkedIn
                                        </a>
                                    )}
                                    {user.profile?.youtube && (
                                        <a href={user.profile.youtube} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors">
                                            <Youtube className="w-4 h-4" /> YouTube
                                        </a>
                                    )}
                                </div>

                                {/* Дата приєднання */}
                                <div className="mt-6 text-xs text-zinc-500 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Joined {new Date(user.date_joined).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};