import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    position?: 'center' | 'top' | 'bottom' | 'right';
    showCloseButton?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
};

export default function SvipeModal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    position = 'center',
    showCloseButton = true,
    className = '',
}: ModalProps) {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isOpen) return null;

    const finalPosition = isMobile ? 'bottom' : position;
    const isFullScreen = isMobile;

    return (
        <AnimatePresence>
            {isOpen && (
                <div>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 nz-bg-blur backdrop-blur-md z-[999]"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <div 
                        className={`fixed inset-0 z-[1000] flex 
                            ${finalPosition === 'bottom' ? 'justify-center items-end' : 
                                finalPosition === 'top' ? 'items-start justify-center' : 
                                finalPosition === 'right' ? 'items-center justify-end' : 
                                'items-center justify-center'}`}
                    >
                        <motion.div
                            initial={
                                finalPosition === 'bottom' ? { y: '100%' } :
                                finalPosition === 'top' ? { y: '-50px', opacity: 0 } :
                                finalPosition === 'right' ? { x: '100%' } :
                                { scale: 0.95, opacity: 0 }
                            }
                            animate={{ y: 0, x: 0, scale: 1, opacity: 1 }}
                            exit={
                                finalPosition === 'bottom' ? { y: '100%' } :
                                finalPosition === 'top' ? { y: '-50px', opacity: 0 } :
                                finalPosition === 'right' ? { x: '100%' } :
                                { scale: 0.95, opacity: 0 }
                            }
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={`
                                nz-background-primary border shadow-2xl overflow-hidden w-full
                                ${isFullScreen 
                                    ? 'h-[100dvh] rounded-none' 
                                    : `${sizeClasses[size]} ${getBorderRadius(finalPosition)}`
                                }
                                ${finalPosition === 'right' ? 'mr-0' : 'mx-4'}
                                ${className}
                            `}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            {(title || showCloseButton) && (
                                <div className="flex items-center justify-between border-b px-6 py-5">
                                    <div className="text-xl font-semibold">
                                        {title}
                                    </div>
                                    {showCloseButton && (
                                        <Button
                                            variant="btn_secondary"
                                            size="sm"
                                            onClick={onClose}
                                            className="w-9 h-9 p-0 rounded-full"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className={`p-6 ${isFullScreen ? 'pb-24' : ''}`}>
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Допоміжна функція для заокруглень
const getBorderRadius = (position: string) => {
    if (position === 'right') return 'rounded-l-3xl';
    if (position === 'top') return 'rounded-b-3xl';
    if (position === 'bottom') return 'rounded-t-3xl';
    return 'rounded-3xl';
};