// src/components/profile/ShowBio.tsx
import { useModal } from '../../../../../hooks/useModal';
import { Button } from '../../../../ui/Button';

interface ShowBioProps {
    bio: string;
}

export function ShowBio({ bio }: ShowBioProps) {
    const { closeModal } = useModal();

    return (
        <div className="space-y-4">
            <p className="text-sm nz-text-foreground p-4 nz-background-secondary rounded-md whitespace-pre-wrap">
                {bio || 'No bio provided yet.'}
            </p>
            <div className="flex justify-end pt-4">
                <Button
                    onClick={closeModal}
                    variant="btn_accent"
                    className="px-4 py-2 text-sm font-medium rounded bg-muted text-primary hover:bg-muted/80 transition"
                >
                    Close
                </Button>
            </div>
        </div>
    );
}
