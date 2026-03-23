import { useState } from 'react';
import { ToastUse } from '../types/toast';

let toastId = 0;

export function useToast() {
    const [toasts, setToasts] = useState<ToastUse[]>([]);

    const showToast = (
        type: ToastUse['type'],
        title: string,
        description?: string
    ) => {
        const id = ++toastId;
        setToasts((prev) => [
            ...prev,
            { id, title, description, type },
        ]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3000);
    };

    return { toasts, showToast };
}
