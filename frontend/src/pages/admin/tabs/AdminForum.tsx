import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareCode, Users, ShieldCheck } from 'lucide-react';

import AdminPostsList from '../components/forum/AdminPostsList';
import AdminChannelsList from '../components/forum/AdminChannelsList';
import AdminModeration from '../components/forum/AdminModeration';

const FORUM_TABS = [
    { 
        id: 'posts', 
        label: 'Posts', 
        icon: MessageSquareCode 
    },
    { 
        id: 'channels', 
        label: 'Channels', 
        icon: Users 
    },
    { 
        id: 'moderation', 
        label: 'Moderation', 
        icon: ShieldCheck 
    },
] as const;

type ForumTab = typeof FORUM_TABS[number]['id'];

export default function AdminForum() {
    const [activeTab, setActiveTab] = useState<ForumTab>('posts');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* === ЛІВА ЧАСТИНА — КОНТЕНТ === */}
            <div className="lg:col-span-9">
                <div className="flex lg:hidden justify-center items-center gap-2 mb-4">
                    {FORUM_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-fit flex items-center gap-3 px-5 py-4 rounded-2xl transition-all text-left ${
                                    isActive 
                                        ? 'nz-background-primary nz-foreground shadow-sm' 
                                        : 'hover:nz-background-secondary nz-text-muted'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                            </button>
                        );
                    })}

                </div>
                <AnimatePresence mode="wait">
                    {activeTab === 'posts' && (
                        <motion.div
                            key="posts"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AdminPostsList />
                        </motion.div>
                    )}

                    {activeTab === 'channels' && (
                        <motion.div
                            key="channels"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AdminChannelsList />
                        </motion.div>
                    )}

                    {activeTab === 'moderation' && (
                        <motion.div
                            key="moderation"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AdminModeration />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* === ПРАВА ЧАСТИНА — МЕНЮ ВКЛАДОК === */}
            <div className="lg:col-span-3">
                <div className="hidden lg:block sticky -top-4 pl-4 py-2 border-l space-y-1">
                    {FORUM_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-5 py-4 rounded-3xl transition-all text-left ${
                                    isActive 
                                        ? 'nz-background-primary nz-foreground shadow-sm' 
                                        : 'hover:nz-background-secondary nz-text-muted'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}