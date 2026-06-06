import React from 'react';
import { X, Trophy, Calendar, MapPin, Github, Twitter, Linkedin, Youtube, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile } from '../../../../../types/profile';
import { Card } from '../../../../ui/Card';
import { Button } from '../../../../ui/Button';
import { formatJoinDate } from '../../../../../lib/formatDate';

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
                        <Card size='wf' variant='card_primary' className="lg:mx-28 border overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                {/* Ліва частина — аватар + основна інфо */}
                                <div className="md:w-2/5 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 p-8 flex flex-col items-center justify-center relative">
                                    <Button variant='btn_glass'
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white" />
                                    </Button>

                                    <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 shadow-2xl mb-6">
                                        {p.avatar_url ? (
                                            <img src={p.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full  flex items-center justify-center text-7xl font-bold text-white">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="text-3xl font-bold text-white text-center">
                                        {user.first_name} {user.last_name}
                                    </h2>
                                    <p className="text-zinc-200 text-lg">@{user.username}</p>

                                    <div className="mt-6 flex gap-6 text-center">
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
                                <div className="md:w-3/5 p-8 space-y-6 nz-background-primary">
                                    {p.bio && (
                                        <div>
                                            <h3 className="text-sm uppercase tracking-widest nz-text-muted mb-2">About</h3>
                                            <p className="text-zinc-300 leading-relaxed">{p.bio}</p>
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