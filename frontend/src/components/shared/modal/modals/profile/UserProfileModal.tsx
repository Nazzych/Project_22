import React from 'react';
import { X, ShieldCheck, BadgeCheck, Crown, Calendar, MapPin, Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile } from '../../../../../types/profile';
import { Card } from '../../../../ui/Card';
import { Button } from '../../../../ui/Button';
import { formatJoinDate } from '../../../../../lib/formatDate';
import { Avatar } from '../../../../Image';

interface UserProfileModalProps {
    user: Profile | null;
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfileModal = ({ user, isOpen, onClose }: UserProfileModalProps) => {
    if (!user || !isOpen) return null;

    const p = user.profile || {};

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full flex justify-center" // ← Горизонтальний формат
                    >
                        <Card size='wf' variant='card_primary' className="md:mx-52 border-4 overflow-hidden overflow-y-auto max-h-[85vh]">
                            <div className="flex flex-col md:flex-row">
                                {/* Ліва частина — аватар + основна інфо */}
                                <div className="md:w-2/5 bg-gradient-to-br from-violet-800 via-fuchsia-800 to-pink-800 p-8 flex flex-wrap flex-row md:flex-col gap-2 items-center justify-center relative">
                                    <Button variant='btn_glass' size='icon'
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-md"
                                    >
                                        <X className="w-5 h-5 text-white" />
                                    </Button>

                                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-2 shadow-2xl">
                                        <Avatar src={user.profile?.avatar_url} alt={user.username} rounded='3xl' className="w-32 h-32 md:w-40 md:h-40 insert-0" />

                                        {user.is_staff && (
                                            <>
                                                <div className='absolute top-1 right-1 nz-background-primary text-md border font-semibold p-1 rounded-full flex items-center gap-1'>
                                                    <BadgeCheck className="w-6 h-6 text-emerald-400" />
                                                </div>
                                                <div className="absolute bottom-0 right-0 nz-background-primary text-md border font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                                                    {user.is_superuser ? (
                                                        <>
                                                            <Crown className="w-5 h-5 text-yellow-400" />
                                                            <span>Owner</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                                                            <span>Admin</span>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    
                                    <div className='space-y-2 md:space-y-6'>
                                        <div>
                                            <h2 className="text-3xl font-bold text-white line-clamp-2">
                                                {user.first_name}
                                            </h2>
                                            <p className="text-zinc-200 text-lg line-clamp-1 md:line-clamp-2">@{user.username}</p>
                                        </div>

                                        <div className="hidden md:flex flex-wrap gap-6 text-center">
                                            <div>
                                                <div className="text-3xl font-bold text-white">#{p.global_rank || '—'}</div>
                                                <div className="text-xs text-white/70">RANK</div>
                                            </div>
                                            <div>
                                                <div className="text-3xl font-bold text-white">{p.total_points || 0}</div>
                                                <div className="text-xs text-white/70">POINTS</div>
                                            </div>
                                            <div>
                                                <div className="text-3xl font-bold text-white">{p.problems_solved || 0}</div>
                                                <div className="text-xs text-white/70">SOLVED</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex md:hidden flex-wrap gap-6 text-center">
                                        <div>
                                            <div className="text-3xl font-bold text-white">#{p.global_rank || '—'}</div>
                                            <div className="text-xs text-white/70">RANK</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-white">{p.total_points || 0}</div>
                                            <div className="text-xs text-white/70">POINTS</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-white">{p.problems_solved || 0}</div>
                                            <div className="text-xs text-white/70">SOLVED</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Права частина — детальна інформація */}
                                <div className="md:w-4/5 p-8 space-y-6 nz-background-primary">
                                    {p.bio && (
                                        <div>
                                            <h3 className="text-sm uppercase tracking-widest nz-text-muted mb-2">About</h3>
                                            <div className="max-h-36 lg:max-h-52 text-zinc-300 pr-2 border-b custom-scrollbar overflow-y-auto leading-relaxed whitespace-pre-wrap">
                                                {p.bio}
                                            </div>
                                        </div>
                                    )}

                                    {p.interests && (
                                        <div>
                                            <h3 className="text-sm uppercase tracking-widest nz-text-muted mb-2">Interests</h3>
                                            <p className="text-zinc-300">{p.interests}</p>
                                        </div>
                                    )}

                                    {/* Соціальні посилання */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {p.git && (
                                            <a href={p.git} target="_blank" className="flex items-center gap-3 p-3 nz-background-accent hover:nz-background-secondary rounded-2xl transition-colors">
                                                <Github className="w-5 h-5" />
                                                <div>
                                                    <div className="text-sm font-medium">GitHub</div>
                                                    <div className="text-xs nz-text-muted">Profile</div>
                                                </div>
                                            </a>
                                        )}
                                        {p.twitter && (
                                            <a href={p.twitter} target="_blank" className="flex items-center gap-3 p-3 nz-background-accent hover:nz-background-secondary rounded-2xl transition-colors">
                                                <Twitter className="w-5 h-5" />
                                                <div>
                                                    <div className="text-sm font-medium">Twitter</div>
                                                    <div className="text-xs nz-text-muted">Profile</div>
                                                </div>
                                            </a>
                                        )}
                                        {p.linkedin && (
                                            <a href={p.linkedin} target="_blank" className="flex items-center gap-3 p-3 nz-background-accent hover:nz-background-secondary rounded-2xl transition-colors">
                                                <Linkedin className="w-5 h-5" />
                                                <div>
                                                    <div className="text-sm font-medium">LinkedIn</div>
                                                    <div className="text-xs nz-text-muted">Profile</div>
                                                </div>
                                            </a>
                                        )}
                                        {p.youtube && (
                                            <a href={p.youtube} target="_blank" className="flex items-center gap-3 p-3 nz-background-accent hover:nz-background-secondary rounded-2xl transition-colors">
                                                <Youtube className="w-5 h-5" />
                                                <div>
                                                    <div className="text-sm font-medium">YouTube</div>
                                                    <div className="text-xs nz-text-muted">Channel</div>
                                                </div>
                                            </a>
                                        )}
                                    </div>

                                    {/* Додаткова інформація */}
                                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t text-sm nz-text-muted">
                                        {p.address && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {p.address}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Joined {formatJoinDate(user.date_joined)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};