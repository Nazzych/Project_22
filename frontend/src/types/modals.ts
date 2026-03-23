import { ReactNode, createContext } from 'react';


export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: ReactNode;
    children: ReactNode;
    x?: boolean;
    width?: 'sm' | 'md' | 'lg' | 'xl' | 'wf';
}


export type ModalContent = {
    id: string;
    x?: boolean;
    title?: string | React.ReactNode;
    content: ReactNode;
    width?: 'sm' | 'md' | 'lg' | 'xl' | 'wf';
};

export const ModalContext = createContext<{
    openModal: (modal: ModalContent) => void;
    closeModal: () => void;
} | null>(null);

export interface ConfirmModalProps {
    message: string | React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}
