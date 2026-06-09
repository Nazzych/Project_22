import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';
import { Edit, Trash2 } from 'lucide-react';
import { ActionsCellPropsForum } from '../types/forum';
import { Button } from './ui/Button';
import { cn } from '../lib/cn';

export type ActionItem = {
    label: string;
    icon: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger' | 'edit' | 'share';
};

type ActionsCellProps = {
    actions: ActionItem[];
    triggerIcon?: ReactNode;
    className?: string;
    buttonClassName?: string;
    menuClassName?: string;
    position?: 'top-right' | 'bottom-right';
    menuWidth?: string;                         //? наприклад "w-40"
};

export const ActionsCell = ({
    actions,
    triggerIcon = <MoreVertical className="w-4 h-4" />,
    className = "",
    buttonClassName = "",
    menuClassName = "",
    position = 'bottom-right',
    menuWidth = "w-32"
}: ActionsCellProps) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const menuPositionClass = position === 'top-right' 
        ? "top-10 right-0" 
        : "top-8 right-0";

    return (
        <div className={`relative ${className}`} ref={menuRef}>
            {/* Кнопка-тригер */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className={cn(
                    "p-2 rounded-full nz-background-accent hover:nz-bg-hover transition-colors",
                    buttonClassName
                )}
            >
                {triggerIcon}
            </button>

            {/* Меню */}
            {open && (
                <div 
                    className={cn(
                        `absolute ${menuPositionClass} ${menuWidth} rounded-md shadow-lg border nz-background-accent z-50`,
                        menuClassName
                    )}
                >
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(false);
                                action.onClick();
                            }}
                            className={cn(
                                "flex w-full items-center p-1.5 text-sm hover:nz-background-primary transition-colors",
                                action.variant === 'danger' && "text-red-400 hover:text-red-300",
                                action.variant === 'edit' && "text-yellow-400 hover:text-yellow-300",
                                action.variant === 'share' && "text-blue-400 hover:text-blue-300",
                                index === 0 && "rounded-t-md",
                                index === actions.length - 1 && "rounded-b-md"
                            )}
                        >
                            <span className="mr-3">{action.icon}</span>
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


export function ActionsCellInChannel({ onEdit, onDelete }: ActionsCellPropsForum) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    return (
        <div ref={menuRef}>
            <Button 
                variant="btn_glass"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className="absolute top-4 right-16"
            >
                <MoreVertical className="w-5 h-5" />
            </Button>

            {open && (
                <div className="absolute right-16 top-14 w-32 rounded-md shadow-lg border nz-background-accent z-50">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }} 
                        className="flex items-center w-full text-left px-3 py-2 nz-text-secondary hover:nz-background-primary rounded-t-md"
                    >
                        <Edit className='w-4 h-4 mr-2' /> Edit
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }} 
                        className="flex items-center w-full text-left px-3 py-2 nz-text-destructive hover:nz-background-primary rounded-b-md"
                    >
                        <Trash2 className='w-4 h-4 mr-2' /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}
