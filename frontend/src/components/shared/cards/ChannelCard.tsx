import React, { useState } from 'react';
import { Users, BadgeCheck, Share2, Edit, Trash2} from 'lucide-react';
import { useProfile } from '../../../contexts/ProfileContext'
import { useShare } from '../../../providers/ShareProvider';
import { Channels } from '../../../types/forum';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionsCell } from '../../ActionCell';
import { ImageFallback } from '../../Image';
import { Tooltip } from '../../Tooltip';
import { cn } from '../../../lib/cn';

interface ChannelsSectionProps {
    isExpanded: any;
    channels: Channels[];
    OpenEditChannel: (channel: Channels) => void;
    handleDeleteChannel: (id: number) => void;
    title?: string;
}

export function ChannelsSection({
    channels,
    isExpanded,
    OpenEditChannel,
    handleDeleteChannel
}: ChannelsSectionProps) {
    const { profile } = useProfile();
    const { copyShareLink } = useShare();

    const handleShare = (channel: any) => {
        copyShareLink('channel', channel.id, channel.slug, channel.name);
    };

    return (
        <div className="relative">
            <div
                className={cn(
                    "flex gap-4 overflow-x-auto py-2 pl-2 snap-x snap-mandatory scrollbar-hide transition-all duration-300",
                    isExpanded && "flex-wrap max-h-[350px] lg:max-h-[520px] border-y"   // 4 рядки при розгортанні
                )}
            >
                <AnimatePresence>
                    {channels.map((channel, index) => (
                        <motion.div
                            key={channel.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25, delay: index * 0.015 }}
                            className="flex-shrink-0 w-[200px] lg:w-[280px] snap-start cursor-pointer"
                            onClick={() => window.location.href = `/forum/channel/${channel.id}/${channel.name.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                            <div className="nz-background-secondary border border-border rounded-3xl p-4 hover:nz-background-primary transition-all duration-200 h-full flex flex-col">
                                <div className="flex flex-wrap justify-between items-start gap-1">
                                    {/* Аватар */}
                                    <div className="w-16 lg:w-28 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl font-bold text-white overflow-hidden mb-3">
                                        <ImageFallback
                                            src={channel.logo}
                                            alt={channel.name}
                                            title={channel.name.slice(0, 2).toUpperCase()}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {channel.owner.is_staff && (
                                            <div>
                                                <Tooltip text="Verified Channel">
                                                    <span className="p-2 flex items-center justify-center nz-background-accent rounded-full" onClick={(e) => e.stopPropagation()}>
                                                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                                                    </span>
                                                </Tooltip>
                                            </div>
                                        )}
                                        {profile?.id === channel.owner?.id && (
                                            <ActionsCell
                                                actions={[
                                                    { label: "Edit", icon: <Edit className="w-4 h-4" />, onClick: () => OpenEditChannel(channel), variant: 'edit' },
                                                    { label: "Delete", icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDeleteChannel(channel.id), variant: 'danger' },
                                                    { label: "Share", icon: <Share2 className="w-4 h-4" />, onClick: () => handleShare(channel), variant: 'share' },
                                                ]}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {/* Назва */}
                                    <h3 className="font-medium nz-foreground line-clamp-2 text-[15px] leading-tight mb-3 group-hover:text-primary transition-colors">
                                        {channel.name}
                                    </h3>

                                    {/* Підписники */}
                                    <div className="mt-auto flex items-center gap-1.5 text-xs nz-text-muted">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{channel.subscribers.toLocaleString() || 0} subscribers</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}