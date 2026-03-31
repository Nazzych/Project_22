import React, { useState, useEffect } from 'react';
import { XCircle, BadgeCheck, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Channels } from '../../../../types/forum';
import { channelList, deleteChannel } from '../../../../api/forum';
import { useProfile } from '../../../../contexts/ProfileContext';
import { useToast } from '../../../../providers/MessageProvider';
import { useModal } from '../../../../hooks/useModal';
import { ChannelManage } from '../../../../components/shared/modal/modals/forum/ChannelManager';
import { getCsrfToken } from '../../../../api/auth';
import { ConfirmModal } from '../../../../components/shared/modal/ConfirmModal';
import { ActionsCellChannel } from '../../../../components/ActionCell';
import { Tooltip } from '../../../../components/Tooltip';

export default function AdminChannelsList() {
    const { showToast } = useToast();
    const { profile } = useProfile();
    const { openModal, closeModal } = useModal();

    const [channels, setChannels] = useState<Channels[]>([]);
    const [loadingChannels, setLoadingChannels] = useState(true);

    const loadChannels = async () => {
        setLoadingChannels(true);
        try {
            const data = await channelList();
            setChannels(data || []);
        } catch (err) {
            showToast('error', 'Get channels failed', `${err}`);
        } finally {
            setLoadingChannels(false);
        }
    };

    useEffect(() => {
        loadChannels();
    }, []);

    const OpenEditChannel = (channel: Channels) => {
        openModal({
            id: 'forum-channel-edit',
            width: "lg",
            title: "Edit Channel",
            content: (
                <ChannelManage
                    channel={channel}
                    onSuccess={loadChannels}
                    onDelete={() => clickDeleteChannel(channel.id)}
                />
            ),
        });
    };

    const handleDeleteChannel = async (channel_id: number) => {
        try {
            await getCsrfToken();
            await deleteChannel(channel_id);
            loadChannels();
            showToast('success', 'Channel deleted', 'Channel has been successfully deleted.');
        } catch (err: any) {
            console.error('Error deleting channel:', err);
            showToast('error', 'Deleting failed', err?.response?.data?.message || 'Something went wrong');
        }
    };

    const clickDeleteChannel = (channel_id: number) => {
        openModal({
            id: 'confirm-delete-channel',
            width: "md",
            content: (
                <ConfirmModal
                    message={
                        <div className="flex items-center gap-2 relative">
                            <div className="nz-background-secondary absolute left-1 top-0 h-full w-1.5 rounded-full"></div>
                            <p className="text-sm pl-4">
                                You are about to "DELETE THIS CHANNEL". This action cannot be undone.
                            </p>
                        </div>
                    }
                    onConfirm={() => {
                        handleDeleteChannel(channel_id);
                        closeModal();
                    }}
                    onCancel={closeModal}
                    confirmText="Yes, delete"
                    cancelText="Cancel"
                />
            ),
        });
    };

    return (
        <div className="space-y-4">
            {loadingChannels ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-52 bg-zinc-800 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : channels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence>
                        {channels.map((channel, index) => (
                            <motion.div
                                key={channel.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                className="relative nz-background-secondary border border-border rounded-3xl p-5 hover:nz-background-primary transition-all flex flex-col cursor-pointer"
                                onClick={() => window.location.href = `/forum/channel/${channel.id}/${channel.name.replace(/\s+/g, '-').toLowerCase()}`}
                            >
                                {/* Аватар */}
                                <div className="w-16 lg:w-28 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl font-bold text-white overflow-hidden mb-3">
                                    {channel.logo ? (
                                        <img
                                            src={channel.logo}
                                            alt={channel.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        channel.name.slice(0, 2).toUpperCase()
                                    )}
                                </div>

                                {/* Verified badge */}
                                {channel.owner.is_staff && (
                                    <div className="absolute top-2 right-1 md:top-3 md:right-2">
                                        <Tooltip text="Verified Channel">
                                            <span className="p-2 flex items-center justify-center nz-background-accent rounded-full" onClick={(e) => e.stopPropagation()}>
                                                <BadgeCheck className="w-4 h-4" />
                                            </span>
                                        </Tooltip>
                                    </div>
                                )}

                                {/* Назва */}
                                <h3 className="font-medium nz-foreground line-clamp-2 text-[15px] leading-tight mb-3 group-hover:text-primary transition-colors">
                                    {channel.name}
                                </h3>

                                {/* Підписники */}
                                <div className="mt-auto flex items-center gap-1.5 text-xs nz-text-muted">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{channel.subscribers.toLocaleString() || 0} subscribers</span>
                                </div>
                                
                                <div className="absolute top-2 right-10">
                                    {profile?.id === channel.owner?.id && (
                                        <ActionsCellChannel onEdit={() => {OpenEditChannel(channel)}} onDelete={() => {clickDeleteChannel(channel.id)}} onShare={() => {}} />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <XCircle className="w-12 h-12 mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">No channels found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        You haven't created any channels yet
                    </p>
                </div>
            )}
        </div>
    );
}