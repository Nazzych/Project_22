import React, { useState, useEffect } from 'react';
import { MessageCirclePlus, XCircle } from 'lucide-react';
import { deletePost, forumList } from '../../../../api/forum';
import { useToast } from '../../../../providers/MessageProvider'
import { Posts } from '../../../../types/forum';
import { Skeleton } from '../../../../components/LoadingSpinner';
import { PostCard } from '../../../../components/shared/cards/PostCard';
import { useProfile } from '../../../../contexts/ProfileContext';
import { getCsrfToken } from '../../../../api/auth';
import { useModal } from '../../../../hooks/useModal';
import { ConfirmModal } from '../../../../components/shared/modal/ConfirmModal';
import { PostManage } from '../../../../components/shared/modal/modals/forum/PostManage';
import axios from '../../../../lib/config';

export default function AdminPostsList() {
    const { showToast } = useToast();
    const { profile } = useProfile();
    const [loadingPosts, setLoadingPosts] = useState(true);
    const { openModal, closeModal } = useModal();
    const [posts, setPosts] = useState<Posts[]>([]);
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

    useEffect(() => {
        loadPoasts();
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
                await getCsrfToken();
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
                    is_staff={true}
                />
            ),
        });
    }

    return (
        <div className="space-y-4">
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
    );
}