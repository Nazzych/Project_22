import React, { useState } from 'react';
import {
    UserIcon, MapPin, Mail, Youtube, Github, Twitter, Linkedin,
    ShieldCheck, AtSign, Trash2, FileText, Lock, XCircle
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { useToast } from '../../../../../providers/MessageProvider';
import { useModal } from '../../../../../hooks/useModal';
import { getCsrfToken } from '../../../../../api/auth';
import { adminUpdateUser, adminDeleteUser, adminBanUser } from '../../../../../api/admin';
import { Profile } from '../../../../../types/profile';
import { FormModalWithInput } from '../../FormModalWithInput';

interface AdminEditUserModalProps {
    user: any;
    onSuccess: () => void;
}

const sections = ['General', 'Links', 'Additional', 'Admin'] as const;
type Section = typeof sections[number];

export function AdminEditUserModal({ user, onSuccess }: AdminEditUserModalProps) {
    const { showToast } = useToast();
    const { openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        is_staff: user.is_staff || false,

        profile: {
            bio: user.profile?.bio || "",
            address: user.profile?.address || "",
            youtube: user.profile?.youtube || "",
            linkedin: user.profile?.linkedin || "",
            twitter: user.profile?.twitter || "",
            git: user.profile?.git || "",
            total_points: user.profile?.total_points || 0,
            global_rank: user.profile?.global_rank || 0,
            problems_solved: user.profile?.problems_solved || 0,
            current_streak: user.profile?.current_streak || 0,
        }
    });

    const [activeSection, setActiveSection] = useState<Section>('General');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        setForm(prev => {
            if (name.startsWith('profile.')) {
                const field = name.replace('profile.', '');
                return {
                    ...prev,
                    profile: {
                        ...prev.profile,
                        [field]: type === 'number' ? parseInt(value) || 0 : value
                    }
                };
            }

            return {
                ...prev,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user.is_superuser) {
                const payload = {
                    first_name: form.first_name,
                    last_name: form.last_name,
                    username: form.username,
                    email: form.email,
                    is_staff: form.is_staff,
                    profile: form.profile
                };
                await adminUpdateUser(user.id, payload);
                showToast('info', 'Success', `User profile with ID - ${user.id} updated successfully!`);
                onSuccess();
            } else {
                showToast ("error", "I SAID YOU CAN'T MANAGE ME!", "THINK AGAIN - YOU REALLY WANT DO THIS?")
            }
            closeModal();
        } catch (err: any) {
            console.error(err);
            showToast('error', 'Error', `Can't update profile of user with ID - ${user.id}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (user_id: number) => {
        setLoading(true);
        try {
            await getCsrfToken();
            await adminDeleteUser(user_id);
            showToast('info', 'Success', `User with ID - ${user_id} deleted successfuly!`);
            onSuccess();
            closeModal();
        } catch (err: any) {
            console.error(err);
            showToast('error', 'Error', `Can't delete user with ID - ${user_id}!`);
        } finally {
            setLoading(false);
        }
    }

    const banUser = async (user_id: number, reason: string) => {
        setLoading(true);
        try {
            await getCsrfToken();
            const res = await adminBanUser(user_id, reason);
            showToast('info', 'Success', `${res.message}`);
            onSuccess();
            closeModal();
        } catch (err: any) {
            console.error(err);
            showToast('error', 'Error', `Can't ban user with ID - ${user_id}!`);
        } finally {
            setLoading(false);
        }
    }

    const handleBanClick = (user_id: number) => {
        openModal({
            id: 'admin-ban-profile',
            width: "xl",
            x: false,
            title: (
                <div className='w-fit flex flex-row justify-center items-center gap-2 nz-background-secondary px-4 py-1 rounded-lg'>
                    <Lock className="w-5 h-5 text-primary" /> Ban user - "{user_id}"
                </div>
            ),
            content: (
                <FormModalWithInput
                    onSubmit={(reason) => {banUser (user_id, String(reason))}}
                    onCancel={() => closeModal()}
                    fieldType="textarea"
                    labelText="Enter the reason ofthe ban."
                    submitText='Ban him!'
                    cancelText='Not ban him'
                    isSubmitting={false}
                />
            ),
        });
    };


    const sectionIcons: Record<Section, React.ReactNode> = {
        General: <UserIcon className="w-5 h-5" />,
        Links: <Linkedin className="w-5 h-5" />,
        Additional: <FileText className="w-5 h-5" />,
        Admin: <ShieldCheck className="w-5 h-5" />,
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'General':
                return (
                    <div className="space-y-5">
                        <Input icon={<UserIcon className="w-4 h-4" />} name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} />
                        <Input icon={<UserIcon className="w-4 h-4" />} name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} />
                        <Input icon={<AtSign className="w-4 h-4" />} name="username" placeholder="Username" value={form.username} onChange={handleChange} />
                        <Input icon={<Mail className="w-4 h-4" />} name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                    </div>
                );

            case 'Links':
                return (
                    <div className="space-y-5">
                        <Input icon={<Youtube className="w-4 h-4" />} name="profile.youtube" placeholder="YouTube URL" value={form.profile.youtube} onChange={handleChange} />
                        <Input icon={<Twitter className="w-4 h-4" />} name="profile.twitter" placeholder="Twitter / X URL" value={form.profile.twitter} onChange={handleChange} />
                        <Input icon={<Linkedin className="w-4 h-4" />} name="profile.linkedin" placeholder="LinkedIn URL" value={form.profile.linkedin} onChange={handleChange} />
                        <Input icon={<Github className="w-4 h-4" />} name="profile.git" placeholder="GitHub URL" value={form.profile.git} onChange={handleChange} />
                    </div>
                );

            case 'Additional':
                return (
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium mb-1.5">Bio</label>
                            <Textarea
                                name="profile.bio"
                                value={form.profile.bio}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Bio about the user..."
                            />
                        </div>
                        <Input icon={<MapPin className="w-4 h-4" />} name="profile.address" placeholder="Address" value={form.profile.address} onChange={handleChange} />
                    </div>
                );

            case 'Admin':
                return (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="is_staff"
                                checked={form.is_staff}
                                onChange={handleChange}
                                className="w-5 h-5 accent-violet-500"
                            />
                            <label className="text-sm font-medium">Is Staff (Administrator)</label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Total Points</label>
                            <Input type="number" name="profile.total_points" value={form.profile.total_points} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Global Rank</label>
                            <Input type="number" name="profile.global_rank" value={form.profile.global_rank} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Problems Solved</label>
                            <Input type="number" name="profile.problems_solved" value={form.profile.problems_solved} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Current Streak</label>
                            <Input type="number" name="profile.current_streak" value={form.profile.current_streak} onChange={handleChange} />
                        </div>
                    </div>
                );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
            <aside className="w-full md:w-1/3 border nz-background-accent p-3 md:p-4 rounded-full md:rounded-2xl">
                <nav className="flex md:flex-col gap-1 md:gap-1.5 overflow-x-auto md:overflow-x-visible">
                    {sections.map((section) => (
                        <button
                            key={section}
                            type="button"
                            onClick={() => setActiveSection(section)}
                            className={`flex-shrink-0 md:w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                activeSection === section
                                    ? 'nz-bg-primary text-white'
                                    : 'hover:nz-background-primary text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            {sectionIcons[section]}
                            <span className="hidden md:inline">{section}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <section className="flex-1 p-6 overflow-y-auto">
                <div className='flex items-center justify-between flex-wrap gap-4 mb-8 p-2 nz-background-accent border rounded-3xl'>
                    <div className='flex items-center flex-wrap gap-4'>
                        {user.profile?.avatar_url ? (
                            <img 
                                src={user.profile.avatar_url} 
                                alt={user.username}
                                className="w-16 h-16 object-cover rounded-full"
                            />
                        ) : (
                            <div className="w-16 h-16 flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white rounded-full">
                                {user.first_name?.[0] || user.username[0].toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className='text-xl font-mono'>{user.first_name} {user.last_name}</p>
                            <p className='nz-text-muted text-[12px] font-mono'>{user.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button onDoubleClick={() => deleteUser(user.id)} size='sm' variant="btn_destructive" className="w-full relative">
                            <Trash2 className="w-4 h-4" />
                            <span className='absolute -bottom-0.5 font-bold right-1.5 text-[8px]'>Double</span>
                        </Button>
                        <Button onDoubleClick={() => handleBanClick(user.id)} size='sm' variant="btn_warning" className="w-full relative">
                            <Lock className="w-4 h-4" />
                            <span className='absolute -bottom-0.5 font-bold right-1.5 text-[8px]'>Double</span>
                        </Button>
                    </div>
                </div>

                {renderSection()}

                <div className="pt-8 flex justify-end gap-3">
                    <Button type="button" variant="btn_secondary" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="btn_success" disabled={loading}>
                        {loading ? <LoadingSpinner text="Saving..." /> : 'Save Changes'}
                    </Button>
                </div>
            </section>
        </form>
    );
}
