//src/components/layout/Layout.tsx.
import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Outlet } from 'react-router-dom'
export function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <div className="flex min-h-screen overflow-x-hidden overflow-y-hidden">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main role="main" className="flex-1 mr-0 md:mr-2 max-h-[calc(100vh-4rem)] border overflow-y-hidden overflow-x-hidden rounded-none md:rounded-3xl nz-background-accent">
                    <div className="p-2 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto overflow-x-hidden h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
