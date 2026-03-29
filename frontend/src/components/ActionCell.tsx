import { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Share2, MoreVertical } from 'lucide-react';
import { ActionsCellPropsProj } from '../types/projects';
import { ActionsCellPropsForum, ActionsCellPropsChannel } from '../types/forum';
import { Button } from './ui/Button';

// ====================== Project Actions ======================
export function ActionsCellProj({ entry, startRename }: ActionsCellPropsProj) {
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

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <td className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className="p-1 nz-background-primary rounded-full hover:nz-background-secondary"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div ref={menuRef} className="absolute right-0 mt-2 w-32 rounded-md shadow-lg border nz-background-accent z-50">
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setOpen(false); 
                            startRename(entry); 
                        }} 
                        className="flex w-full text-left px-3 py-2 hover:nz-background-primary rounded-t-md"
                    >
                        <Edit className='w-4 h-4 mr-2' /> Edit
                    </button>

                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setOpen(false); 
                        }} 
                        className="flex w-full text-left px-3 py-2 hover:nz-background-primary"
                    >
                        <Trash2 className='w-4 h-4 mr-2' /> Delete
                    </button>

                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setOpen(false); 
                        }} 
                        className="flex w-full text-left px-3 py-2 hover:nz-background-primary rounded-b-md"
                    >
                        <Share2 className='w-4 h-4 mr-2' /> Share
                    </button>
                </div>
            )}
        </td>
    );
}

// ====================== Forum Actions ======================
export function ActionsCellForum({ onEdit, onDelete }: ActionsCellPropsForum) {
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
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className="nz-background-accent p-2 rounded-full hover:nz-bg-hover absolute -right-3 -top-3 md:right-1 md:top-1"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute right-0 top-5 md:top-10 w-32 rounded-md shadow-lg border nz-background-accent z-50">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }} 
                        className="flex items-center w-full text-left px-3 py-2 hover:nz-background-primary rounded-t-md"
                    >
                        <Edit className='w-4 h-4 mr-2' /> Edit
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }} 
                        className="flex items-center w-full text-left px-3 py-2 hover:nz-background-primary"
                    >
                        <Trash2 className='w-4 h-4 mr-2' /> Delete
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpen(false); }} 
                        className="flex items-center w-full text-left px-3 py-2 hover:nz-background-primary rounded-b-md"
                    >
                        <Share2 className='w-4 h-4 mr-2' /> Share
                    </button>
                </div>
            )}
        </div>
    );
}

// ====================== Channel Actions ======================
export function ActionsCellChannel({ onEdit, onDelete }: ActionsCellPropsChannel) {
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
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className="nz-background-accent p-2 rounded-full hover:nz-bg-hover absolute right-0 top-0 md:right-1 md:top-1"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute right-0 top-10 w-32 rounded-md shadow-lg border nz-background-accent z-50">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }} 
                        className="flex items-center w-full text-left px-3 py-1 hover:nz-background-primary rounded-t-md"
                    >
                        <Edit className='w-4 h-4 mr-2' /> Edit
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }} 
                        className="flex items-center w-full text-left px-3 py-1 hover:nz-background-primary"
                    >
                        <Trash2 className='w-4 h-4 mr-2' /> Delete
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpen(false); }} 
                        className="flex items-center w-full text-left px-3 py-1 hover:nz-background-primary rounded-b-md"
                    >
                        <Share2 className='w-4 h-4 mr-2' /> Share
                    </button>
                </div>
            )}
        </div>
    );
}

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
                        className="flex items-center w-full text-left px-3 py-2 hover:nz-background-primary rounded-t-md"
                    >
                        <Edit className='w-4 h-4 mr-2' /> Edit
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }} 
                        className="flex items-center w-full text-left px-3 py-2 hover:nz-background-primary"
                    >
                        <Trash2 className='w-4 h-4 mr-2' /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}
