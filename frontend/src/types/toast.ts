export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    description?: string;
}


export interface ToastUse {
    id: number;
    title: string;
    description?: string;
    type?: 'success' | 'error' | 'info' | 'warning';
}


export interface ToastContextType {
    showToast: (type: ToastType, message: string, description?: string) => void;
}