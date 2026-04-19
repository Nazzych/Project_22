import React from 'react';
import { motion } from 'framer-motion';

type TabId = 'dashboard' | 'forum' | 'challenges' | 'courses' | 'projects' | 'users';

interface Tab {
    id: TabId;
    label: string;
    icon?: React.ElementType;
}

interface AdminTabsProps {
    tabs: readonly Tab[];
    activeTab: TabId;
    onTabChange: (tabId: TabId) => void;
}

export default function AdminTabs({ tabs, activeTab, onTabChange }: AdminTabsProps) {
    return (
        <div className="relative border-b border-border mb-8">
            <div className="flex gap-10 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`group relative pb-4 flex items-center gap-2.5 text-sm font-medium transition-all ${
                                isActive 
                                    ? 'text-white' 
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            {Icon && (
                                <Icon className={`h-4 w-4 transition-colors ${
                                    isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                                }`} />
                            )}
                            {tab.label}

                            {isActive && (
                                <motion.div
                                    layoutId="admin-tab-underline"
                                    className="absolute bottom-0 left-2 right-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500 rounded-t-full"
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}