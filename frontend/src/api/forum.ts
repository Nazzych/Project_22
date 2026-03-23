// api/admin.ts
import axios, { API_BASE } from './../../src/lib/config';


// Отримати пости звичайні.
export async function forumList() {
    const response = await axios.get(`${API_BASE}/forum/posts`);
    return response.data;
}

// Створити пост.
export async function createPost(form: any) {
    const response = await axios.post(`${API_BASE}/forum/post/add`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Оновити пост.
export async function updatePost(id: number, form: any) {
    const response = await axios.put(`${API_BASE}/forum/post/${id}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Видалити пост.
export async function deletePost(id: string) {
    const response = await axios.delete(`${API_BASE}/forum/post/del/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}


// Отримати пости звичайні.
export async function channelList() {
    const response = await axios.get(`${API_BASE}/forum/channels`);
    return response.data;
}

// Створити завдання
export async function createChannel(form: any) {
    const response = await axios.post(`${API_BASE}/forum/post/add`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Оновити завдання
export async function updateChannel(id: string, form: any) {
    const response = await axios.put(`${API_BASE}/forum/post/${id}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Видалити завдання
export async function deleteChannel(id: string) {
    const response = await axios.delete(`${API_BASE}/forum/post/del/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}
