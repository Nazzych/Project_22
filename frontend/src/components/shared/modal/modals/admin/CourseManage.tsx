import React, { useState } from 'react';
import {
    BookOpen, Tag, Clock, Users, Save, Trash2, Target
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { Select } from '../../../../ui/Select';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { useToast } from '../../../../../providers/MessageProvider';
import { useModal } from '../../../../../hooks/useModal';
import { getCsrfToken } from '../../../../../api/auth';
import { CourseManageProps } from "../../../../../types/curses"
import { createCourse, updateCourse } from '../../../../../api/admin';
import { motion } from 'framer-motion';

const levelOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
];

const categoryOptions = [
    { value: 'programming', label: 'Programming' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'algorithms', label: 'Algorithms & Data Structures' },
    { value: 'devops', label: 'DevOps & Infrastructure' },
    { value: 'other', label: 'Other' },
];

export function CourseManage({ onSuccess, onDelete, course }: CourseManageProps) {
    const { showToast } = useToast();
    const { closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: course?.title || "",
        description: course?.description || "",
        category: course?.category || "",
        level: course?.level || "easy",
        points: course?.points || 0,
        tegs: course?.tegs || "",
        image: course?.image || "",
        created_at: course?.created_at || ""
    });

    const isEditMode = !!course;

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

        try {
            await getCsrfToken();

            if (course) {
                await updateCourse(course.id, form);
                showToast('success', 'Course updated', 'Course successfuly updated');
            } else {
                await createCourse (form);
                showToast('success', 'Course created', 'Course successfuly created');
            }

            onSuccess();
            closeModal();
        } catch (err: any) {
            console.error(err);
            showToast('error', 'Save failed', 'Can\'n save course. Try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6 px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-md font-medium mb-1.5">Course name</label>
                    <div className="space-y-1">
                        <Input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Python from beginners"
                        />
                        <p className='text-[12px] nz-text-muted text-right'>*required field</p>
                    </div>
                </div>
                <div>
                    <label className="block text-md font-medium mb-1.5">Cost Point <span className='text-[12px]'>(0 p-s - free)</span></label>
                    <Input
                        name="points"
                        value={form.points}
                        onChange={handleChange}
                        placeholder="0 (free) or 1000"
                    />
                </div>
                <div>
                    <label className="block text-md font-medium mb-1.5">Category</label>
                    <Select
                        options={categoryOptions}
                        value={form.category}
                        onChange={handleSelectChange('category')}
                        className="nz-bg-input rounded-xl"
                    />
                </div>
                <div>
                    <label className="block text-md font-medium mb-1.5">Level</label>
                    <Select
                        options={levelOptions}
                        value={form.level}
                        onChange={handleSelectChange('level')}
                        className="nz-bg-input rounded-xl"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-md font-medium mb-1.5">Description</label>
                    <div className="space-y-1">
                        <Textarea rows={5}
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Learn easy writing Python code ..."
                        />
                        <p className='text-[12px] nz-text-muted text-right'>*required field</p>
                    </div>
                </div>
                <div>
                    <label className="block text-md font-medium mb-1.5">Tegs <span className='text-[12px]'>(comma separated)</span></label>
                    <Input
                        name="tegs"
                        value={form.tegs}
                        onChange={handleChange}
                        placeholder="python, programming, backend, beginners"
                    />
                </div>
                <div>
                    <label className="block text-md font-medium mb-1.5">Image for Course</label>
                    <Input
                        name="image"
                        value={form.image}
                        onChange={handleChange}
                        placeholder="https://images.com/image_png.png/"
                    />
                </div>
            </div>
            <div className="flex justify-between pt-6 border-t border-border">
                {isEditMode && onDelete && (
                    <Button
                        type="button"
                        variant="btn_destructive"
                        onDoubleClick={onDelete}
                        disabled={loading}
                        className="relative"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete course
                        <span className="absolute -bottom-1 text-[8px] font-bold">Double click</span>
                    </Button>
                )}

                <div className="flex gap-3">
                    <Button 
                        type="button" 
                        variant="btn_secondary" 
                        onClick={closeModal} 
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant={isEditMode ? "btn_warning" : "btn_success"} 
                        disabled={loading}
                    >
                        {loading ? <LoadingSpinner text="Saving..." /> : 
                            isEditMode ? 'Save changes' : 'Create course'}
                    </Button>
                </div>
            </div>
        </form>
    );
}