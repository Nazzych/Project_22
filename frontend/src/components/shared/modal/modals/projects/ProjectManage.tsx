import React, { useState } from 'react';
import {
    FileText, Tag, Github, Globe, ImagePlus, XIcon, File, Trash2
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { Select } from '../../../../ui/Select';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { useToast } from '../../../../../providers/MessageProvider';
import { useModal } from '../../../../../hooks/useModal';
import { getCsrfToken } from '../../../../../api/auth';
import { createProject, updateProject } from '../../../../../api/projects';
import { projectUpdate } from '../../../../../api/admin';
import { EditableProject, ProjectFormProps } from '../../../../../types/projects';
import { motion } from 'framer-motion';
import axios from 'axios';

const tabs = ['General', 'README', 'Files'] as const;
type Tab = typeof tabs[number];

export function ProjectManage({ onSuccess, onDelete, isAdminMode, project }: ProjectFormProps) {
    const { showToast } = useToast();
    const { closeModal } = useModal();
    const [activeTab, setActiveTab] = useState<Tab>('General');
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [paths, setPaths] = useState<string[]>([]);

    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "archived", label: "Archived" },
    ]

    const [form, setForm] = useState<EditableProject>({
        title: project?.title || '',
        description: project?.description || '',
        readme: project?.readme || '',
        technologies: project?.technologies || '',
        github_url: project?.github_url || '',
        live_url: project?.live_url || '',
        status: project?.status || '',
        image: project?.image || '',
    });

    // Якщо редагуємо — заповнюємо шляхи з існуючого проєкту (якщо бекенд повертає)
    // useEffect(() => {
    //     if (project) {
            // Припустимо, що project має поле files або paths
            // Якщо в Project є поле paths: string[] — розкоментуй
            // setPaths(project.paths || []);
            // setFiles([]); // файли не можна редагувати, тільки додавати нові
    //     }
    // }, [project]);

    const handleSelectChange = (value: string) => {
        setForm(prev => ({
            ...prev,
            status: value
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const clearField = (name: keyof EditableProject) => {
        setForm({ ...form, [name]: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!form.title?.trim() || !form.description?.trim() || !form.readme?.trim()) {
            showToast('warning', 'Missing fields', 'Please fill in both title, description and README.');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            
            // Додати текстові поля
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value || '');
            });
            
            // Додати файли (тільки нові)
            files.forEach((file) => {
                formData.append('file', file);
            });
            
            // Додати шляхи як JSON
            formData.append('paths', JSON.stringify(paths));
            
            await getCsrfToken();
            // Редагування проєкту
            if (project) {
                if (isAdminMode) {
                    await projectUpdate(project!.id, form);
                    showToast('info', 'Project updated', 'Project has been successfully updated.');
                } else {
                    await updateProject(project!.id, form);
                    showToast('success', 'Project updated', 'Your project has been successfully updated.');
                }
            // Створення нового проєкту
            } else {
                await createProject(formData);
                showToast('success', 'Project created', 'Your project has been successfully added.');
            }

            if (onSuccess) {
                onSuccess();
            }
            closeModal();
        } catch (err) {
            console.error('Error saving project:', err);
            if (axios.isAxiosError(err) && err.response?.data) {
                const { type, message } = err.response.data;
                showToast(type || 'error', 'Save failed', message || 'Unknown error');
            } else {
                if (files.length > 100) {
                    showToast('warning', 'Max - 100 files', 'You select to many files.');
                } else {
                    showToast('error', 'Save failed', 'Something went wrong while saving your project.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        const newPaths = selected.map((file: any) => file.webkitRelativePath || file.name);
        setFiles([...files, ...selected]); // додаємо до існуючих
        setPaths([...paths, ...newPaths]);
    };

    const renderInput = (
        icon: React.ReactNode,
        name: keyof EditableProject,
        placeholder: string,
        type: 'text' | 'url' = 'text'
    ) => (
        <div className="relative">
            <Input
                type={type}
                icon={icon}
                name={name}
                placeholder={placeholder}
                value={form?.[name] || ''}
                onChange={handleChange}
                className="pr-10"
            />
            {form?.[name] && (
                <button
                    type="button"
                    onClick={() => clearField(name)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-destructive transition"
                    aria-label={`Clear ${String(name)}`}
                >
                    <XIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'General':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center w-full">
                                <hr className="flex-grow border-white" />
                                <span className="mx-4 text-sm font-medium nz-text-muted whitespace-nowrap">
                                    Important inputs
                                </span>
                                <hr className="flex-grow border-white" />
                            </div>
                            {renderInput(<FileText className="w-4 h-4" />, 'title', 'Project Title')}
                            <Textarea
                                icon={<FileText className="w-4 h-4" />}
                                rows={5}
                                name="description"
                                value={form.description || ''}
                                onChange={handleChange}
                                placeholder="Short description about your project..."
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center w-full">
                                <hr className="flex-grow border-white" />
                                <span className="mx-4 text-sm font-medium nz-text-muted whitespace-nowrap">
                                    Links
                                </span>
                                <hr className="flex-grow border-white" />
                            </div>
                            {renderInput(<Github className="w-4 h-4" />, 'github_url', 'GitHub URL (optional)', 'url')}
                            {renderInput(<Globe className="w-4 h-4" />, 'live_url', 'Live Demo URL (optional)', 'url')}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center w-full">
                                <hr className="flex-grow border-white" />
                                <span className="mx-4 text-sm font-medium nz-text-muted whitespace-nowrap">
                                    Additional
                                </span>
                                <hr className="flex-grow border-white" />
                            </div>
                            {renderInput(<Tag className="w-4 h-4" />, 'technologies', 'Technologies (comma-separated)')}
                            {renderInput(<ImagePlus className="w-4 h-4" />, 'image', 'Image URL (optional)', 'url')}
                            <Select className='w-full nz-bg-input rounded-xl'
                                options={statusOptions}
                                defaultLabel={project?.status || "Active"}
                                onChange={handleSelectChange}
                            />
                            {form.image && (
                                <img
                                    src={form.image}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg border border-border"
                                />
                            )}
                        </div>
                    </div>
                );

            case 'README':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center w-full">
                            <hr className="flex-grow border-white" />
                            <span className="mx-4 text-sm font-medium nz-text-muted whitespace-nowrap">
                                README for describe project
                            </span>
                            <hr className="flex-grow border-white" />
                        </div>
                        <div className='space-y-0'>
                            <Textarea
                                icon={<FileText className="w-4 h-4" />}
                                rows={5}
                                name="readme"
                                value={form.readme || ''}
                                onChange={handleChange}
                                placeholder="README.md for your project..."
                                />
                            <p className='text-[12px] nz-text-muted text-right'>*required field</p>
                        </div>
                    </div>
                )

            case 'Files':
                return (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">Add new files</label>
                        <Input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            buttonLabel="Select file (max file lenght - 100)"
                            className="block w-full text-sm text-muted-foreground"
                        />

                        <label className="block text-sm font-medium">Or select folder</label>
                        <Input
                            type="file"
                            multiple
                            webkitdirectory
                            onChange={handleFileSelect}
                            buttonLabel="Select folder (max lenght - 100 *with folders)"
                            className="block w-full text-sm text-muted-foreground"
                        />

                        {paths.length > 0 && (
                            <div className="mt-4">
                                <p className="w-fit text-sm font-medium mb-2 p-1 px-3 nz-background-secondary rounded-md">Selected files</p>
                                <ul className="text-xs text-muted-foreground space-y-1 max-h-40 p-4 nz-background-secondary overflow-y-auto rounded-md">
                                    {paths.map((p, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <File className="w-4 h-4 text-sky-600" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
        }
    };

    const isEditMode = !!project;

    return (
        <form onSubmit={handleSubmit} className="w-full min-h-[80vh] rounded-2xl nz-background-accent border">
            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/50">
                {tabs.map((tab) => (
                    <div key={tab} className="relative">
                        <button
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab}
                        </button>
                        {activeTab === tab && (
                            <motion.div
                                layoutId="addproj-tab-underline"
                                className="absolute bottom-0 left-1 right-1 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-full"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {renderTabContent()}

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    {project && (
                        <Button type="button" variant="btn_destructive" disabled={loading} className='relative flex' onDoubleClick={onDelete}>
                            <Trash2 className='w-4 h-4 mr-1' /> Delete
                            <span className='absolute -bottom-1 text-[8px]'>Double click</span>
                        </Button>
                    )}
                    <Button type="button" variant="btn_secondary" disabled={loading} onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button type="submit" variant={project ? "btn_warning" : "btn_success"} disabled={loading}>
                        {loading ? <LoadingSpinner text="Saving..." /> : isEditMode ? 'Save Changes' : 'Create Project'}
                    </Button>
                </div>
            </div>
        </form>
    );
}