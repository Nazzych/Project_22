import React, { useState, ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi, registerApi, logOutApi, getCsrfToken } from '../api/auth';
import { AuthContext } from '../contexts/AuthContext';
import { AuthContextType, User } from '../types/auth';
import { useToast } from '../providers/MessageProvider';


export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const hasShown = useRef(false);

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        try {
            await getCsrfToken();
            const data = await registerApi({ name, email, password, address: '' });
            setUser({
                id: data.user.id || data.user.pk || data.user._id || '',
                email: data.user.email,
                name: data.user.first_name,
                username: data.user.username
            });
            navigate('/');
        } catch (error) {
            if (!hasShown.current) {
                showToast('error', 'Not success register', 'Check data try again later.');
                hasShown.current = true;
            }
            console.error('Register failed', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            await getCsrfToken();
            const data = await loginApi({ email, password });
            // console.info ('loginApi data:', data);
            setUser({
                id: data.user.id || data.user.pk || data.user._id || '',
                email: data.user.email,
                name: data.user.first_name,
                username: data.user.username
            });
            navigate('/');
            if (!hasShown.current) {
                showToast('success', 'Success entered', 'You have successfully logged in, welcome.');
                hasShown.current = true;
            }
        } catch (error) {
            if (!hasShown.current) {
                showToast('error', 'Login failed', 'Please check your email and password.');
                hasShown.current = true;
            }
            console.error('Login failed', error);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await getCsrfToken(); // ⬅️ Отримуємо CSRF cookie
            await logOutApi();
            navigate('/login');
        } catch (error) {
            if (!hasShown.current) {
                showToast('error', 'Logout failed', 'Please try again.');
                hasShown.current = true;
            }
            console.error('Logout failed', error);
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}