// components/shared/modal/ConfirmModal.tsx
import React from 'react';
import { Button } from '../../ui/Button';
import { ConfirmModalProps } from '../../../types/modals';

export function ConfirmModal({
    message,
    onConfirm,
    onCancel,
    confirmText = 'Ok',
    cancelText = 'Cancel',
}: ConfirmModalProps) {
    return (
        <div className="space-y-4">
            <p className="text-sm">{message}</p>
            <div className="flex justify-end gap-2">
                <Button variant="btn_primary" onClick={onCancel}>
                    {cancelText}
                </Button>
                <Button variant="btn_secondary" onClick={onConfirm}>
                    {confirmText}
                </Button>
            </div>
        </div>
    );
}

export { };
