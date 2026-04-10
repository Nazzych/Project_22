import React, { useState } from 'react';
import {
    UserIcon, MapPin, Mail, Youtube, Github, Twitter, Linkedin,
    ShieldCheck, AtSign, Trash2, FileText, Lock
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { useToast } from '../../../../../providers/MessageProvider';
import { useModal } from '../../../../../hooks/useModal';
import { adminUpdateUser } from '../../../../../api/admin';

interface AdminEditUserModalProps {
    user: any;
    onSuccess: () => void;
}

const sections = ['General', 'Links', 'Additional', 'Admin'] as const;
type Section = typeof sections[number];

export function AdminEditUserModal({ user, onSuccess }: AdminEditUserModalProps) {
    const { showToast } = useToast();
    const { closeModal } = useModal();
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
            const payload = {
                first_name: form.first_name,
                last_name: form.last_name,
                username: form.username,
                email: form.email,
                is_staff: form.is_staff,
                profile: form.profile
            };

            await adminUpdateUser(user.id, payload);

            showToast('success', 'Успішно', 'Профіль користувача оновлено');
            onSuccess();
            closeModal();
        } catch (err: any) {
            console.error(err);
            showToast('error', 'Помилка', 'Не вдалося оновити профіль');
        } finally {
            setLoading(false);
        }
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

                        {/* Кнопки видалення та блокування */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                            <Button variant="btn_destructive" className="w-full">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete account
                            </Button>
                            <Button variant="btn_warning" className="w-full">
                                <Lock className="w-4 h-4 mr-2" />
                                Block account
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full h-[560px] flex flex-col md:flex-row overflow-hidden">
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

// Іконки для секцій
const sectionIcons: Record<Section, React.ReactNode> = {
    General: <UserIcon className="w-5 h-5" />,
    Links: <Linkedin className="w-5 h-5" />,
    Additional: <FileText className="w-5 h-5" />,
    Admin: <ShieldCheck className="w-5 h-5" />,
};