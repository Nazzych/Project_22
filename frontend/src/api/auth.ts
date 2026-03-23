import axios, { API_BASE } from './../../src/lib/config';
import { LoginPayload, RegisterPayload } from '../types/auth';
import Cookies from 'js-cookie';


export async function checkSession(): Promise<{ authenticated: boolean }> {
    const response = await axios.get(`${API_BASE}/user/check-session/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function getCsrfToken() {
    await axios.get(`${API_BASE}/user/check-csrf/`, { withCredentials: true });
    axios.interceptors.request.use((config) => {
        const token = Cookies.get('csrftoken');
        const method = config.method?.toLowerCase();
        if (token && ['post', 'put', 'patch', 'delete'].includes(method || '')) {
            config.headers['X-CSRFToken'] = token;
        };
        return config;
    });
}


export async function loginApi(payload: LoginPayload) {
    const response = await axios.post(`${API_BASE}/user/login/`, payload, {
        withCredentials: true,
    });
    return response.data;
}

export async function registerApi(payload: RegisterPayload) {
    const response = await axios.post(`${API_BASE}/user/register/`, payload, {
        withCredentials: true,
    });
    return response.data;
}

export async function logOutApi() {
    const response = await axios.post(`${API_BASE}/user/logout/`, {
        withCredentials: true,
    });
    return response.data;
}