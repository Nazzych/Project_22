import { useState } from 'react';
import { Input } from '../../../../ui/Input';
import { Button } from '../../../../ui/Button';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { useToast } from '../../../../../providers/MessageProvider';
import { useModal } from '../../../../../hooks/useModal';
import { getCsrfToken } from '../../../../../api/auth';
import { updatePassword } from '../../../../../api/profile';
import { Lock, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export function ChangePasswordModal() {
    const { closeModal } = useModal();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);

    const passwordSchema = z
        .string()
        .min(8, 'At least 8 characters')
        .regex(/[A-Z]/, 'At least one uppercase letter')
        .regex(/[a-z]/, 'At least one lowercase letter')
        .regex(/[0-9]/, 'At least one number')
        .regex(/[^A-Za-z0-9]/, 'At least one special character');

    const schema = z
        .object({
            old_password: z.string().min(1, 'Current password is required'),
            new_password: passwordSchema,
            confirm_password: z.string(),
        })
        .refine((data) => data.new_password === data.confirm_password, {
            message: 'Passwords do not match',
            path: ['confirm_password'],
        });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
    } = useForm({
        resolver: zodResolver(schema),
    });

    function getPasswordStrength(password: string) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-600' };
        if (score === 3 || score === 4) return { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
        return { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' };
    }

    const newPasswordValue = watch('new_password');
    const confirmPasswordValue = watch('confirm_password');
    const passwordStrength = getPasswordStrength(newPasswordValue || '');
    const passwordsMatch = newPasswordValue && confirmPasswordValue && newPasswordValue === confirmPasswordValue;

    const handleChangePassword = async (data: any) => {
        setLoading(true);
        try {
            await getCsrfToken();
            const res = await updatePassword (data);
            if (res.success) {
                showToast('success', 'Password changed', 'Your password has been updated.');
            } else {
                showToast('warning', `Password not changed - ${res.status}`, 'Happen some trubles. Repeat later');
            }
            closeModal();
        } catch (err) {
            console.error (`Error password changing: ${err}.`)
            showToast('error', 'Change failed', 'Old password may be incorrect or something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-5 m-4">
            <div>
                <Input
                    {...register('old_password')}
                    icon={<KeyRound className="w-4 h-4" />}
                    type="password"
                    placeholder="Current password"
                />
                {errors.old_password && (
                    <p className="text-sm text-red-500 mt-1">{errors.old_password.message}</p>
                )}
            </div>

            <div>
                <Input
                    {...register('new_password')}
                    icon={<Lock className="w-4 h-4" />}
                    type="password"
                    placeholder="New password"
                />
                {errors.new_password && (
                    <p className="text-sm text-red-500 mt-1">{errors.new_password.message}</p>
                )}
                
                {/* Password Strength Indicator */}
                {newPasswordValue && (
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                                    style={{
                                        width: passwordStrength.label === 'Weak' ? '33%' : passwordStrength.label === 'Medium' ? '66%' : '100%',
                                    }}
                                />
                            </div>
                            <span className={`text-sm font-semibold ${passwordStrength.textColor}`}>
                                {passwordStrength.label}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <Input
                    {...register('confirm_password')}
                    icon={<Lock className="w-4 h-4" />}
                    type="password"
                    placeholder="Confirm new password"
                />
                {errors.confirm_password && (
                    <p className="text-sm text-red-500 mt-1">{errors.confirm_password.message}</p>
                )}
                
                {/* Password Match Indicator */}
                {confirmPasswordValue && (
                    <div className="mt-2">
                        {passwordsMatch ? (
                            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                ✓ Passwords match
                            </p>
                        ) : (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                ✗ Passwords do not match
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="btn_secondary" onClick={closeModal}>
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    disabled={loading || isSubmitting || !passwordsMatch}
                >
                    {loading || isSubmitting ? <LoadingSpinner text="Saving..." /> : 'Change Password'}
                </Button>
            </div>
        </form>
    );
}
