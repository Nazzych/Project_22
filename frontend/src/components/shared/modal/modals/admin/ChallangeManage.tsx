import React, { useState, useEffect } from 'react';
import {
    FileText, Tag, Code2, Trophy, Globe, XIcon, Save, Trash2
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { Select } from '../../../../ui/Select';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { CodeEditor } from '../../../../CodeEditor';
import { useToast } from '../../../../../providers/MessageProvider';
import { useModal } from '../../../../../hooks/useModal';
import { getCsrfToken } from '../../../../../api/auth';
import { createTask, updateTask } from '../../../../../api/admin';
import { motion } from 'framer-motion';

const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
];

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
];

const typeOptions = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'code', label: 'Code' },
];

const pointsOptions = [
    { value: 10, label: "10 Points" },
    { value: 20, label: "20 Points" },
    { value: 50, label: "50 Points" },
    { value: 80, label: "80 Points" },
    { value: 100, label: "100 Points" },
    { value: 150, label: "150 Points" },
    { value: 200, label: "200 Points" },
];

const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'go', label: 'Go' },
    { value: 'dart', label: 'Dart' },
    { value: 'rust', label: 'Rust' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'swift', label: 'Swift' },
    { value: 'jsx', label: 'JSX' },
    { value: 'tsx', label: 'TSX' },
    { value: 'html', label: 'HTML' },
    { value: 'htm', label: 'HTM' },
    { value: 'css', label: 'CSS' },
    { value: 'txt', label: 'Text' },
    { value: 'pdf', label: 'PDF' },
    { value: 'md', label: 'Markdown' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'csv', label: 'CSV' },
    { value: 'yaml', label: 'YAML' },
    { value: 'yml', label: 'YML' },
    { value: 'pem', label: 'PEM' },
    { value: 'env', label: 'Env' },
    { value: 'sqlite3', label: 'SQLite3' },
    { value: 'db', label: 'Database' },
    { value: 'sh', label: 'Shell Script' },
    { value: 'bat', label: 'Batch' },
    { value: 'ini', label: 'INI' },
];

interface TaskManageProps {
    onSuccess: any;
    onDelete?: () => void;
    task?: any;
}

export function ChallangeManage({ onSuccess, onDelete, task }: TaskManageProps) {
    const { showToast } = useToast();
    const { closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: task?.title || "",
        description: task?.description || "",
        tegs: task?.tegs || "",
        points: task?.points || "",
        difficul: task?.difficul ?? "medium",
        language: task?.language ?? "python",
        status: task?.status ?? "draft",
        c_type: task?.c_type ?? "quiz",
        e_input: task?.e_input || "",
        e_output: task?.e_output || "", 
        code: task?.code || "",
    });

    const isEditMode = !!task;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (field: string) => (value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!form.title.trim() || !form.description.trim()) {
            showToast('warning', 'Missing fields', 'Title and description are required.');
            setLoading(false);
            return;
        }

        //? showToast('info', '[DEBUG]', `${form.title}\n${form.description}\n${form.tegs}\n${form.points}\n${form.e_input}\n${form.e_output}\n${form.code}\n${form.difficul}\n${form.language}\n`);

        try {
            await getCsrfToken();

            if (task) {
                await updateTask(task.id, form);
                showToast('success', 'Task updated', 'Task updated successfully');
            } else {
                await createTask(form);
                showToast('success', 'Task created', 'Task created successfully');
            }
            closeModal();
            onSuccess();
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 400) {
                const msg = err.response?.data?.message || '';
                if (msg.includes('already exists')) {
                    showToast('warning', 'Duplicate title', 'Name of challenge exist. Change it.');
                } else {
                    showToast('warning', 'Validation error', msg || 'Check entered data.');
                }
            } else if (err !== "TypeError: onSuccess is not a function") {
                showToast('error', 'Save failed', 'Can\'t save channges.');
            }
            //? showToast('error', '[DEBUG]', `${err}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full pl-1 space-y-4">
            {/* Назва */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <label className="block text-md font-medium mb-1">Task title</label>
                    <Input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Two Sum"
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-md font-medium mb-1">Points for task</label>
                    <Select className='nz-bg-input rounded-xl'
                        options={pointsOptions}
                        value={form.points}
                        onChange={handleSelectChange('points')}
                    />
                </div>
            </div>

            {/* Теги */}
            <div>
                <label className="block text-md font-medium mb-1">Tegs <span className='text-[12px] nz-text-muted'>(comma separated)</span></label>
                <Input
                    name="tegs"
                    value={form.tegs}
                    onChange={handleChange}
                    placeholder="array, hashmap, easy"
                />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-4'>
                    {/* Складність + Мова + Статус */}
                    <div className='space-y-5'>
                        <div>
                            <label className="block text-md font-medium mb-1">Difficult</label>
                            <Select className='nz-bg-input rounded-xl'
                                options={difficultyOptions}
                                value={form.difficul}
                                onChange={handleSelectChange('difficul')}
                            />
                        </div>

                        <div>
                            <label className="block text-md font-medium mb-1">Status</label>
                            <Select className='nz-bg-input rounded-xl'
                                options={statusOptions}
                                value={form.status}
                                onChange={handleSelectChange('status')}
                            />
                        </div>

                        <div>
                            <label className="block text-md font-medium mb-1">Language</label>
                            <Select className='nz-bg-input rounded-xl'
                                options={languageOptions}
                                value={form.language}
                                onChange={handleSelectChange('language')}
                            />
                        </div>

                        <div>
                            <label className="block text-md font-medium mb-1">Type of task</label>
                            <Select className='nz-bg-input rounded-xl'
                                options={typeOptions}
                                value={form.c_type}
                                onChange={handleSelectChange('c_type')}
                            />
                        </div>
                    </div>
                </div>

                {/* Опис */}
                <div>
                    <label className="block text-md font-medium mb-1">Description</label>
                    <Textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={10}
                        placeholder="Write function, which be ..."
                        className="w-full"
                    />
                </div>
            </div>

            {/* Приклад Input / Output */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <label className="block text-md font-medium mb-1">Example Input</label>
                    <Textarea
                        name="e_input"
                        value={form.e_input}
                        onChange={handleChange}
                        rows={3}
                        placeholder="nums = [2,7,11,15], target = 9"
                    />
                    <span className='block text-[12px] text-right nz-text-muted'>*not required</span>
                </div>
                <div>
                    <label className="block text-md font-medium mb-1">Example Output</label>
                    <Textarea
                        name="e_output"
                        value={form.e_output}
                        onChange={handleChange}
                        rows={3}
                        placeholder="[0,1]"
                    />
                    <span className='block text-[12px] text-right nz-text-muted'>*not required</span>
                </div>
            </div>

            {/* Код */}
            <div>
                <label className="block text-md font-medium mb-1">Begining code <span className='text-[12px] nz-text-muted'>(not required)</span></label>
                <div className="rounded-xl overflow-hidden h-[250px] border-2 nz-border">
                    <CodeEditor
                        value={form.code}
                        onChange={(newCode) => setForm(prev => ({ ...prev, code: newCode }))}
                    />
                </div>
            </div>

            {/* Кнопки */}
            <div className="flex justify-between pt-6 border-t border-border">
                {isEditMode && onDelete && (
                    <Button className='relative'
                        type="button"
                        variant="btn_destructive"
                        onDoubleClick={onDelete}
                        disabled={loading}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Task
                        <span className='absolute -bottom-1 font-bold right-2 text-[8px]'>Double click</span>
                    </Button>
                )}

                <div className="flex gap-3">
                    <Button type="button" variant="btn_secondary" onClick={closeModal} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant={isEditMode ? "btn_warning" : "btn_success"} disabled={loading}>
                        {loading ? <LoadingSpinner text="Saving..." /> : isEditMode ? 'Save Changes' : 'Create Task'}
                    </Button>
                </div>
            </div>
        </form>
    );
}