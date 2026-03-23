import { useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    const { fetchProfile } = useProfile();
    useEffect(() => {
        fetchProfile();
    }, []);

    return context;
}
