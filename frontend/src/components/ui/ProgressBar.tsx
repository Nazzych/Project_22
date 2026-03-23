import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { ProgressBarProps } from '../../types/componentsUI';

export function ProgressBar({
    value,
    max = 100,
    label,
    showValue = true,
    className,
    colorClass = 'bg-gradient-to-r from-primary to-secondary',
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={cn('w-full', className)}>
            {(label || showValue) && (
                <div className="mb-1.5 flex justify-between text-sm">
                    {label && <span className="font-medium nz-text-muted">{label}</span>}
                    {showValue && <span className="font-bold nz-text-accent">{Math.round(percentage)}%</span>}
                </div>
            )}
            <div className="h-2.5 w-full overflow-hidden rounded-full nz-glass">
                <motion.div
                    className={cn('h-full rounded-full shadow-lg', colorClass)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}
