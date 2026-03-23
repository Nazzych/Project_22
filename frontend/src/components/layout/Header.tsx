// src/components/layout/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Bell, Menu } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile } from '../../contexts/ProfileContext';
import { HeaderProps } from '../../types/header';

export function Header({ onMenuClick }: HeaderProps) {
    const location = useLocation();
    const isActive = location.pathname === '/profile';
    const { profile } = useProfile();
    return (
        <header className="sticky top-0 z-30 h-14 nz-foreground nz-background-primary backdrop-blur-md backdrop-saturate-150 backdrop-contrast-125 px-4 md:px-6 flex items-center justify-between">
            {/* Лівий бік — меню + логотип на мобілці */}
            <div className="flex items-center gap-4 md:hidden">
                <Button variant="btn_glass" onClick={onMenuClick} className='rounded-full px-2'>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Привітання — тільки на десктопі */}
            <h1 className="hidden text-xl md:flex items-center flex-1">
                Welcome back,<span className="nz-text-primary ml-1 font-semibold">{profile?.first_name}</span>! 👋
            </h1>

            {/* Правий бік — дії + профіль */}
            <div className="flex items-center gap-3 ml-auto">
                <div className="bg_card px-4 flex items-center justify-center gap-2 rounded-full">
                    <ThemeToggle />
                    <button className="p-0 m-0 bg-transparent border-none text-[hsl(var(--foreground))] hover:nz-text-hover">
                        <Bell className="h-6" />
                    </button>
                </div>

                <div className="hidden sm:block h-5 w-px bg-border mx-2" />
                <Link
                    to="/profile"
                    className="flex items-center hover:nz-text-hover transition-opacity"
                >
                    {isActive && (
                            <motion.div layoutId="active-indicator" className="flex nz-bg-secondary absolute top-4 h-6 w-1.5 rounded-full" transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
                        )}
                    <div className="hidden sm:block text-right pl-3">
                        <p className="text-sm font-medium">
                            Level {profile?.profile?.total_points ?? '--'}
                        </p>
                        <p className="text-xs nz-text-muted">{profile?.is_staff ? "Admin" : "User"}</p>
                        </div>

                        <div className="h-9 w-9 ml-4 md:ml-2 rounded-full nz-ring nz-bg-primary nz-text-primary flex items-center justify-center font-semibold cursor-pointer select-none">
                        {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </div>
                </Link>
            </div>
        </header>
    );
}
