import { useState } from 'react';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { LoadingSpinner } from '../../../LoadingSpinner';
import { getCsrfToken } from '../../../../api/auth';
import { useToast } from '../../../../providers/MessageProvider';
import { useModal } from '../../../../hooks/useModal';
import { Mail, Lock, KeyRound } from 'lucide-react';

export function CodeConfirm() {
    const { closeModal } = useModal();
    const { showToast } = useToast();

    const [step, setStep] = useState<0 | 1>(0);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendCode = async () => {
        setLoading(true);
        try {
            await getCsrfToken();
            // TODO: replace with your API call
            await fetch('/api/auth/request-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            showToast('success', 'Code sent', 'Check your email for the confirmation code.');
            setStep(1);
        } catch (err) {
            showToast('error', 'Failed to send code', 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            await getCsrfToken();
            // TODO: replace with your API call
            await fetch('/api/auth/confirm-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, new_password: newPassword }),
            });
            showToast('success', 'Password changed', 'You can now log in with your new password.');
            closeModal();
        } catch (err) {
            showToast('error', 'Reset failed', 'Invalid code or error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-6">
            {step === 0 && (
                <>
                    <div className="flex items-center gap-2 relative">
                        <div className="nz-background-secondary absolute left-1 top-0 h-full w-1.5 rounded-full"></div>
                        <p className="ml-4 text-sm text-muted-foreground">
                            Enter your email and we’ll send you a confirmation code to reset your password.
                        </p>
                    </div>
                    <div className='mx-2'>
                        <Input
                            icon={<Mail className="w-4 h-4" />}
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSendCode} disabled={loading || !email}>
                            {loading ? <LoadingSpinner text="Sending..." /> : 'Send Code'}
                        </Button>
                    </div>
                </>
            )}

            {step === 1 && (
                <>
                    <p className="text-sm text-muted-foreground">
                        Enter the confirmation code sent to <strong>{email}</strong> and choose a new password.
                    </p>
                    <Input
                        icon={<KeyRound className="w-4 h-4" />}
                        placeholder="Confirmation code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <Input
                        icon={<Lock className="w-4 h-4" />}
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <div className="flex justify-between">
                        <Button type="button" variant="btn_secondary" onClick={() => setStep(0)}>
                            Back
                        </Button>
                        <Button onClick={handleResetPassword} disabled={loading || !code || !newPassword}>
                            {loading ? <LoadingSpinner text="Resetting..." /> : 'Reset Password'}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
