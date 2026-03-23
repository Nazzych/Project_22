import { useEffect, useState, useMemo, useRef } from 'react';
import { useModal } from '../../../../../hooks/useModal';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import {
    Save,
    User,
    Mail,
    Building2,
    Globe,
    Twitter,
    BookOpenText,
    UserCircle2,
    Github,
    ImagePlus,
    EyeOff,
} from 'lucide-react';
import { useToast } from '../../../../../providers/MessageProvider';
import { EditableProfileGit } from '../../../../../types/profile';
import { saveGitHubProfile } from '../../../../../api/profile';
import { getCsrfToken } from '../../../../../api/auth';
import { useProfile } from '../../../../../contexts/ProfileContext';

interface GitHubProfileModalProps {
    githubData: Record<string, string | number | null>;
    existingBio?: string;
}

export function GitHubProfileModal({ githubData, existingBio }: GitHubProfileModalProps) {
    const { closeModal } = useModal();
    const { showToast } = useToast();
    const hasShown = useRef(false);
    const { fetchProfile } = useProfile();

    const initialEnabled = {
        ...Object.fromEntries(
            Object.entries(githubData)
            .filter(([_, value]) => value !== null && value !== '')
            .map(([key]) => [key, true])
        ),
        bio: true,
        bio_public_repos: true,
        bio_followers: true,
        bio_created_at: true,
        bio_company: true,
        bio_blog: true,
        };

    const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>(initialEnabled);
    const [useAvatar, setUseAvatar] = useState(true);

    const toggleField = (name: string) => {
        setEnabledFields((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const combinedBio = useMemo(() => {
        const lines: string[] = [];

        if (enabledFields.bio_public_repos && githubData.public_repos)
            lines.push(`📦 Публічні репозиторії: ${githubData.public_repos}`);
        if (enabledFields.bio_followers && githubData.followers)
            lines.push(`👥 Підписники: ${githubData.followers}`);
        if (enabledFields.bio_created_at && githubData.created_at)
            lines.push(`📅 На GitHub з ${new Date(githubData.created_at).toLocaleDateString()}`);
        if (enabledFields.bio_company && githubData.company)
            lines.push(`🏢 ${githubData.company}`);
        if (enabledFields.bio_blog && githubData.blog)
            lines.push(`🌐 ${githubData.blog}`);

        if (githubData.bio) if (githubData.bio) lines.push('', String(githubData.bio));
        if (existingBio) lines.push('', String(existingBio));

        return lines.join('\n');
    }, [enabledFields, githubData, existingBio]);

    const [bioValue, setBioValue] = useState(combinedBio);
    useEffect(() => {
        if (enabledFields.bio) {
            setBioValue(combinedBio);
        }
    }, [combinedBio, enabledFields.bio]);

    const fields = [
        { label: 'Username', name: 'username', icon: <User className="w-4 h-4" />, value: githubData.username ? String(githubData.username).toLowerCase() : '' },
        { label: 'Email', name: 'email', icon: <Mail className="w-4 h-4" />, value: githubData.email },
        { label: 'Full Name', name: 'name', icon: <UserCircle2 className="w-4 h-4" />, value: githubData.name },
        { label: 'Twitter URL', name: 'twitter_url', icon: <Twitter className="w-4 h-4" />, value: githubData.twitter_username ? `https://twitter.com/${githubData.twitter_username}` : null },
        { label: 'GitHub URL', name: 'html_url', icon: <Github className="w-4 h-4" />, value: githubData.html_url },
    ];
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const filteredFormData = new FormData();

        Array.from(formData.entries()).forEach(([key, value]) => {
            if (key.startsWith('use_') && value === 'on') {
                const fieldName = key.replace('use_', '');
                const fieldValue = formData.get(fieldName);
                if (fieldValue) {
                    filteredFormData.append(fieldName, fieldValue);
                }
            }
        });

        if (useAvatar) {
            const avatarUrl = formData.get('avatar_url');
            if (avatarUrl) {
                filteredFormData.append('avatar_url', avatarUrl);
            }
        }

        try {
            const payload: EditableProfileGit = {} as EditableProfileGit;

            Array.from(filteredFormData.entries()).forEach(([key, value]) => {
            payload[key as keyof EditableProfileGit] = value.toString();
            });

// Додаткові поля, які не редагуються вручну, але важливі
            if (githubData.public_repos !== undefined && githubData.public_repos !== null) {
                payload.public_repos = githubData.public_repos.toString();
            }

            if (githubData.followers !== undefined && githubData.followers !== null) {
                payload.followers = githubData.followers.toString();
            }

            if (githubData.created_at) {
            payload.created_at = new Date(githubData.created_at).toISOString();
            }
            if (githubData.twitter_username) {
            payload.twitter_url = `https://twitter.com/${githubData.twitter_username}`;
            }

            if (enabledFields.bio && bioValue) {
                filteredFormData.append('bio', bioValue);
            }

            await getCsrfToken();
            await saveGitHubProfile(payload);
            await fetchProfile();
            closeModal();

            // let debugText = '';
            // filteredFormData.forEach((value, key) => {
            // debugText += `${key}: ${value}\n`;
            // });
            // alert(`Дані, що надсилаються:\n${debugText}`);
            if (!hasShown.current) {
                showToast('success', 'Profile', 'Your profile updated with GitHub.');
                hasShown.current = true;
            }
        } catch (err) {
            console.error('Помилка запиту:', err);
            if (!hasShown.current) {
                showToast('error', 'Error 1', 'Something went wrong!');
                hasShown.current = true;
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Editable Fields */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-sm border-l-4 border-accent px-4 py-2 nz-foreground nz-background-accent rounded">
                    Ми підставили дані з твого GitHub-профілю. Вибери, що хочеш зберегти, або відредагуй перед підтвердженням.
                </div>
                {/* Avatar */}
                <div className="flex items-start gap-4">
                    <input
                    type="checkbox"
                    checked={useAvatar}
                    onChange={() => setUseAvatar((prev) => !prev)}
                    className="mt-3 accent-accent"
                    />
                    <div className="flex-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                        {useAvatar ? <ImagePlus className="w-4 h-4 text-accent" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                        {useAvatar ? 'Аватар з GitHub' : 'Аватар вимкнено'}
                    </label>
                    {useAvatar && (
                        <>
                        <img
                            src={String(githubData.avatar_url) || '/default-avatar.png'}
                            alt="GitHub Avatar"
                            className="w-16 h-16 rounded-full border border-border shadow mb-2"
                        />
                        <Input
                            type="url"
                            name="avatar_url"
                            defaultValue={String(githubData.avatar_url || '')}
                            className="w-full bg-input text-input-foreground border border-border rounded-md px-3 py-2"
                        />
                        </>
                    )}
                    </div>
                </div>

            {/* Editable Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields.map(({ label, name, icon, value }) => {
                    if (!value) return null;
                    const isEnabled = enabledFields[name] ?? true;

                    return (
                        <div key={name} className="col-span-1 flex items-start gap-3">
                        <input
                            type="checkbox"
                            name={`use_${name}`}
                            checked={isEnabled}
                            onChange={() => toggleField(name)}
                            className="mt-3 accent-accent"
                        />
                        <div className="flex-1">
                            <label
                            htmlFor={name}
                            className={`flex items-center gap-2 text-sm font-medium mb-1 transition-all ${isEnabled ? 'text-accent' : 'line-through text-muted-foreground'
                                }`}
                            >
                            {icon}
                            {label}
                            </label>
                            <Input
                            type="text"
                            name={name}
                            defaultValue={String(value)}
                            disabled={!isEnabled}
                            className={`w-full bg-input border border-border rounded-md px-3 py-2 ${isEnabled ? 'text-input-foreground' : 'text-muted-foreground opacity-60'
                                }`}
                            />
                        </div>
                        </div>
                    );
                    })}

                    {/* Bio Field */}
                    <div className="col-span-1 md:col-span-2 flex items-start gap-3">
                        <input
                            type="checkbox"
                            name="use_bio"
                            checked={enabledFields.bio}
                            onChange={() => toggleField('bio')}
                            className="mt-3 accent-accent"
                        />
                        <div className="flex-1">
                            <label
                            htmlFor="bio"
                            className={`flex items-center gap-2 text-sm font-medium mb-1 transition-all ${enabledFields.bio ? 'text-accent' : 'line-through text-muted-foreground'
                                }`}
                            >
                            <BookOpenText className="w-4 h-4" />
                            Bio
                            </label>
                            <Textarea
                                name="bio"
                                rows={6}
                                value={bioValue}
                                onChange={(e) => setBioValue(e.target.value)}
                                disabled={!enabledFields.bio}
                                className={`w-full bg-input border border-border rounded-md px-3 py-2 ${
                                    enabledFields.bio ? 'text-input-foreground' : 'text-muted-foreground opacity-60'
                                }`}
                            />
                            <div className="mt-4 space-y-2 border border-border rounded-md p-4 bg-muted/30">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Додаткові дані з GitHub:</p>
                            {[
                                { key: 'public_repos', label: `📦 Публічні репозиторії: ${githubData.public_repos}` },
                                { key: 'followers', label: `👥 Підписники: ${githubData.followers}` },
                                { key: 'created_at', label: `📅 На GitHub з ${githubData.created_at ? `${new Date(githubData.created_at).toLocaleDateString()}` : null}` },
                                { key: 'company', label: `🏢 ${githubData.company}` },
                                { key: 'blog', label: `🌐 ${githubData.blog}` },
                            ].map(({ key, label }) => {
                                if (!githubData[key]) return null;
                                const isChecked = enabledFields[`bio_${key}`] ?? true;

                                return (
                                <div key={key} className="flex items-center gap-2">
                                    <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() =>
                                        setEnabledFields((prev) => ({
                                        ...prev,
                                        [`bio_${key}`]: !prev[`bio_${key}`],
                                        }))
                                    }
                                    className="accent-accent"
                                    />
                                    <span className={`text-sm ${isChecked ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                                    {label}
                                    </span>
                                </div>
                                );
                            })}
                            </div>
                        </div>
                    </div>
                </div>

            {/* Actions */}
                <div className="flex justify-start gap-2 pt-4">
                    <Button
                    onClick={closeModal}
                    variant="btn_secondary"
                    className="px-4 py-2 text-sm font-medium rounded bg-muted text-foreground hover:bg-muted/80 transition"
                    >
                    Скасувати
                    </Button>
                    <Button
                    type="submit"
                    variant="btn_accent"
                    className="px-4 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition"
                    >
                    <Save className="w-5 h-5 mr-2" />
                    Зберегти профіль
                    </Button>
                </div>
            </form>
        </div>
    );
}
