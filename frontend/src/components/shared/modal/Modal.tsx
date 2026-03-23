import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { ModalProps } from '../../../types/modals';
import { cn } from '../../../lib/cn';

const widthStyles: Record<NonNullable<ModalProps['width']>, string> = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-4xl',
    wf: 'w-full max-w-screen-xl',
};

export function Modal({ isOpen, onClose, title, children, width, x = true }: ModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center nz-overlay">
            <div className={cn("min-w-[400px] nz-background-primary rounded-xl px-2 py-4 md:p-6 shadow-xl relative", widthStyles[width || 'md'])}>
                {x && (
                    <button onClick={onClose} className="absolute p-1 top-6 right-4 border text-zinc-500 hover:text-rose-900 rounded-md">
                        <X />
                    </button>
                )}
                {title && <h2 className="text-lg font-semibold pb-2 md:mb-4">{title}</h2>}
                <div className='max-h-[80vh] overflow-auto pr-2'>{children}</div>
            </div>
        </div>,
        document.body
    );
}
