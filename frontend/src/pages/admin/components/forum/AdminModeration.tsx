import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Users } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { getCsrfToken } from '../../../../api/auth';
import { getUnapprovedTasks, acceptTask, rejectTask } from '../../../../api/admin';
import { useToast } from '../../../../providers/MessageProvider'
import { Channels } from '../../../../types/forum';
import { useModal } from '../../../../hooks/useModal';
import { ConfirmModal } from '../../../../components/shared/modal/ConfirmModal'

export default function AdminModeration() {
    const { showToast } = useToast();
    const { openModal, closeModal } = useModal();
    const [pendingChannels, setPendingChannels] = useState<Channels[]>([]);

    const fetchPendingChannels = async () => {
        try {
            await getCsrfToken();
            const channels = await getUnapprovedTasks();
            setPendingChannels(channels);
        } catch (error) {
            showToast("error", "Error fetching channels", "Please try again later.");
            console.error("Error fetching channels:", error);
        }
    };

    useEffect(() => {
        fetchPendingChannels();
    }, []);

    const confirmAction = (post_id: number, action: 'approve' | 'reject') => {
        openModal({
            id: 'confirm-delete-post',
            width: "md",
            content: (
                <ConfirmModal
                    message= {
                        <div className="flex items-center gap-2 relative">
                            <div className="nz-background-secondary absolute left-1 top-0 h-full w-1.5 rounded-full"></div>
                            <p className="text-sm pl-4">You really want to "{action.toUpperCase()}" this channel? This action cannot be undone.</p>
                        </div>
                    }
                    onConfirm={() => {
                        if (action === 'approve') {
                            handleApprove(post_id);
                        } else {
                            handleReject(post_id);
                        }
                        closeModal();
                    }}
                    onCancel={closeModal}
                    confirmText="Yes, Confirm"
                    cancelText="Cancel"
                />
            ),
        });
    };

    const handleApprove = async (id: number) => {
        try {
            await getCsrfToken();
            await acceptTask(id);
            showToast("success", "Channel approved", "The channel has been approved successfully.");
            fetchPendingChannels();
        } catch (error) {
            showToast("error", "Error approving channel", "Please try again later.");
            console.error("Error approving channel:", error);
        }
    };

    const handleReject = async (id: number) => {
        try {
            await getCsrfToken();
            await rejectTask(id);
            showToast("success", "Channel rejected", "The channel has been rejected successfully.");
            fetchPendingChannels();
        } catch (error) {
            showToast("error", "Error rejecting channel", "Please try again later.");
            console.error("Error rejecting channel:", error);
        }
    };

    return (
        <div className="space-y-4">
            {pendingChannels.length === 0 ? (
                <div className="flex items-center justify-center py-16 nz-text-muted gap-2">
                    <XCircle className="w-8 h-8" />
                    No channels pending for moderation
                </div>
            ) : (
                pendingChannels.map((channel) => (
                    <div key={channel.id} className="bg-nz-background-secondary border border-border rounded-2xl p-4">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-4">
                                {channel.logo ? (
                                    <img src={channel.logo} alt={channel.name} className="w-16 h-16 object-cover rounded-2xl" />
                                ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold">
                                        {channel.name[0]}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-white line-clamp-1">{channel.name}</p>
                                    <p className="text-xs nz-text-muted line-clamp-1">@{channel.owner.username}</p>
                                    <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                                        {channel.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button 
                                    onClick={() => confirmAction(channel.id, 'approve')}
                                    variant="btn_success"
                                    size="sm"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Accept
                                </Button>
                                <Button 
                                    onClick={() => confirmAction(channel.id, 'reject')}
                                    variant="btn_destructive"
                                    size="sm"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            ))}
        </div>
    );
}