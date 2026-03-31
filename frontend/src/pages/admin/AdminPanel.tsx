import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquareCode, Code2, Users } from 'lucide-react';

import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';
import AdminDashboard from './tabs/AdminDashboard';
import AdminForum from './tabs/AdminForum';
import AdminChallenges from './tabs/AdminChallenges';
import AdminUsers from './tabs/AdminUsers';

const TABS = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'forum',     label: 'Forum',     icon: MessageSquareCode },
    { id: 'challenges',label: 'Challenges', icon: Code2 },
    { id: 'users',label: 'Users', icon: Users },
] as const;

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'forum' | 'challenges' | 'users'>('dashboard');

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
                {/* {activeTab === 'curses' && <AdminCurses />} */}
                {activeTab === 'users' && <AdminUsers />}
            </AnimatePresence>
        </div>
    );
}