import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Skeleton } from '../components/LoadingSpinner';
import { PostManage } from '../components/shared/modal/modals/forum/PostManage'
import { ChannelManage } from '../components/shared/modal/modals/forum/ChannelManager'
import { ChannelsSection } from '../components/shared/cards/ChannelCard'
import { PostCard } from '../components/shared/cards/PostCard'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../providers/MessageProvider'
import { Posts, Channels } from '../types/forum'
import { useModal } from '../hooks/useModal';
import { useProfile } from '../contexts/ProfileContext'
import { getCsrfToken } from '../api/auth'
import { deletePost, deleteChannel } from '../api/forum'
import { ConfirmModal } from '../components/shared/modal/ConfirmModal'
import axios from 'axios';
import {
    XCircle,
    MessageSquareCode,
    Search,
    Plus,
    TrendingUp,
    Clock,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    MessageCirclePlus,
    MessageCircleMore,
    Hash
} from 'lucide-react'
import { forumList, channelList } from '../api/forum'

export function ITForum() {
    const { showToast } = useToast();
    const { profile } = useProfile();
    const navigate = useNavigate()
    const { openModal, closeModal } = useModal();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingChannels, setLoadingChannels] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [posts, setPosts] = useState<Posts[]>([]);
    const [channels, setChannels] = useState<Channels[]>([]);
    const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});

    function toggleExpand(id: number) {
        setExpandedPosts(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    }

    // Завантаження постів.
    const loadPoasts = async () => {
        setLoadingPosts(true);
        try {
            const data = await forumList();
            setPosts(data);
        } catch (err) {
            showToast('error', 'Get posts failed', `${err}`);
        } finally {
            setLoadingPosts(false);
        }
    };

    // Завантаження постів.
    const loadChannels = async () => {
        setLoadingChannels(true);
        try {
            const data = await channelList();
            setChannels(data);
        } catch (err) {
            showToast('error', 'Get channels failed', `${err}`);
        } finally {
            setLoadingChannels(false);
        }
    };


    useEffect(() => {
        loadPoasts();
        loadChannels();
    }, []);


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

    const handleDeletePost = async (post_id: number) => {
        try {
            if (post_id) {
                await deletePost (post_id);
                loadPoasts();
                showToast('success', 'Post deleted', 'Your post has been successfully deleted.');
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

    const OpenAddPost = () => {
        openModal({
            id: 'forum-post',
            width: "lg",
            title: (
                <span className="flex items-center gap-2">
                    <div className="w-fit nz-background-accent rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                        <MessageCirclePlus className="w-5 h-5" />
                        <span className="nz-foreground">Create post</span>
                    </div>
                </span>
            ),
            content: (
                <PostManage 
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
                        <MessageCirclePlus className="w-5 h-5" />
                        <span className="w-[95%] nz-foreground line-clamp-1">Edit post - "{post.title}"</span>
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


    const OpenAddChannel = () => {
        openModal({
            id: 'forum-channell',
            width: "lg",
            title: (
                <span className="flex items-center gap-2">
                    <div className="w-fit nz-background-accent rounded-lg py-1 px-4 flex flex-row justify-center items-center gap-2">
                        <MessageCirclePlus className="w-5 h-5" />
                        <span className="nz-foreground">Create channel</span>
                    </div>
                </span>
            ),
            content: (
                <ChannelManage
                    onSuccess={() => {loadChannels()}}
                    onDelete={() => closeModal()}
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
                        <MessageCirclePlus className="w-5 h-5" />
                        <span className="nz-foreground">Edit channel</span>
                    </div>
                </span>
            ),
            content: (
                <ChannelManage
                    channel={channel}
                    onSuccess={() => {loadChannels()}}
                    onDelete={() => {clickDeleteChannel(channel.id)}}
                />
            ),
        });
    }

    const handleDeleteChannel = async (channel_id: number) => {
        try {
            if (channel_id) {
                await getCsrfToken()
                await deleteChannel (channel_id);
                loadChannels();
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


    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {!selectedCategory ? (
                    <motion.div
                        key="categories"
                        initial={{
                            opacity: 0,
                            x: -20,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        exit={{
                            opacity: 0,
                            x: -20,
                        }}
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold nz-foreground flex items-center gap-3">
                                    <MessageSquareCode className="h-8 w-8" />
                                    IT Forum
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Discuss, learn, and share knowledge with the community
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card size='wf' className="glass relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 gradient-radial-green opacity-30 pointer-events-none" />
                                <CardContent className="p-4 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Posts
                                            </p>
                                            <p className="text-2xl font-bold text-cyan-400">
                                                {posts.length} {/* 10 000 */}
                                            </p>
                                        </div>
                                        <MessageCircleMore className="h-8 w-8 text-cyan-400" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card size='wf' className="glass relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-2xl" />
                                <CardContent className="p-4 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Active Today
                                            </p>
                                            <p className="text-2xl font-bold text-secondary">
                                                {Math.floor(Math.random() * 50 + 20)}
                                            </p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-secondary" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card size='wf' className="glass relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-2xl" />
                                <CardContent className="p-4 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                New This Week
                                            </p>
                                            <p className="text-2xl font-bold text-orange-400">
                                                {Math.floor(Math.random() * 30 + 10)}
                                            </p>
                                        </div>
                                        <Clock className="h-8 w-8 text-orange-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Categories */}
                        <div>
                            <div className='flex items-center flex-wrap justify-between gap-4 mb-4'>
                                <div className='flex items-center flex-wrap gap-4'>
                                    <h2 className="flex items-center text-2xl font-bold text-white gap-1">
                                        <Hash className="w-5 h-5" />
                                        Categories
                                    </h2>
                                    {channels.length > 4 && (
                                        <button
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className="flex items-center gap-1.5 text-sm nz-text-muted hover:text-white transition-colors"
                                        >
                                            {isExpanded ? (
                                                <>Show less <ChevronUp className="w-4 h-4" /></>
                                            ) : (
                                                <>Show all ({channels.length}) <ChevronDown className="w-4 h-4" /></>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <Button variant="btn_secondary"
                                    onClick={() => OpenAddChannel()}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Channel
                                </Button>
                            </div>
                            {loadingChannels ? (
                                <div className="p-6">
                                    {/* Список проектів */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i}>
                                                <Skeleton className="h-52 lg:h-72 w-full rounded-[18px]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                channels.length !== 0 ? (
                                    <ChannelsSection 
                                        channels={channels}
                                        isExpanded={isExpanded}
                                        OpenEditChannel={OpenEditChannel}
                                        handleDeleteChannel={clickDeleteChannel}
                                        //? title="Популярні канали" 
                                    />
                                ) : (
                                    <div className="flex flex-row items-center justify-center py-6 text-center nz-foreground gap-2">
                                        <XCircle className="w-6 h-6 text-muted-foreground" />
                                        <p className="text-sm font-medium">No channels found</p>
                                    </div>
                                )
                            )}
                        </div>
{/* <div className="flex items-center w-full">
    <hr className="flex-grow border-white" />
    <span className="mx-4 text-sm font-medium nz-text-muted whitespace-nowrap">
        Important inputs
    </span>
    <hr className="flex-grow border-white" />
</div> */}
                        {/* Recent Posts */}
                        <div>
                            <div className='flex items-center flex-wrap justify-between gap-4 mb-4'>
                                <h2 className="flex items-center text-2xl font-bold text-white gap-1">
                                    <MessageCircleMore className="w-5 h-5" />
                                    Recent Discussions
                                </h2>
                                <Button variant="btn_secondary"
                                    onClick={OpenAddPost}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Post
                                </Button>
                            </div>
                            {/* loadingPosts|loadingChannels */}
                            {loadingPosts ? (
                                <div className="p-6">
                                    {/* Список проектів */}
                                    <div className="flex gap-4">
                                        <div className='lg:w-[75%]'>
                                            <Skeleton className="h-80 w-full rounded-[18px]" />
                                        </div>
                                        <Skeleton className="h-80 w-full lg:w-[25%] rounded-[18px]" />
                                    </div>
                                </div>
                            ) : (
                                posts.length !== 0 ? (
                                    posts.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            logo={post.author.profile.avatar_url}
                                            name={`${post.author.first_name} ${post.author.last_name}`}
                                            post={post}
                                            expandedPosts={expandedPosts}
                                            toggleExpand={toggleExpand}
                                            OpenEditPost={OpenEditPost}
                                            clickDeletePost={clickDeletePost}
                                            profile={profile}
                                        />
                                    ))
                                ) : (
                                    <div className="flex flex-row items-center justify-center py-6 text-center nz-foreground gap-2">
                                        <XCircle className="w-6 h-6 text-muted-foreground" />
                                        <p className="text-sm font-medium">No posts found</p>
                                    </div>
                                )
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="category-posts"
                        initial={{
                            opacity: 0,
                            x: 20,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        exit={{
                            opacity: 0,
                            x: 20,
                        }}
                        className="space-y-6"
                    >
                        {/* Back Button */}
                        <Button
                            variant="btn_glass"
                            size="sm"
                            onClick={() => setSelectedCategory(null)}
                            className="glass"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Categories
                        </Button>

                        {/* Category Header */}
                        <Card className="glass-strong relative overflow-hidden">
                            <div
                                className={`absolute inset-0 bg-gradient-to-br opacity-10`}
                            />
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="text-5xl">Icon</div>
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold gradient-text mb-2">
                                            Some 1 {/* {selectedCategoryData?.name} */}
                                        </h1>
                                        <p className="text-foreground/70">
                                            Some 2 {/* {selectedCategoryData?.description} */}
                                        </p>
                                    </div>
                                    <Button onClick={() => navigate('/forum/create')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Post
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Search */}
                        <div className="glass p-4 rounded-2xl">
                            <Input
                                placeholder="Search posts..."
                                icon={<Search className="h-4 w-4" />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Posts List */}
                        {/* <div className="space-y-3">
                            {filteredPosts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    title={post.title}
                                    author={post.author}
                                    avatar={post.avatar}
                                    date={post.date}
                                    views={post.views}
                                    likes={post.likes}
                                    commentCount={post.comments.length}
                                    category={post.category}
                                    onClick={() => navigate(`/forum/post/${post.id}`)}
                                />
                            ))}
                        </div> */}

                        {/* {filteredPosts.length === 0 && (
                            <div className="text-center py-20">
                                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold gradient-text">
                                    No posts found
                                </h3>
                                <p className="text-muted-foreground mt-2">
                                    Be the first to start a discussion!
                                </p>
                            </div>
                        )} */}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
