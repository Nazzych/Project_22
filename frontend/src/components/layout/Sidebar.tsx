import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Code2,
    FolderGit2,
    MessageSquareCode,
    ShieldAlert,
    LibrarySquare,
    LogOut,
    X,
} from 'lucide-react';
import { useProfile } from '../../contexts/ProfileContext';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Code2, label: 'Challenges', path: '/challenges' },
    { icon: LibrarySquare, label: 'Courses', path: '/courses' },
    { icon: FolderGit2, label: 'Projects', path: '/projects' },
    { icon: MessageSquareCode, label: 'Forum', path: '/forum' },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
    const { logout } = useAuth();
    const { profile } = useProfile();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        setIsAdmin (profile?.is_staff ?? false);
    }, [profile]);

    // 🔍 Перевірка ширини екрану
    useEffect(() => {
        const checkScreen = () => setIsMobile(window.innerWidth < 768);
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    const handleLogout = () => {
        logout();
        localStorage.setItem('theme', 'light');
        navigate('/login');
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    const SidebarContent = (
        <div className='nz-foreground nz-background-primary'>
            {/* Логотип */}
            <div className="mx-2 border-b h-14 flex items-center justify-between md:justify-center">
                <div className="flex items-center gap-1">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg nz-bg-primary nz-text-primary">
                        <Code2 className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold">
                        CODE<span className="nz-text-primary">HUB</span>
                    </span>
                </div>
                {isMobile && (
                    <button onClick={() => setIsOpen(false)} className="md:hidden">
                        <X className="h-5 w-5 hover:nz-text-hover" />
                    </button>
                )}
            </div>

            {/* Навігація */}
            <nav className="flex-1 h-[82.5vh] overflow-y-auto overflow-x-hidden px-3 py-6">
                <div className="space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            onClick={() => isMobile && setIsOpen(false)}
                        >
                            {({ isActive }) => (
                                <div
                                    className={cn(
                                        'flex items-center gap-2 mb-2 px-4 py-2 text-sm font-medium relative rounded-xl',
                                        isActive
                                            ? 'nz-bg-primary nz-text-primary'
                                            : 'hover:nz-text-hover hover:nz-bg-hover hover:opacity-80'
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="nz-bg-secondary absolute left-1 top-2 bottom-2 w-1.5 rounded-full"
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        />
                                    )}
                                    <item.icon className={cn("h-5 w-5", isActive ? 'nz-text-primary' : '')} />
                                    <span className={cn(isActive ? 'nz-text-primary' : '')}>{item.label}</span>
                                </div>
                            )}
                        </NavLink>
                    ))}

                    {isAdmin && (
                        <NavLink to="/admin" onClick={() => isMobile && setIsOpen(false)}>
                            {({ isActive }) => (
                                <div
                                    className={cn(
                                        'flex items-center gap-2 mb-2 px-4 py-2 text-sm font-medium relative rounded-xl',
                                        isActive
                                            ? 'nz-bg-primary nz-text-primary'
                                            : 'hover:nz-text-hover hover:nz-bg-hover hover:opacity-80 text-red-500 bg-red-500/10 border border-red-500/20'
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="nz-bg-secondary absolute left-1 top-2 bottom-2 w-1.5 rounded-full"
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        />
                                    )}
                                    <ShieldAlert className={cn("h-5 w-5", isActive ? 'nz-text-primary' : '')} />
                                    <span className={cn(isActive ? 'nz-text-primary' : '')}>Admin Panel</span>
                                </div>
                            )}
                        </NavLink>
                    )}
                </div>
            </nav>

            {/* Вихід */}
            <div className="border-t mx-2 py-4">
                <Button
                    variant="btn_glass"
                    onClick={handleLogout}
                    className="w-full justify-start hover:text-red-500"
                >
                    <LogOut className="mr-2 h-5 w-5" />
                    Log out
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <aside className="hidden md:flex sticky top-0 left-0 h-screen w-48 flex-col">
                    {SidebarContent}
                </aside>
            )}

            {/* Mobile Sidebar Toggle Button */}
            {isMobile && (
                <>
                    {/* Backdrop */}
                    {isOpen && (
                        <div
                            className="fixed inset-0 nz-overlay"
                            onClick={() => setIsOpen(false)}
                        />
                    )}

                    {/* Mobile Sidebar */}
                    <aside
                        className={cn(
                            'fixed top-0 left-0 h-screen w-64 border-r shadow-lg transition-transform duration-300 md:hidden z-50',
                            isOpen ? 'translate-x-0' : '-translate-x-full'
                        )}
                    >
                        {SidebarContent}
                    </aside>
                </>
            )}
        </>
    );
}
