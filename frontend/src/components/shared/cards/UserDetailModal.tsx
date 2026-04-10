import React from 'react';
import { Calendar, Mail, MapPin, Youtube, Github, Twitter, Linkedin, Award } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Profile } from '../../../types/profile';

interface UserDetailModalProps {
    user: Profile;
    onEdit?: (user: Profile) => void;
}

export function UserDetailModal({ user, onEdit }: UserDetailModalProps) {
    const profile = user.profile;

    return (
        <div className="space-y-8 overflow-hidden">
            {/* Аватар + ім'я */}
            <div className="flex items-center gap-5">
                <div className="min-w-24 h-24 rounded-2xl overflow-hidden border-4 border-zinc-700">
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
                        <p className="max-h-[25vh] p-1 text-zinc-300 border whitespace-pre-wrap leading-relaxed break-words break-all rounded-lg overflow-y-auto">{profile.bio}</p>
                    </div>
                )}

                {/* Соціальні посилання */}
                {(profile?.git || profile?.twitter || profile?.linkedin || profile?.youtube) && (
                    <div className="md:col-span-2">
                        <p className="text-xs nz-text-muted mb-2">SOCIAL LINKS</p>
                        <div className="flex gap-3">
                            {profile.git && <a href={profile.git} target="_blank" className="text-zinc-400 hover:nz-text-hover"><Github className="w-5 h-5" /></a>}
                            {profile.twitter && <a href={profile.twitter} target="_blank" className="text-zinc-400 hover:nz-text-hover"><Twitter className="w-5 h-5" /></a>}
                            {profile.linkedin && <a href={profile.linkedin} target="_blank" className="text-zinc-400 hover:nz-text-hover"><Linkedin className="w-5 h-5" /></a>}
                            {profile.youtube && <a href={profile.youtube} target="_blank" className="text-zinc-400 hover:nz-text-hover"><Youtube className="w-5 h-5" /></a>}
                        </div>
                    </div>
                )}
            </div>

            {/* Кнопки дій */}
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
        </div>
    );
}