import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useGithubAuth() {
    const navigate = useNavigate();

    const initiateGithubLogin = () => {
        const clientId = "Some_here";//import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUri = encodeURIComponent(window.location.origin + '/github/callback');
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user`;
        window.location.href = githubAuthUrl;
    };

    const handleGithubCallback = async () => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) return;

        try {
            // 🔐 Тут має бути запит до бекенду для обміну code на токен
            const res = await fetch(`/api/github/callback?code=${code}`);
            const data = await res.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
        } catch (error) {
            console.error('GitHub auth failed:', error);
        }
    };

    return { initiateGithubLogin, handleGithubCallback };
}
