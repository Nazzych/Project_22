// components/shared/modal/FormModal.tsx
import React from 'react';
import { LoadingSpinner } from '../../LoadingSpinner';
import { FormModalProps } from '../../../types/forms';

export function FormModal({
    onSubmit,
    children,
    submitText = 'Save',
    isSubmitting = false,
}: FormModalProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {children}
            <div className="flex justify-end">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner text="Saving..." /> : submitText}
                </button>
            </div>
        </form>
    );
}

export { };