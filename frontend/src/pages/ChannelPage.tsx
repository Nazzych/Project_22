import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, ChevronDown, ChevronUp, SendHorizonal, MessageCirclePlusIcon, MessageSquare, Pen, Heart, Repeat, MessageCircleMore, Share2, VolumeOff, XCircle, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { cn } from '../lib/cn';

import { PostManage } from '../components/shared/modal/modals/forum/PostManage'
import { ChannelManage } from '../components/shared/modal/modals/forum/ChannelManager';
import { ConfirmModal } from '../components/shared/modal/ConfirmModal'
import { ActionsCellInChannel } from '../components/ActionCell';
import { PostCard } from '../components/shared/cards/PostCard';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { formatDateNumeric } from '../lib/formatDate';
import { getChannel, getChannelPosts, deletePost, deleteChannel } from '../api/forum';
import { getCsrfToken } from '../api/auth';
import { Channels, Posts } from '../types/forum';
import { useToast } from '../providers/MessageProvider';
import { useModal } from '../hooks/useModal';
import { useProfile } from '../contexts/ProfileContext';
import { Tooltip } from '../components/Tooltip';


export function ChannelPage () {
    const { channelId } = useParams<{ channelId: string }>();
    const { showToast } = useToast();
    const { openModal, closeModal } = useModal();
    const { profile } = useProfile();

    const [channel, setChannel] = useState<Channels | null>(null);
    const [posts, setPosts] = useState<Posts[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showLogoModal, setShowLogoModal] = useState(false);
    //TODO: const [subscribed, setSubscribed] = useState(false);
    const toggleExpande = () => setIsExpanded(!isExpanded);

    const fetchChannelData = async () => {
        if (!channelId) return;
        try {
            setLoading(true);
            const dataChannel = await getChannel(Number(channelId));
            setChannel(dataChannel);
            await loadPoasts();
        } catch (error) {
            console.error("Error fetching channel:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadPoasts = async () => {
        if (!channelId) return;
        try {
            const dataPosts = await getChannelPosts(Number(channelId));
            setPosts(dataPosts);
        } catch (error) {
            console.error("Error fetching channel posts:", error);
        }
    };

    useEffect(() => {
        fetchChannelData();
    }, [channelId]);

    const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});
    function toggleExpand(id: number) {
        setExpandedPosts(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    }

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const clickDeletePost = async (post_id: number) => {
        openModal({
            id: 'confirm-delete-post',
            width: "md",
            content: (
                <ConfirmModal
                    message= {
                        <div className="flex items-center gap-2 relative">
                            <div className="nz-background-secondary absolute left-1 top-0 h-full w-1.5 rounded-full"></div>
                            <p className="text-sm pl-4">You really want to delete this post? This action cannot be undone.</p>
                        </div>
                    }
                    onConfirm={() => {handleDeletePost(post_id); closeModal()}}
                    onCancel={closeModal}
                    confirmText="Yes, delete"
                    cancelText="Cancel"
                />
            ),
        });
    }

    const OpenEditChannel = (channel: Channels) => {
        openModal({
            id: 'forum-channell',
            width: "lg",
            x: false,
            title: (
                <span className="flex items-center gap-2">
                    <div className="w-fit nz-background-accent rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                        <MessageCirclePlusIcon className="w-5 h-5" />
                        <span className="nz-foreground">Edit channel</span>
                    </div>
                </span>
            ),
            content: (
                <ChannelManage
                    channel={channel}
                    onSuccess={() => {fetchChannelData()}}
                    onDelete={() => {clickDeleteChannel(channel.id)}}
                />
            ),
        });
    }

    const handleDeleteChannel = async (channel_id: number) => {
        try {
            if (channel_id) {
                await getCsrfToken();
                await deleteChannel (channel_id);
                document.location.href = '/forum';
                showToast('success', 'Channel deleted', 'Your channel has been successfully deleted.');
            }
        } catch (err) {
            console.error('Error deleting channel:', err);
            if (axios.isAxiosError(err) && err.response?.data) {
                const { type, message } = err.response.data;
                showToast(type || 'error', 'Deleting failed', message || 'Unknown error');
            } else {
                showToast('error', 'Deleting failed', 'Something went wrong while deleting your channel.');
            }
        }
    }

    const clickDeleteChannel = async (channel_id: number) => {
        openModal({
            id: 'confirm-delete-channel',
            width: "md",
            content: (
                <ConfirmModal
                    message= {
                        <div className="flex items-center gap-2 relative">
                            <div className="nz-background-secondary absolute left-1 top-0 h-full w-1.5 rounded-full"></div>
                            <p className="text-sm pl-4">You really want to delete your channel? This action cannot be undone.</p>
                        </div>
                    }
                    onConfirm={() => {handleDeleteChannel(channel_id); closeModal()}}
                    onCancel={closeModal}
                    confirmText="Yes, delete"
                    cancelText="Cancel"
                />
            ),
        });
    }

    const handleDeletePost = async (post_id: number) => {
        try {
            if (post_id) {
                await getCsrfToken();
                await deletePost (post_id);
                showToast('success', 'Post deleted', 'Your post has been successfully deleted.');
                loadPoasts();
            }
        } catch (err) {
            console.error('Error deleting post:', err);
            if (axios.isAxiosError(err) && err.response?.data) {
                const { type, message } = err.response.data;
                showToast(type || 'error', 'Deleting failed', message || 'Unknown error');
            } else {
                showToast('error', 'Deleting failed', 'Something went wrong while deleting your post.');
            }
        }
    }

    const OpenAddPost = (content: string) => {
        openModal({
            id: 'channel-post',
            width: "lg",
            title: (
                <span className="flex items-center gap-2">
                    <div className="w-[92.5%] nz-background-accent rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                        <MessageCirclePlusIcon className="w-5 h-5" />
                        <span className="nz-foreground line-clamp-1">Add post in "{channel?.name}"</span>
                    </div>
                </span>
            ),
            content: (
                <PostManage
                    content={content}
                    channel={channel?.id}
                    onSuccess={() => {loadPoasts()}}
                    onDelete={() => closeModal()}
                />
            ),
        });
    }

    const OpenEditPost = (post: Posts) => {
        openModal({
            id: 'forum-post',
            width: "lg",
            x: false,
            title: (
                <span className="flex items-center gap-2">
                    <div className="w-fit nz-background-accent rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                        <MessageCirclePlusIcon className="w-4 h-4" />
                        <span className="nz-foreground line-clamp-1">Edit post - "{post.title}"</span>
                    </div>
                </span>
            ),
            content: (
                <PostManage 
                    post={post}
                    onSuccess={() => {loadPoasts()}}
                    onDelete={() => {clickDeletePost (post.id)}}
                />
            ),
        });
    }

    const handleSend = async () => {
        const content = textareaRef.current?.value.trim();
        if (!content) return showToast('info', 'Content is empty', 'Please enter some content for your post before sending.');

        try {
            OpenAddPost(content);
            if (textareaRef.current) {
                textareaRef.current.value = '';
            }
            textareaRef.current?.focus();
        } catch (error) {
            console.error("Failed to send post:", error);
        }
    };

    if (loading) return <div className="text-center py-20">Завантаження каналу...</div>;
    if (!channel) return <div className="text-center py-20 text-red-400">Канал не знайдено</div>;

    return (
        <div>
            {/* Шапка каналу */}
            {showLogoModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="relative text-center max-w-md w-full">
                        <div className="mx-auto mb-4 w-52 h-52 md:w-72 md:h-72 rounded-full overflow-hidden border-[10px] border-white/10 shadow-2xl">
                            {channel.logo ? (
                                <img 
                                    src={channel.logo} 
                                    alt={channel.name} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-8xl font-bold bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                                    {channel.name[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="hidden lg:block nz-background-accent p-1 space-y-2 rounded-xl">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight line-clamp-2">
                                {channel.name}
                            </h2>
                            <p className="text-xl line-clamp-1">
                                <span className="font-semibold text-zinc-400">Owner:</span> @{channel.owner?.username}
                            </p>
                            <div className="flex items-center justify-center gap-2 text-lg line-clamp-1">
                                <span className="font-semibold text-zinc-400">Followers:</span>
                                <Users className="w-6 h-6" />
                                <span>{channel.subscribers?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </div>
                    {channel.owner.is_staff && (
                        <div className="absolute top-16 right-5">
                            <Tooltip text="Verified Channel">
                                <span className="p-2 flex items-center justify-center nz-background-accent rounded-full" onClick={(e) => e.stopPropagation()}>
                                    <BadgeCheck className="w-6 h-6" />
                                </span>
                            </Tooltip>
                        </div>
                    )}
                    <button 
                        onClick={() => setShowLogoModal(false)} 
                        className="absolute top-6 right-6 text-white text-xl hover:text-zinc-300"
                    >
                        <XCircle className="w-8 h-8" />
                    </button>
                </div>
            )}
            <div className="relative rounded-3xl overflow-hidden border border-border mb-8">
                {/* Банер — розтягується на весь фон */}
                {channel.banner && (
                    <div className="absolute inset-0">
                        <img 
                            src={channel.banner} 
                            alt="banner" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                )}

                {/* Градієнтна накладка */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/75" />

                <div className="relative p-6 pt-14 h-full flex flex-col">
                    <div className="flex flex-wrap items-start gap-5 flex-1">
                        {/* Аватар */}
                        <div onClick={() => setShowLogoModal(true)} className="w-24 h-24 rounded-2xl bg-zinc-800 border-4 border-zinc-900 overflow-hidden flex-shrink-0 cursor-pointer">
                            {channel.logo ? (
                                <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl font-bold bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                                    {channel.name[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Назва + кнопка */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h1 className={`font-bold text-white leading-tight transition-all duration-300 ${
                                    isExpanded ? 'text-3xl' : 'text-3xl line-clamp-2'
                                }`}>
                                    {channel.name}
                                </h1>
                            </div>

                            <p className="flex items-center text-zinc-300 text-sm mt-1 gap-2">
                                <span className="hover:underline cursor-pointer">@{channel.owner?.username}</span> <span className={cn("flex items-center gap-2 " + (isExpanded ? "opacity-0" : "opacity-100"))}>• <Button size="sm" variant='btn_glass' className="flex items-center gap-2" disabled={isExpanded}><Users className="w-4 h-5" />Join us</Button></span>
                            </p>

                            {/* Розгорнутий опис */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.45 }}
                                        className="mt-6 overflow-hidden"
                                    >
                                        <span className="text-xs nz-text-m block">Description</span>
                                        <pre className="text-zinc-200 leading-relaxed font-medium">
                                            {channel.description || "No description available."}
                                        </pre>
                                        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm nz-text-muted">
                                            <div>
                                                <span className="text-xs nz-text-m block">Created</span>
                                                <span className="font-medium text-white">
                                                    {formatDateNumeric(channel.created_at)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-xs nz-text-m block">Subscribers</span>
                                                <span className="font-medium text-white">
                                                    {channel.subscribers?.toLocaleString() || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex flex-wrap gap-x-2 gap-y-3 text-sm text-zinc-400">
                                            <Button size="sm" variant='btn_glass' className="flex items-center gap-2"><Users className="w-4 h-5" />Join</Button>
                                            <Button size="sm" variant='btn_glass' className="flex items-center gap-2"><Share2 className="w-4 h-5" />Share</Button>
                                            <Button size="sm" variant='btn_glass' className="flex items-center gap-2"><VolumeOff className="w-4 h-5" />Mute</Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                {channel.owner.is_staff && (
                    <div className="absolute top-4 left-28">
                        <Tooltip text="Verified Channel">
                            <span className="p-2 flex items-center justify-center nz-background-accent rounded-full" onClick={(e) => e.stopPropagation()}>
                                <BadgeCheck className="w-4 h-4" />
                            </span>
                        </Tooltip>
                    </div>
                )}
                <Link to="/forum">
                    <Button variant="btn_glass" size="sm" className="absolute top-4 left-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Forum
                    </Button>
                </Link>
                <Button 
                    variant="btn_glass" 
                    size="icon"
                    onClick={() => toggleExpande()}
                    className="absolute top-4 right-4"
                >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
                {profile?.id === channel.owner.id && (
                    <ActionsCellInChannel onEdit={() => OpenEditChannel(channel)} onDelete={() => {clickDeleteChannel (channel.id)}} onShare={() => {}} />
                )}
            </div>

            {/* Список постів */}
            <div className="pb-[3rem] lg:pb-[2.75rem]">
                <div className="flex items-center w-full mb-6">
                    <span className="mx-4 flex items-center flex-wrap text-2xl font-semibold whitespace-nowrap gap-2">
                        <MessageCircleMore className="w-5 h-5" />Posts in the channel
                    </span>
                    <hr className="flex-grow nz-border border-2 rounded" />
                </div>
                {posts && posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard
                            logo={channel.logo}
                            name={channel.name}
                            key={post.id}
                            post={post}
                            expandedPosts={expandedPosts}
                            toggleExpand={toggleExpand}
                            OpenEditPost={OpenEditPost}
                            clickDeletePost={clickDeletePost}
                            profile={profile}
                        />
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-16">
                        There are no posts in this channel yet.
                    </p>
                )}
            </div>
            {profile?.email === channel.owner.email && (
                <div className="absolute bottom-[0.5rem] left-100 p-2 flex items-center gap-2 border border-border w-[95vw] md:w-[67.5vw] lg:w-[50vw] nz-background-secondary rounded-t-3xl">
                    <Textarea rows={2} name="content"
                        placeholder="Write something in the channel..."
                        className="resize-none rounded-2xl"
                        onChange={(e) => {
                            textareaRef.current = e.target;
                        }}
                    />
                    <Button onClick={() => {handleSend()}} variant="btn_primary" size="sm" className="rounded-full">
                        <SendHorizonal className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}