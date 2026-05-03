import React, { useState } from 'react'
import {
    FileText, File, MessageCircle, Tag, Github, Globe, ImagePlus, XIcon, Trash2, Info, Hash
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { useToast } from '../../../../../providers/MessageProvider';
import { useModal } from '../../../../../hooks/useModal';
import { getCsrfToken } from '../../../../../api/auth';
import { createPost, updatePost, deletePost, getPostDetail } from '../../../../../api/forum';
import { PostFormProps, EditablePost } from '../../../../../types/forum';
import { motion } from 'framer-motion';
import axios from 'axios';

export function PostManage({ onSuccess, onDelete, post, content, channel, channelName, is_staff = false }: PostFormProps) {
    const { showToast } = useToast()
    const { closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<EditablePost>({
        title: post?.title || '',
        content: post?.content || content || '',
        channel: post?.channel || channel || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!form.title?.trim() || !form.content?.trim()) {
            showToast('warning', 'Missing fields', 'Please fill in both title and content.');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            
            // Додати текстові поля
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value.toString() || "");
            });
            
            await getCsrfToken();
            // Редагування існуючого посту
            if (post) {
                await updatePost(post.id, form);
                showToast('success', 'Post updated', 'Your post has been successfully updated.');
            // Створення нового посту
            } else {
                await createPost(formData);
                showToast('success', 'Post created', 'Your post has been successfully added.');
            }

            onSuccess();
            closeModal();
        } catch (err) {
            console.error('Error saving post:', err);
            if (axios.isAxiosError(err) && err.response?.data) {
                const { type, message } = err.response.data;
                showToast(type || 'error', 'Save failed', message || 'Unknown error');
            } else {
                showToast('error', 'Save failed', 'Something went wrong while saving your post.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isEditMode = !!post;
    return (
        <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="space-y-6 px-2 overflow-y-hidden">
                <div className="space-y-2">
                    {channelName && (
                        <h1 className="flex items-center text-lg font-semibold italic gap-2 line-clamp-1"><Hash className="w-4 h-4" />{channelName}</h1>
                    )}
                    {(post && is_staff) && (
                        <div className="space-y-2 line-clamp-1 overflow-hidden">
                            <h1 className="flex items-center text-lg gap-2 line-clamp-1"><Info className="w-4 h-4" />Edit Post of -<span className="flex items-center nz-text-muted text-md font-semibold"><img src={post.author?.profile.avatar_url} alt={post.author?.username} className="w-8 h-8 rounded-full mr-2" /> @{post.author?.username}</span></h1>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium"><FileText className='w-4 h-4 mr-2'/>Create title for your post</label>
                    <div className='space-y-1'>
                        <Input
                            name="title"
                            value={form.title || ''}
                            onChange={handleChange}
                            className="block w-full text-sm text-muted-foreground"
                            placeholder='My cool IT post.'
                        />
                        <p className='text-[12px] nz-text-muted text-right'>*required field</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium"><MessageCircle className="w-4 h-4 mr-2" />Content for your cool post 😉</label>
                    <div className='space-y-0'>
                        <Textarea
                            rows={8}
                            name="content"
                            value={form.content || ''}
                            onChange={handleChange}
                            placeholder="Today I will talk you about..."
                            />
                        <p className='text-[12px] nz-text-muted text-right'>*required field</p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    {post && (
                        <Button type="button" variant="btn_destructive" disabled={loading} className='relative flex' onDoubleClick={onDelete}>
                            <Trash2 className='w-4 h-4 mr-1' /> Delete
                            <span className='absolute -bottom-1 text-[8px]'>Double click</span>
                        </Button>
                    )}
                    <Button type="button" variant="btn_secondary" disabled={loading} onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button type="submit" variant={post ? "btn_warning" : "btn_success"} disabled={loading}>
                        {loading ? <LoadingSpinner text="Saving..." /> : isEditMode ? 'Edit Post' : 'Submit Post'}
                    </Button>
                </div>
            </div>
        </form>
)}
