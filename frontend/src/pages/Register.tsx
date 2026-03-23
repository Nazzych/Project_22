// src/pages/Register.tsx
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../providers/MessageProvider';
import { Mail, Lock, User, AlertCircle, CheckCircle2, KeyRound, Code2, Home } from 'lucide-react';

export function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { showToast } = useToast();
    const hasShown = useRef(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

    const passwordStrength =
        form.password.length >= 8 ? 'strong' : form.password.length >= 6 ? 'medium' : 'weak';

    // Генерація надійного пароля
    const generatePassword = () => {
        const charset =
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

        let newPassword = '';

        // Гарантуємо хоча б по одному символу з кожної групи
        newPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        newPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        newPassword += '0123456789'[Math.floor(Math.random() * 10)];
        newPassword += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 16)];

        for (let i = newPassword.length; i < 12; i++) {
            newPassword += charset[Math.floor(Math.random() * charset.length)];
        }

        newPassword = newPassword
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');

        setForm((prev) => ({
            ...prev,
            password: newPassword,
            confirmPassword: newPassword,
        }));

        setShowGeneratedPassword(true);
        setTimeout(() => setShowGeneratedPassword(false), 2000);

        navigator.clipboard.writeText(newPassword).then(() => {
            showToast('info', 'Пароль згенеровано!', 'Скопійовано в буфер обміну');
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Password not match');
            if (!hasShown.current) {
                showToast('warning', 'Password not match', 'Check all passwords');
                hasShown.current = true;
            }
            return;
        }

        if (form.password.length < 8) {
            setError('Password must be more than 8 symbols');
            if (!hasShown.current) {
                showToast('warning', 'Easy password', 'Minimum 8 symbols');
                hasShown.current = true;
            }
            return;
        }

        setIsLoading(true);

        try {
            await register(
                form.name.trim(),
                form.email.trim(),
                form.password,
            );
            if (!hasShown.current) {
                showToast('success', 'Success registration!', 'Welcome to CodeHub!');
                hasShown.current = true;
            }
            navigate('/');
        } catch (err: any) {
            setError('Registration error. Try again.');
            if (!hasShown.current) {
                showToast('error', 'Registration error', err.message || 'Something went wrong.');
                hasShown.current = true;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-5xl border shadow-md">
            <div className="flex flex-col gap-8 p-6">
            
            {/* Шапка по центру */}
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 gap-0 md:gap-3">
                <div className="h-16 w-16 rounded-2xl text-black bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Code2 className="h-7 w-7" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold nz-foreground text-left">Create account</h1>
                    <p className="font-semibold nz-text-muted text-left">Join the community</p>
                </div>
            </div>

            {/* Дві колонки з полями */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ліва колонка */}
                <div className="space-y-5">
                {/* Full name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Full name</label>
                    <Input
                    name="name"
                    placeholder="Ivan Petrenko"
                    icon={<User className="h-4 w-4 text-muted-foreground" />}
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="pl-10"
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">E-mail</label>
                    <Input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="pl-10"
                    />
                </div>
                </div>

                {/* Права колонка */}
                <div className="space-y-5">
                {/* Password */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                    type={showGeneratedPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4 text-muted-foreground" />}
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="pl-10"
                    />

                    {/* Strength + генерація */}
                    {form.password && (
                    <div className="space-y-1">
                        <div className="flex gap-1.5">
                        {/* Strength bars */}
                        {[0, 1, 2].map((i) => (
                            <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${
                                (i === 0 && passwordStrength === 'weak') ||
                                (i === 1 && passwordStrength === 'medium') ||
                                (i === 2 && passwordStrength === 'strong')
                                ? passwordStrength === 'weak'
                                    ? 'bg-red-500'
                                    : passwordStrength === 'medium'
                                    ? 'bg-amber-500'
                                    : 'bg-green-500'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                            />
                        ))}
                        </div>
                        <p
                        className={`text-xs ${
                            passwordStrength === 'weak'
                            ? 'text-red-600'
                            : passwordStrength === 'medium'
                            ? 'text-amber-600'
                            : 'text-green-600'
                        }`}
                        >
                        Password strength: {passwordStrength}
                        </p>
                    </div>
                    )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm password</label>
                    <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4 text-muted-foreground" />}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10"
                    />

                    {form.confirmPassword && (
                    <div className="flex items-center gap-2 text-xs">
                        {form.password === form.confirmPassword ? (
                        <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-green-700">Passwords match</span>
                        </>
                        ) : (
                        <>
                            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-red-600">Passwords don't match</span>
                        </>
                        )}
                    </div>
                    )}
                </div>
                </div>
            </div>

            {/* Кнопка реєстрації по центру */}
            <div className="flex flex-col items-center space-y-4">
                <div className="flex flex-col md:flex-row gap-3 w-full">
                    <div className="w-full md:flex-1 p-[2px] rounded-lg bg-gradient-to-br from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 transition">
                        <Button onClick={handleSubmit}
                            type="button"
                            className="w-full py-2.5 hover:bg-gradient-to-br hover:from-cyan-600 hover:to-pink-600 hover:text-white"
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            Sign up
                        </Button>
                    </div>

                    <div className="w-full md:flex-1">
                        <Button
                            type="button"
                            variant="btn_primary"
                            className="w-full h-full py-2.5 gap-2"
                            onClick={generatePassword}
                        >
                            <KeyRound className="h-4 w-4" />
                            Generate password
                        </Button>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                    Already have account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-500 font-semibold">
                        Sign in
                    </Link>
                </p>
            </div>
            </div>
        </Card>
        </div>
    );
}