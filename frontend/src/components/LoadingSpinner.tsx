// components/LoadingSpinner.tsx
import React from 'react';
import { Loader } from 'lucide-react';
import { LoadingSpinnerProps } from '../types/loaders';

export function LoadingSpinner({ size = 16, text }: LoadingSpinnerProps) {
    return (
        <span className="flex items-center gap-2">
        <Loader size={size} className="animate-spin" />
        {text && <span>{text}</span>}
        </span>
    );
}

// Skeleton.
export function Skeleton({ className }: { className?: string }) {
    return (
        <div
        className={`animate-pulse bg-gray-700 rounded ${className}`}
        />
    );
}
