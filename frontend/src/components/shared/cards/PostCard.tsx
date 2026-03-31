import React from 'react';
import { MessageSquare, Heart, Repeat, Pen, ChevronDown, ChevronUp, BadgeCheck } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardFooter } from '../../../components/ui/Card';
import { ActionsCellForum } from '../../ActionCell';
import { Posts } from '../../../types/forum';
import { Profile } from '../../../types/profile';
// import { motion, AnimatePresence } from 'framer-motion';

import { formatDateNumeric, formatRelativeTime } from '../../../lib/formatDate';
import { Tooltip } from '../../Tooltip';

interface PostCardProps {
    logo: string;
    name: string;
    post: Posts;
    expandedPosts: Record<number, boolean>;
    toggleExpand: (id: number) => void;
    OpenEditPost: (post: Posts) => void;
    clickDeletePost: (id: number) => void;
    profile: Profile | null;
    onCommentClick?: (postId: number) => void;
}

export function PostCard({
    logo,
    name,
    post,
    profile,
    expandedPosts,
    toggleExpand,
    OpenEditPost,
    clickDeletePost,
    onCommentClick,
}: PostCardProps) {
    return (
        <div className='mb-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-2'>
                <div className="col-span-2 nz-background-secondary rounded-2xl p-4 max-h-[500px] space-y-4 cursor-default overflow-auto">
                    <div className='relative flex items-center mb-2'>
                        <div className="w-12 h-12 nz-background-accent rounded-full flex items-center justify-center text-white font-bold border-2">
                            {logo ? <img className='w-full h-full object-cover rounded-full' src={logo} alt={post.author.username} /> : <span>{post.author.first_name[0]}{post.author.last_name[0]}</span>}
                        </div>
                        <div className="ml-3">
                            <p className="text-white">{name} | <span className='text-[12px] nz-text-muted hover:underline cursor-pointer'>@{post.author.username}</span></p>
                            <p className="nz-text-muted text-sm">{formatDateNumeric(post.created_at)} | {formatRelativeTime(post.created_at, true)}</p>
                        </div>
                        {post.author.is_staff && (
                            <div className="absolute -top-3 right-6 md:top-1 md:right-10">
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
                            <button className="flex items-center hover:text-blue-400 gap-2"><MessageSquare className='w-5 h-5' />{post.views_count}</button>
                            <button className="flex items-center hover:text-red-400 gap-2"><Heart className='w-5 h-5' />{post.likes_count}</button>
                            <button className="flex items-center hover:text-green-400 gap-2"><Repeat className='w-5 h-5' />{post.dislikes_count}</button>
                        </div>
                        {post.is_edited && (
                            <span className='flex items-center text-[10px] nz-text-secondary italic gap-1'><Pen className='w-3 h-3' />Edited</span>
                        )}
                    </div>
                </div>
                <div className="col-span-1 overflow-y-auto max-h-[500px] hidden lg:block">
                    <div className="md:col-span-1 h-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Media placeholder</p>
                    </div>
                </div>
            </div>
            <hr className='border-2 mt-4 rounded-xl' />
        </div>
    );
}