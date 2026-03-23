import { useState, useRef } from 'react';
import {
    UserIcon, FileText, MapPin, Mail, Youtube, Github, Twitter, Linkedin, Trash2, KeyRound, XIcon,
    TriangleAlert, AtSign, Link, Lock, LayoutGrid, AlignLeft
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { updateProfile, deleteProfile } from '../../../../../api/profile';
import { getCsrfToken } from '../../../../../api/auth';
import { useToast } from '../../../../../providers/MessageProvider';
import { EditProfileFormProps, EditableProfile } from '../../../../../types/profile';
import { useProfile } from '../../../../../contexts/ProfileContext';
import { DeleteProfileConfirm } from '../profile/DeleteProfileConfirm';
import { ChangePasswordModal } from '../profile/ChangePasswordModal';
import { useModal } from '../../../../../hooks/useModal';

const sections = ['General', 'Links', 'Additional', 'Security'] as const;
type Section = typeof sections[number];

export function EditProfileForm({ onSuccess, initialData }: EditProfileFormProps) {
    const { fetchProfile } = useProfile();
    const { showToast } = useToast();
    const { openModal, closeModal } = useModal();
    const hasShown = useRef(false);

    const [form, setForm] = useState<EditableProfile>(initialData);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<Section>('General');

    const sectionIcons: Record<Section, React.ReactNode> = {
        General: <LayoutGrid className="w-5 h-5 mr-0 md:mr-2" />,
        Links: <Link className="w-5 h-5 mr-0 md:mr-2" />,
        Additional: <AlignLeft className="w-5 h-5 mr-0 md:mr-2" />,
        Security: <Lock className="w-5 h-5 mr-0 md:mr-2" />,
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const clearField = (name: keyof EditableProfile) => {
        setForm({ ...form, [name]: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await getCsrfToken();
            await updateProfile(form);
            await fetchProfile();
            showToast('success', 'Profile updated', 'Your profile has been successfully updated.');
            onSuccess();
            closeModal();
        } catch (err) {
            console.error('Помилка при оновленні профілю:', err);
            if (!hasShown.current) {
                showToast('error', 'Update failed', 'Something went wrong while updating your profile.');
                hasShown.current = true;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        openModal({
            id: 'delete-profile',
            title: (
                <div className="w-[90%] flex items-center nz-text-destructive nz-background-secondary px-4 py-1 rounded-full">
                    <Trash2 className="w-5 h-5 mr-2" />
                    <span>Confirm Deletion</span>
                </div>
            ),
            width: 'sm',
            content: (
                <DeleteProfileConfirm
                    onConfirm={async () => {
                        try {
                            await getCsrfToken();
                            await deleteProfile();
                            showToast('success', 'Account deleted', 'Your account has been successfully deleted.');
                            window.location.href = '/login';
                        } catch (err) {
                            showToast('error', 'Delete failed', 'Something went wrong while deleting your account.');
                        }
                    }}
                    onCancel={closeModal}
                />
            ),
        });
    };

    const handleChangeModal = () => {
        openModal({
        id: 'reset-password',
        title: (
            <div className="w-[90%] flex items-center gap-2 nz-text-warning font-semibold nz-background-secondary px-4 py-1 rounded-full">
            <KeyRound className="w-5 h-5" />
            Reset Password
            </div>
        ),
        width: 'md',
        content: <ChangePasswordModal />,
        });
    };

    const renderInput = (icon: React.ReactNode, name: keyof EditableProfile, placeholder: string, disabled = false) => (
        <div className="relative">
            <Input
                type="text"
                icon={icon}
                name={name}
                placeholder={placeholder}
                value={form?.[name] || ''}
                onChange={handleChange}
                className="pr-10"
                disabled={disabled}
            />
            {form?.[name] && !disabled && (
                <button
                    type="button"
                    onClick={() => clearField(name)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-destructive transition"
                    aria-label={`Clear ${name}`}
                >
                    <XIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );

    const renderSection = () => {
        switch (activeSection) {
            case 'General':
                return (
                    <div className="space-y-4 m-3">
                        <div>
                            <p className="mb-1">Display name is visible to others.</p>
                            <div className='px-4'>
                                {renderInput(<UserIcon className="w-4 h-4" />, 'first_name', 'First Name')}
                            </div>
                        </div>
                        <div>
                            <p className="mb-1">Last name.</p>
                            <div className='px-4'>
                                {renderInput(<UserIcon className="w-4 h-4" />, 'last_name', 'Last Name')}
                            </div>
                        </div>
                        <div>
                            <p className="mb-1">E-mail address.</p>
                            <div className='px-4'>
                                {renderInput(<Mail className="w-4 h-4" />, 'email', 'Email')}
                            </div>
                        </div>
                        <div>
                            <p className="mb-1">Your location (optional).</p>
                            <div className='px-4'>
                                {renderInput(<MapPin className="w-4 h-4" />, 'address', 'Example: Ukraine, Kyiv')}
                            </div>
                        </div>
                        <div>
                            <p className="mb-1">Your unique username.</p>
                            <div className='px-4'>
                                {renderInput(<AtSign className="w-4 h-4" />, 'username', 'Username')}
                            </div>
                        </div>
                    </div>
                );
            case 'Links':
                return (
                    <div className="space-y-4 m-3">
                        <div>
                            <p className="mb-1">Your YouTube channel URL.</p>
                            <div className='px-4'>
                                {renderInput(<Youtube className="w-4 h-4" />, 'youtube', 'YouTube URL')}
                            </div>
                        </div>
                        <div>
                            <p className="mb-1">Your X shared link of profile.</p>
                            <div className='px-4'>
                                {renderInput(<Twitter className="w-4 h-4" />, 'twitter', 'X / Twitter URL')}
                            </div>
                        </div>
                        <div>
                            <p className="mb-1">LinkedIn portfolio URL.</p>
                            <div className='px-4'>
                                {renderInput(<Linkedin className="w-4 h-4" />, 'linkedin', 'LinkedIn URL')}
                            </div>
                        </div>
                        <div>
                            <p className="mb-1">GitHub profile URL.</p>
                            <div className='px-4'>
                                {renderInput(<Github className="w-4 h-4" />, 'git', 'GitHub URL')}
                            </div>
                        </div>
                    </div>
                );
            case 'Additional':
                return (
                    <div className="space-y-4 m-3">
                        <p className="mb-1">A short bio to introduce yourself.</p>
                        <Textarea
                            icon={<FileText className="w-4 h-4" />}
                            name="bio"
                            value={form.bio || ''}
                            onChange={handleChange}
                            resizable={true}
                            className='max-h-80'
                            // className='max-h-[50vh] h-[50vh]'
                            placeholder="I am a software developer with a passion for open source..."
                        />
                    </div>
                );
            case 'Security':
                return (
                    <div className="flex flex-col gap-2 space-y-4 m-3">
                        <div>
                            <p className="mb-2">Change your password regularly to keep your account secure.</p>
                            <Button type="button" className='w-48 relative' variant="btn_warning" onDoubleClick={handleChangeModal}>
                                <KeyRound className="w-4 h-4 mr-2" /> Change Password
                                <span className='absolute -bottom-1 font-bold right-2 text-[8px]'>Double click</span>
                            </Button>
                        </div>
                        <div className="flex items-center w-full my-6">
                            <hr className="flex-grow border-black" />
                            <span className="flex items-center mx-4 text-xl text-red-500 whitespace-nowrap">
                                <TriangleAlert className="w-6 h-6 inline mr-1" /> Danger Zone
                            </span>
                            <hr className="flex-grow border-black" />
                        </div>
                        <div>
                            <p className="mb-2 font-medium text-right">Deleting your account is irreversible. All your data will be lost.</p>
                            <div className="flex justify-end">
                                <Button type="button" className='w-48 relative' variant="btn_destructive" onDoubleClick={handleDeleteClick}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                                    <span className='absolute -bottom-1 font-bold right-2 text-[8px]'>Double click</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full h-[555px] flex flex-col md:flex-row overflow-hidden relative">
            {/* Content */}
            <section className="w-full md:w-2/3 min-h-full p-3 flex flex-col justify-between nz-background-accent rounded-2xl overflow-y-auto">
                <div className="overflow-y-auto pr-2">
                    <div className='md:hidden flex flex-row justify-center'>
                        <div className='flex gap-4 px-2 py-1 nz-background-secondary rounded-full'>
                            {sections.map((section) => (
                                <button
                                    type="button"
                                    key={section}
                                    onClick={() => setActiveSection(section)}
                                    className={`flex items-center px-4 py-2 rounded-full font-medium transition ${
                                    activeSection === section
                                        ? 'nz-bg-primary nz-text-primary shadow'
                                        : 'hover:nz-bg-hover text-zinc-300'
                                    }`}
                                >
                                    {sectionIcons[section]}
                                </button>
                            ))}
                        </div>
                    </div>
                    {renderSection()}
                </div>
                <div className="space-y-4">
                    <div className="flex items-center w-full">
                        <hr className="flex-grow border-black" />
                        <span className="mx-4 text-sm font-medium nz-text-muted whitespace-nowrap">
                            Don't forget to save your changes!
                        </span>
                        <hr className="flex-grow border-black" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="btn_primary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button variant='btn_success' type="submit">
                            {loading ? <LoadingSpinner text="Saving..." /> : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Sidebar on the right */}
            <aside className="w-full md:w-1/3 hidden md:block p-4">
                <nav className="space-y-2 sticky top-6">
                    {sections.map((section) => (
                    <button
                        type="button"
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`w-full flex items-center px-4 py-2 rounded-md font-medium transition ${
                        activeSection === section
                            ? 'nz-bg-primary nz-text-primary shadow'
                            : 'hover:nz-bg-hover text-zinc-300'
                        }`}
                    >
                        {sectionIcons[section]}
                        {section}
                    </button>
                    ))}
                </nav>
            </aside>
        </form>
    );
}
