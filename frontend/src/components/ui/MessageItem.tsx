import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Toast } from '../../types/toast';

export function ToastItem({
    toast,
    onClose,
    stacked,
}: {
    toast: Toast;
    onClose: () => void;
    stacked?: boolean;
}) {
    const icons = {
        success: CheckCircle2,
        error: XCircle,
        warning: AlertCircle,
        info: Info,
    };

    const styles = {
        success: 'border-green-400/50 bg-green-950/50 backdrop background-blur-lg text-white',
        error: 'border-red-400/50 bg-red-950/50 backdrop-blur-lg text-white',
        warning: 'border-amber-400/50 bg-amber-950/50 backdrop-blur-lg text-white',
        info: 'border-blue-400/50 bg-blue-950/50 backdrop-blur-lg text-white',
    };

    const iconColors = {
        success: 'text-green-400',
        error: 'text-red-400',
        warning: 'text-amber-400',
        info: 'text-blue-400',
    };

    const Icon = icons[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'glass-strong relative w-80 rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300',
                styles[toast.type],
                stacked && 'scale-95 opacity-70 -translate-y-2 pointer-events-none'
            )}
        >
            <div className="grid grid-col items-start">
                <div className='flex justify-between'>
                    <div className='flex flex-row items-center gap-2'>
                        <Icon className={cn('h-5 w-5 shrink-0', iconColors[toast.type])} />
                        <p className="font-semibold text-sm line-clamp-1">{toast.message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="min-w-0">
                    {toast.description && (
                        <p className="max-h-[40vh] text-xs opacity-90 overflow-y-auto mt-2">{toast.description}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
