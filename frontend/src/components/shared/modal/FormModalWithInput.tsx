// components/shared/modal/FormModalWithInput.tsx
import React, { useState } from 'react';
import { LoadingSpinner } from '../../LoadingSpinner';
import { FormModalProps } from '../../../types/forms';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';

type ExtendedProps = Omit<FormModalProps, 'children'> & {
    onSubmit: (value: string) => void;
    onCancel: () => void;
    cancelText?: string;
    labelText?: string;
    fieldType?: 'input' | 'textarea';
};

export function FormModalWithInput({
    onSubmit,
    onCancel,
    submitText = 'Submit',
    cancelText = 'Cancel',
    labelText = 'Enter value',
    isSubmitting = false,
    fieldType = 'input',
}: ExtendedProps) {
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(value);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 ml-1">
            <div>
                <label className="block text-sm font-medium mb-1">{labelText}</label>
                {fieldType === 'textarea' ? (
                    <Textarea
                        name='form-textarea'
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                    />
                ) : (
                    <Input
                        name='form-input'
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                )}
            </div>

            <div className="flex justify-end gap-2">
                <Button variant='btn_accent'
                    type="button"
                    className="btn-secondary"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    {cancelText}
                </Button>
                <Button variant='btn_success' type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <LoadingSpinner text="Saving..." /> : submitText}
                </Button>
            </div>
        </form>
    );
}

export { };
