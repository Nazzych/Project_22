import React, { createContext, useContext } from 'react';
import { ProfileContextType } from '../types/profile';

export const ProfileContext = createContext<ProfileContextType>({
    profile: null,
    fetchProfile: async () => { },
});

export const useProfile = () => useContext(ProfileContext);
