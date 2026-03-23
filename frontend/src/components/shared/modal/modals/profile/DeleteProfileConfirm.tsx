import { ConfirmModal } from '../../ConfirmModal';
import { DeleteProfileConfirmProps } from '../../../../../types/profile';

export function DeleteProfileConfirm({ onConfirm, onCancel }: DeleteProfileConfirmProps) {
    return (
        <ConfirmModal
        message= {
            <div className="flex items-center gap-2 relative">
                <div className="nz-background-secondary absolute left-1 top-0 h-full w-1.5 rounded-full"></div>
                <p className="text-sm pl-4">Are you sure you want to delete your account? This action cannot be undone.</p>
            </div>
        }
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText="Yes, delete"
        cancelText="Cancel"
        />
    );
}
