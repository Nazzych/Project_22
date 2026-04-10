import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquareCode, Code2, Users, Book, FolderGit2 } from 'lucide-react';

import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';
import AdminDashboard from './tabs/AdminDashboard';
import AdminForum from './tabs/AdminForum';
import AdminChallenges from './tabs/AdminChallenges';
import AdminCurses from './tabs/AdminCurses';
import AdminProjects from './tabs/AdminProjects';
import AdminUsers from './tabs/AdminUsers';

const TABS = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'forum',     label: 'Forum',     icon: MessageSquareCode },
    { id: 'challenges',label: 'Challenges', icon: Code2 },
    { id: 'courses',label: 'Courses', icon: Book },
    { id: 'projects',label: 'Projects', icon: FolderGit2 },
    { id: 'users',label: 'Users', icon: Users },
] as const;

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'forum' | 'challenges' | 'courses' | 'projects' | 'users'>('dashboard');

    return (
        <div className="space-y-8">
            <AdminHeader />

            <AdminTabs 
                tabs={TABS}
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />

            <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && <AdminDashboard />}
                {activeTab === 'forum' && <AdminForum />}
                {activeTab === 'challenges' && <AdminChallenges />}
                {activeTab === 'courses' && <AdminCurses />}
                {activeTab === 'projects' && <AdminProjects />}
                {activeTab === 'users' && <AdminUsers />}
            </AnimatePresence>
        </div>
    );
}