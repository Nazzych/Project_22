import React, { useCallback, useState, useRef, createContext, useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ToastItem } from '../components/ui/MessageItem';
import { cn } from '../lib/cn';
import { Toast, ToastType, ToastContextType } from '../types/toast';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isHovered, setIsHovered] = useState(false);
    const timers = useRef<Record<string, NodeJS.Timeout>>({});
    const remainingTimes = useRef<Record<string, number>>({});
    const startTimes = useRef<Record<string, number>>({});

    const showToast = useCallback((type: ToastType, message: string, description?: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast: Toast = { id, type, message, description };
        setToasts((prev) => [...prev, toast]);

        const duration = 5000;
        startTimes.current[id] = Date.now();
        remainingTimes.current[id] = duration;

        timers.current[id] = setTimeout(() => {
        removeToast(id);
        }, duration);
    }, []);

    const removeToast = (id: string) => {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
        delete remainingTimes.current[id];
        delete startTimes.current[id];
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const pauseAllTimers = () => {
        setIsHovered(true);
        Object.keys(timers.current).forEach((id) => {
            clearTimeout(timers.current[id]);
            const elapsed = Date.now() - startTimes.current[id];
            remainingTimes.current[id] = Math.max(0, remainingTimes.current[id] - elapsed);
        });
    };

    const resumeAllTimers = () => {
        setIsHovered(false);
        Object.keys(remainingTimes.current).forEach((id) => {
            const remaining = remainingTimes.current[id];
            startTimes.current[id] = Date.now();
            timers.current[id] = setTimeout(() => {
                removeToast(id);
            }, remaining);
        });
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div
                className={cn(
                'fixed top-4 right-4 z-50 flex flex-col-reverse items-end gap-2 transition-all duration-300',
                isHovered ? 'translate-y-0' : '-translate-y-2'
                )}
                onMouseEnter={pauseAllTimers}
                onMouseLeave={resumeAllTimers}
            >
                <AnimatePresence initial={false}>
                {toasts.map((toast, index) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                        stacked={!isHovered && index !== toasts.length - 1}
                    />
                ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
