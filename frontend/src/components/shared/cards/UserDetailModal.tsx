import React, { useState } from 'react';
import { Calendar, Mail, MapPin, Youtube, Github, Twitter, Linkedin, Award, Lock, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Profile } from '../../../types/profile';
import { motion, AnimatePresence } from 'framer-motion';

interface UserDetailModalProps {
    user: any;
    onEdit?: (user: Profile) => void;
}

export function UserDetailModal({ user, onEdit }: UserDetailModalProps) {
    const [showBanInfo, setShowBanInfo] = useState<Record<number, boolean>>({});
    const profile = user.profile;
// >Uc2BI4|@<[2 - your@email.com
    return (
        <div className="space-y-8 overflow-hidden">
            {/* Аватар + ім'я */}
            <div className="flex items-center gap-5">
                <div className="min-w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-700">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-5xl font-bold text-white">
                            {user.first_name?.[0] || user.username[0].toUpperCase()}
                        </div>
                    )}
                </div>

                <div className='max-h-[15vh] overflow-y-auto'>
                    <h2 className="text-3xl font-bold">
                        {user.first_name} {user.last_name}
                    </h2>
                    <p className="text-zinc-400">@{user.username}</p>
                    {user.is_staff && <p className="text-amber-400 text-sm mt-1">Administrator{user.id === 1 && <span className='nz-foreground font-bold'> | <span className="text-cyan-400 font-normal text-sm mt-1">Owner</span></span>}</p>}
                </div>
            </div>

            {user.ban_info && (
                <div className="mt-2">
                    <button
                        onClick={() => setShowBanInfo(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                        className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors text-md font-medium"
                    >
                        <span className='flex items-center text-lg'>[<Lock className="w-5 h-5" />]</span>
                        <span>BANNED</span>
                        {showBanInfo[user.id] ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showBanInfo[user.id] && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-2 bg-red-950/50 border border-red-900/50 rounded-xl p-4 max-h-48 overflow-y-auto text-sm">
                                    <p className="text-red-400 font-medium mb-1">Ban reason:</p>
                                    <p className="text-zinc-300 leading-relaxed">
                                        {user.ban_info.reason || "Reason not provided"}
                                    </p>

                                    {user.ban_info.is_permanent && (
                                        <p className="mt-3 text-xs text-red-500 font-medium flex items-center gap-1">
                                            <Lock className="w-3.5 h-3.5" />
                                            Ban permanent
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
            {/* Інформація */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex md:flex-col flex-row md:items-start items-center justify-between mb-2">
                    <p className="text-xs nz-text-muted md:mb-1">EMAIL</p>
                    <p className="font-medium break-words">{user.email}</p>
                </div>

                <div className="flex md:flex-col flex-row md:items-start items-center justify-between mb-2">
                    <p className="text-xs nz-text-muted md:mb-1">JOINED</p>
                    <p className="font-medium break-words">
                        {new Date(user.date_joined).toLocaleDateString()}
                    </p>
                </div>

                {profile?.address && (
                    <div className="flex md:flex-col flex-row md:items-start items-center justify-between mb-2">
                        <p className="text-xs nz-text-muted md:mb-1">LOCATION</p>
                        <p className="flex items-center gap-2 font-medium break-words">
                            <MapPin className="w-4 h-4 nz-text-primary" />
                            {user.profile.address}
                        </p>
                    </div>
                )}
                {profile?.bio && (
                    <div className="md:col-span-2">
                        <p className="text-xs nz-text-muted mb-1">BIO</p>
                        <p className="max-h-[20vh] p-1 text-zinc-300 border whitespace-pre-wrap leading-relaxed break-words break-all rounded-lg overflow-y-auto">{profile.bio}</p>
                    </div>
                )}
                {/* Статистика */}
                <div className="md:col-span-2 mt-2">
                    <p className="text-xs nz-text-muted mb-3">STATISTICS</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Total Points */}
                        <div className="nz-background-accent border rounded-2xl p-5 text-center">
                            <p className="text-3xl font-bold nz-text-primary">{profile.total_points || 0}</p>
                            <p className="text-xs nz-text-muted mt-1.5 tracking-widest">TOTAL POINTS</p>
                        </div>

                        {/* Global Rank */}
                        <div className="nz-background-accent border rounded-2xl p-5 text-center">
                            <p className="text-3xl font-bold text-white">#{profile.global_rank || '—'}</p>
                            <p className="text-xs nz-text-muted mt-1.5 tracking-widest">GLOBAL RANK</p>
                        </div>

                        {/* Problems Solved */}
                        <div className="nz-background-accent border rounded-2xl p-5 text-center">
                            <p className="text-3xl font-bold text-emerald-400">{profile.problems_solved || 0}</p>
                            <p className="text-xs nz-text-muted mt-1.5 tracking-widest">PROBLEMS SOLVED</p>
                        </div>

                        {/* Current Streak */}
                        <div className="nz-background-accent border rounded-2xl p-5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                                <span className="text-3xl">🔥</span>
                                <span className="text-3xl font-bold text-orange-400">{profile.current_streak || 0}</span>
                            </div>
                            <p className="text-xs nz-text-muted mt-1.5 tracking-widest">STREAK</p>
                        </div>
                    </div>
                </div>
                {/* Соціальні посилання */}
                {(profile?.git || profile?.twitter || profile?.linkedin || profile?.youtube) && (
                    <div className="md:col-span-2">
                        <p className="text-xs nz-text-muted mb-2">SOCIAL LINKS</p>
                        <div className="flex gap-3">
                            {profile.youtube && <a href={profile.youtube} target="_blank" className="text-zinc-400 hover:nz-text-hover"><Youtube className="w-8 h-8" /></a>}
                            {profile.twitter && <a href={profile.twitter} target="_blank" className="text-zinc-400 hover:nz-text-hover"><Twitter className="w-8 h-8" /></a>}
                            {profile.linkedin && <a href={profile.linkedin} target="_blank" className="text-zinc-400 hover:nz-text-hover"><Linkedin className="w-8 h-8" /></a>}
                            {profile.git && <a href={profile.git} target="_blank" className="text-zinc-400 hover:nz-text-hover"><Github className="w-8 h-8" /></a>}
                        </div>
                    </div>
                )}
            </div>

            {/* Кнопки дій */}
            {!user.is_superuser && (
                <div className="flex gap-3 pt-4 border-t border-zinc-700">
                    <Button 
                        variant="btn_glass" 
                        className="flex-1"
                        onClick={() => onEdit && onEdit(user)}
                    >
                        Edit Profile
                    </Button>
                    <Button variant="btn_secondary" className="flex-1">
                        View Activity
                    </Button>
                </div>
            )}
        </div>
    );
}