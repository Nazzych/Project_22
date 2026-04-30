import React, { useState, useRef } from 'react';
import { MessageSquare, Heart, Repeat, Pen, ChevronDown, ChevronUp, BadgeCheck, MoreVertical } from 'lucide-react';
import { formatDateNumeric, formatRelativeTime } from '../../../lib/formatDate';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionsCellForum, ActionsCellInComment } from '../../ActionCell';
import { PostCardProps, Comment } from '../../../types/forum';
import { getPostComments, createComment, updateComment, deleteComment } from '../../../api/forum';
import { getCsrfToken } from '../../../api/auth'
import { useToast } from '../../../providers/MessageProvider'
import { useModal } from '../../../hooks/useModal';
import { ConfirmModal } from '../../../components/shared/modal/ConfirmModal'
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Tooltip } from '../../Tooltip';

export function PostCard({
    logo,
    name,
    post,
    expandedPosts,
    toggleExpand,
    OpenEditPost,
    clickDeletePost,
    profile,
}: PostCardProps) {
    const { showToast } = useToast();
    const { openModal, closeModal } = useModal();
    const commentRef = useRef<HTMLInputElement>(null);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);

    const handleToggleComments = async (post_id: number) => {
        if (!showComments) {
            try {
                await getCsrfToken();
                const fetchedComments = await getPostComments(post_id);
                setComments(fetchedComments);
                //? showToast('info', 'Comments', 'Comments loaded successfully.');
            } catch (error) {
                console.error('Error fetching comments:', error);
                showToast('error', 'Error fetching comments', 'Failed to load comments. Please try again later.');
            }
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (post_id: number, content: string) => {
        try {
            await getCsrfToken();
            await createComment('post', post_id, content);
            showToast('success', 'Comment added', 'Your comment has been added successfully.');
            handleToggleComments(post_id);
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast('error', 'Error adding comment', 'Failed to add comment. Please try again later.');
        }
    };

    const handleEditComment = async (comment_id: number, content: string) => {
        try {
            await updateComment(comment_id, content);
            showToast('success', 'Comment updated', 'Your comment has been updated successfully.');
            handleToggleComments(post.id);
        } catch (error) {
            console.error('Error updating comment:', error);
            showToast('error', 'Error updating comment', 'Failed to update comment. Please try again later.');
        }
    };

    const clickConfirmDeleteComment = async (comment_id: number) => {
        openModal({
            id: 'confirm-delete-comment',
            width: "md",
            content: (
                <ConfirmModal
                    message= {
                        <div className="flex items-center gap-2 relative">
                            <div className="nz-background-secondary absolute left-1 top-0 h-full w-1.5 rounded-full"></div>
                            <p className="text-sm pl-4">You really want to delete this comment? This action cannot be undone.</p>
                        </div>
                    }
                    onConfirm={() => {handleDeleteComment(comment_id); closeModal()}}
                    onCancel={closeModal}
                    confirmText="Yes, delete"
                    cancelText="Cancel"
                />
            ),
        });
    }

    const handleDeleteComment = async (comment_id: number) => {
        try {
            await getCsrfToken();
            await deleteComment(comment_id);
            showToast('success', 'Comment deleted', 'Your comment has been deleted successfully.');
            // handleToggleComments(post.id);
        } catch (error) {
            console.error('Error deleting comment:', error);
            showToast('error', 'Error deleting comment', 'Failed to delete comment. Please try again later.');
        }
    };


    return (
        <div className="mb-8">
            {/* Пост */}
            <div className="nz-background-secondary rounded-2xl max-h-[500px] p-4 space-y-4 border overflow-y-auto transition-all duration-300 cursor-default">
                <div className='relative flex items-center mb-2'>
                    <div className="w-12 h-12 nz-background-accent rounded-full flex items-center justify-center text-white font-bold border-2">
                        {logo ? <img className='w-full h-full object-cover rounded-full' src={logo} alt={post.author.username} /> : <span>{post.author.first_name[0]}</span>}
                    </div>
                    <div className="ml-3">
                        <p className="text-white">{name} | <span className='text-[12px] nz-text-muted hover:underline cursor-pointer'>@{post.author.username}</span></p>
                        <p className="nz-text-muted text-sm">{formatDateNumeric(post.created_at)} | {formatRelativeTime(post.created_at, true)}</p>
                    </div>
                    {post.author.is_staff && (
                        <div className="absolute -top-1 right-7 md:top-1 md:right-10">
                            <Tooltip text="Verified Post">
                                <span className="p-2 flex items-center justify-center nz-background-accent rounded-full" onClick={(e) => e.stopPropagation()}>
                                    <BadgeCheck className="w-4 h-4" />
                                </span>
                            </Tooltip>
                        </div>
                    )}
                    {(profile?.id === post.author.id || profile?.is_staff) && (
                        <ActionsCellForum onEdit={() => OpenEditPost(post)} onDelete={() => { clickDeletePost(post.id) }} onShare={() => { }} />
                    )}
                </div>
                <div className='space-y-3'>
                    {/* <p className="w-fit text-xl nz-text-primary nz-background-accent font-bold mb-2 p-1 rounded-md">{post.title}</p> */}
                    <p className="text-xl nz-text-primary font-bold break-words mb-2">{post.title}</p>
                    {expandedPosts[post.id] && (
                        <button
                            onClick={() => toggleExpand(post.id)}
                            className="nz-text-accent hover:underline text-sm"
                        >
                            <span className='flex items-center gap-1'><ChevronUp className='w-4 h-4' />Show less</span>
                        </button>
                    )}
                    {/* Контент */}
                    <div className="space-y-3">
                        <p
                            className={`text-justify break-words leading-relaxed transition-all duration-300 ${expandedPosts[post.id] ? "line-clamp-none" : "line-clamp-4"
                                }`}
                        >
                            {post.content}
                        </p>

                        {(post.content.length > 372 ||
                            post.content.split(/\r\n|\r|\n/).length > 3) && (
                                <button
                                    onClick={() => toggleExpand(post.id)}
                                    className="nz-text-accent hover:underline text-sm mt-3"
                                >
                                    {expandedPosts[post.id] ? (
                                        <span className='flex items-center gap-1'><ChevronUp className='w-4 h-4' />Show less</span>
                                    ) : (
                                        <span className='flex items-center gap-1'><ChevronDown className='w-4 h-4' />Show more</span>
                                    )}
                                </button>
                            )}
                    </div>
                </div>
                <div className="flex justify-between gap-2 nz-text-muted text-sm">
                    <div className='flex gap-6'>
                        <button onClick={() => {setShowComments(!showComments); handleToggleComments(post.id)}} className="flex items-center hover:text-blue-400 gap-2"><MessageSquare className='w-5 h-5' />{comments.length}</button>
                        <button className="flex items-center hover:text-red-400 gap-2"><Heart className='w-5 h-5' />{post.likes_count}</button>
                        <button className="flex items-center hover:text-green-400 gap-2"><Repeat className='w-5 h-5' />{post.dislikes_count}</button>
                    </div>
                    {post.is_edited && (
                        <span className='flex items-center text-[10px] nz-text-secondary italic gap-1'><Pen className='w-3 h-3' />Edited</span>
                    )}
                </div>
            </div>
            {/* Панель коментарів з плавною анімацією */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="mt-3 nz-background-secondary border border-border rounded-2xl overflow-hidden"
                    >
                        {/* Заголовок коментарів */}
                        <div className="p-4 border-b flex items-center justify-between">
                            <p className="font-medium text-white flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Comments <span className="nz-text-muted">{comments.length}</span>
                            </p>
                            <button
                                onClick={() => setShowComments(false)}
                                className="nz-text-muted hover:text-white p-1 px-2 rounded-lg hover:nz-background-accent"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="max-h-[500px] flex-1 p-2 overflow-y-auto text-sm nz-text-muted space-y-6">
                            {comments.length === 0 ? (
                                <p className="text-center w-full py-10 text-sm nz-text-muted">No comments yet. Be the first to comment!</p>
                            ) : (
                                comments.map((comment: Comment) => (
                                    <div className="relative flex gap-3 hover:nz-background-accent p-2 rounded-lg transition-colors cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                {comment.author.profile.avatar_url ? (
                                                    <img className='w-8 h-8 object-cover rounded-full' src={comment.author.profile.avatar_url} alt={comment.author.username} />
                                                ) : (
                                                    <div className="w-8 h-8 nz-background-accent rounded-full flex items-center justify-center text-white font-bold border-2">
                                                        {comment.author.first_name[0]}{comment.author.last_name[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="w-fit font-medium text-white text-xs hover:underline cursor-pointer">@{comment.author.username}</p>
                                                    <p className="text-xs cursor-text">{comment.content}</p>
                                                </div>
                                            </div>
                                            <div className="absolute right-2">
                                                <ActionsCellInComment onEdit={() => handleEditComment(comment.id, String(commentRef.current?.value || ''))} onDelete={() => clickConfirmDeleteComment(comment.id)} onReport={() => {showToast('info', 'Reported', 'Comment reported successfully.');}} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-border">
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    ref={commentRef}
                                    placeholder="Write a comment..."
                                />
                                <Button onClick={() => handleAddComment(post.id, commentRef.current?.value || 'Hi, You cool! 😉')} variant="btn_accent" className="px-5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
                                    Send
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <hr className="my-4 mb-8 border-b-2 rounded-full" />
        </div>
    );
}