//components/shared/modal/FormModal.tsx
export interface FormModalProps {
    onSubmit: (e: React.FormEvent) => void;
    children: React.ReactNode;
    submitText?: string;
    isSubmitting?: boolean;
}

