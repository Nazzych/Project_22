import { EditableProfile, EditPassword } from '../types/profile';
import axios, { API_BASE } from './../../src/lib/config';


export async function getProfile() {
    const response = await axios.get(`${API_BASE}/user/me/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function updateProfile(data: EditableProfile) {
    const response = await axios.put (`${API_BASE}/user/update/`, data, {
        withCredentials: true,
    });
    return response.data;
}

export async function saveGitHubProfile(data: EditableProfile) {
    const response = await axios.put (`${API_BASE}/user/github/update/`, data, {
        withCredentials: true,
    });
    return response.data;
}

export async function updatePassword (data: EditPassword) {
    const response = await axios.put (`${API_BASE}/user/change-pass/`, data, {
        withCredentials: true,
    });
    return response.data;
}

export async function deleteProfile() {
    const response = await axios.delete(`${API_BASE}/user/delete/`);
    return response.data;
}