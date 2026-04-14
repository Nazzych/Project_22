import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { Edit } from 'lucide-react';
import { useModal } from '../../../hooks/useModal';
import { useToast } from '../../../providers/MessageProvider';
import { useProfile } from '../../../contexts/ProfileContext';
import { Profile } from '../../../types/profile';
import { getCsrfToken } from '../../../api/auth';
import { usersList } from '../../../api/admin';
import { AdminUserCard } from '../../../components/shared/cards/UserCard';
import { AdminEditUserModal } from '../../../components/shared/modal/modals/admin/AdminEditUserModal';
import { Skeleton } from '../../../components/LoadingSpinner';

export default function AdminForum() {
    const { profile } = useProfile()
    const { showToast } = useToast();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const getUsers = async () => {
        try {
            await getCsrfToken()
            const data = await usersList()
            setUsers (data);
        } catch (err) {
            console.error ("Error geting current curse with lessons: ", err)
            showToast('error', 'Error', 'Not can load the users');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getUsers();
    }, []);

    const { openModal } = useModal();
    const handleEditClick = (user: any) => {
        if (!profile) return;
        if (!user.is_superuser) {
            openModal({
                id: 'admin-edit-profile',
                width: "xl",
                x: false,
                title: (
                    <div className='w-fit flex flex-row justify-center items-center gap-2 nz-background-secondary px-4 py-1 font-mono rounded-lg'>
                        <Edit className="w-5 h-5 text-primary" /> {user.ban_info && <span className='flex items-center text-red-400 font-bold'>[<Lock className='w-5 h-5' />]</span>} Edit {profile.id === user.id ? <span className='underline'>Your</span> : <span>"{user.email}"</span>} Profile
                    </div>
                ),
                content: (
                    <AdminEditUserModal
                        user={user}
                        onSuccess={() => getUsers()}
                    />
                ),
            });
        } else {
            showToast ("warning", "You Can't manage of the owner!")
        }
    };

    if (loading) {
        return (
            <div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}>
                            <Skeleton className="w-64 h-40 rounded-[18px]" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            {users.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold mb-2">Users Management</h2>
                    <p className="text-zinc-400">Here you can manage users and their permissions.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {users.map((user: Profile) => (
                        <AdminUserCard
                            user={user}
                            onEdit={(user) => {handleEditClick (user)}} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}