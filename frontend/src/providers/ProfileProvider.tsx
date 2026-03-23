import React, { useEffect, useState, useRef } from 'react';
import { getProfile } from '../api/profile';
import { ProfileContext } from '../contexts/ProfileContext';
import { Profile } from '../types/profile';
import { useToast } from '../providers/MessageProvider';

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const hasShown = useRef(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (error) {
            if (!hasShown.current) {
                showToast('error', 'Security', 'Authorize for using site.');
                hasShown.current = true;
            }
            console.error('Помилка при отриманні профілю:', error);
        }
    };
    useEffect(() => {
        fetchProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, fetchProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};
