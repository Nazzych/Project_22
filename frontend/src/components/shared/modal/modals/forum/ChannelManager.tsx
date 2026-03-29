import React, { useState } from 'react'
import {
    FileText, File, MessageCircle, Tag, Github, Globe, ImagePlus, XIcon, Trash2
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { Select } from '../../../../ui/Select';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { useToast } from '../../../../../providers/MessageProvider';
import { useModal } from '../../../../../hooks/useModal';
import { getCsrfToken } from '../../../../../api/auth';
import { createChannel, updateChannel, deleteChannel } from '../../../../../api/forum';
import { ChannellFormProps, EditableChannell } from '../../../../../types/forum';
import { motion } from 'framer-motion';
import axios from 'axios';

export function ChannelManage({ onSuccess, onDelete, channel }: ChannellFormProps) {
    const { showToast } = useToast()
    const { closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<EditableChannell>({
        name: channel?.name || '',
        description: channel?.description || '',
        logo: channel?.logo || '',
        banner: channel?.banner || '',
        is_private: channel?.is_private || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!form.name?.trim() || !form.description?.trim()) {
            showToast('warning', 'Missing fields', 'Please fill in both name and description of the channel.');
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
            // Редагування проєкту
            if (channel) {
                await updateChannel(channel.id, form);
                showToast('success', 'Channel updated', 'Your channel has been successfully updated.');
            // Створення нового проєкту
            } else {
                await createChannel(formData);
                showToast('success', 'Channel created', 'Your channel has been successfully added.');
            }

            onSuccess();
            closeModal();
        } catch (err) {
            console.error('Error saving channel:', err);
            if (axios.isAxiosError(err) && err.response?.data) {
                const { type, message } = err.response.data;
                showToast(type || 'error', 'Save failed', message || 'Unknown error');
            } else {
                showToast('error', 'Save failed', 'Something went wrong while saving your channel.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6 px-2">
                <div>
                    <label className="block text-sm font-medium mb-1">Channel name</label>
                    <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Python Dev Ukraine"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description of channel</label>
                    <Textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Channel fot discution Python, libraries, projects and carier..."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Logo (URL)</label>
                        <Input
                        name="logo"
                        value={form.logo}
                        onChange={handleChange}
                        placeholder="https://example.com/logo.png"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Banner (URL)</label>
                        <Input
                        name="banner"
                        value={form.banner}
                        onChange={handleChange}
                        placeholder="https://example.com/banner.jpg"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="is_private"
                        name="is_private"
                        checked={form.is_private}
                        onChange={(e) => setForm(prev => ({ ...prev, is_private: e.target.checked }))}
                        className="w-5 h-5"
                    />
                    <label htmlFor="is_private" className="text-sm">
                        Private channel (enter by link)
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 overflow-y-hidden">
                {channel && (
                    <Button type="button" variant="btn_destructive" disabled={loading} className='relative flex' onDoubleClick={onDelete}>
                        <Trash2 className='w-4 h-4 mr-1' /> Delete
                        <span className='absolute -bottom-1 text-[8px]'>Double click</span>
                    </Button>
                )}
                <Button type="button" variant="btn_secondary" onClick={closeModal}>
                    Cancel
                </Button>
                <Button type="submit" variant={channel ? "btn_warning" : "btn_success"} disabled={loading}>
                    {loading ? <LoadingSpinner text='Loading ...' /> : channel ? "Update channel" : "Create channel"}
                </Button>
            </div>
        </form>
)}
