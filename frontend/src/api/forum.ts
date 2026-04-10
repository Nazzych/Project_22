// api/admin.ts
import axios, { API_BASE } from './../../src/lib/config';


// Отримати пости звичайні.
export async function forumList() {
    const response = await axios.get(`${API_BASE}/forum/posts/`);
    return response.data;
}

// Створити пост.
export async function createPost(form: any) {
    const response = await axios.post(`${API_BASE}/forum/post/add/`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Оновити пост.
export async function updatePost(id: number, form: any) {
    const response = await axios.put(`${API_BASE}/forum/post/edit/${id}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Видалити пост.
export async function deletePost(id: number) {
    const response = await axios.delete(`${API_BASE}/forum/post/del/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}


// Отримати пости звичайні.
export async function channelList() {
    const response = await axios.get(`${API_BASE}/forum/channels/`);
    return response.data;
}

// Отримати конкретний канал.
export async function getChannel(id: number) {
    const response = await axios.get(`${API_BASE}/forum/channel/${id}/`);
    return response.data;
}

// Отримати конкретний пост.
export async function getChannelPosts(id: number) {
    const response = await axios.get(`${API_BASE}/forum/channel/${id}/posts/`);
    return response.data;
}

// Створити завдання
export async function createChannel(form: any) {
    const response = await axios.post(`${API_BASE}/forum/channel/add/`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Оновити завдання
export async function updateChannel(id: number, form: any) {
    const response = await axios.put(`${API_BASE}/forum/channel/edit/${id}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Видалити завдання
export async function deleteChannel(id: number) {
    const response = await axios.delete(`${API_BASE}/forum/channel/del/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}

// Отримати коментарі до посту
export async function getPostComments(postId: number) {
    const response = await axios.get(`${API_BASE}/forum/comments/post/${postId}/`, {
        withCredentials: true,
    });
    return response.data;
}

// Створити коментар
export async function createComment(modelName: string, objectId: number, content: string) {
    const response = await axios.post(`${API_BASE}/forum/comment/${modelName}/${objectId}/`, { content }, {
        withCredentials: true,
    });
    return response.data;
}

// Оновити коментар
export async function updateComment(commentId: number, content: string) {
    const response = await axios.put(`${API_BASE}/forum/comment/edit/${commentId}/`, { content }, {
        withCredentials: true,
    });
    return response.data;
}

// Видалити коментар
export async function deleteComment(commentId: number) {
    const response = await axios.delete(`${API_BASE}/forum/comment/del/${commentId}/`, {
        withCredentials: true
    });
    return response.data;
}