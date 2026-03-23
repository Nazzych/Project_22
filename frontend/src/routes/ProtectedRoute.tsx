import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader } from '../components/ui/Loader';
import { checkSession } from '../api/auth';
import { useProfile } from '../contexts/ProfileContext';

export function ProtectedRoute() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const verify = async () => {
            try {
                const data = await checkSession();
                setIsAuthenticated(data.authenticated);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };

        verify();
    }, []);

    if (isAuthenticated === null) return <Loader />;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
    const [user, setUser] = useState<{ authenticated: boolean; is_staff: boolean } | null>(null);
    const { profile } = useProfile();

    useEffect(() => {
        const verify = async () => {
        try {
            const data = await checkSession();
            setUser({
            authenticated: data.authenticated,
            is_staff: profile?.is_staff ?? false,
            });
        } catch (error) {
            setUser({ authenticated: false, is_staff: false });
        }
        };

        if (profile !== undefined && profile !== null) {
        verify();
        }
    }, [profile]);

    if (user === null) return <Loader />;

    return user.authenticated && user.is_staff ? (
        <Outlet />
    ) : (
        <Navigate to="/" replace />
    );
}
