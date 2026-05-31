// api/admin.ts
import axios, { API_BASE } from './../../src/lib/config';


//Отримання завдань
export async function getTasks() {
    const response = await axios.get(`${API_BASE}/admin/challenges/`, {
        withCredentials: true,
    });
    return response.data;
}

// Створити завдання
export async function createTask(form: any) {
    const response = await axios.post(`${API_BASE}/admin/challenges/`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Оновити завдання
export async function updateTask(id: string, form: any) {
    const response = await axios.put(`${API_BASE}/admin/challenges/${id}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Видалити завдання
export async function deleteTask(id: string) {
    const response = await axios.delete(`${API_BASE}/admin/challenges/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}

// Отримати всі завдання
export async function getUnapprovedChannels() {
    const response = await axios.get(`${API_BASE}/admin/moderation/channels/pending/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function acceptTask(channelId: number) {
    const response = await axios.put(`${API_BASE}/admin/moderation/channels/${channelId}/approve/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function rejectTask(channelId: number) {
    const response = await axios.put(`${API_BASE}/admin/moderation/channels/${channelId}/reject/`, {
        withCredentials: true,
    });
    return response.data;
}


export async function getCourses() {
    const response = await axios.get(`${API_BASE}/admin/courses/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function createCourse (form: any) {
    const response = await axios.post (`${API_BASE}/admin/courses/`, form, {
        withCredentials: true,
    })
    return response.data;
}

// Оновити курс
export async function updateCourse(id: string, form: any) {
    const response = await axios.put(`${API_BASE}/admin/courses/${id}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

export async function deleteCourse(id: string) {
    const response = await axios.delete(`${API_BASE}/admin/courses/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function createLessons(courseId: number, form: any) {
    const response = await axios.post(`${API_BASE}/admin/courses/${courseId}/lessons/`, form, {
        withCredentials: true,
    });
    return response.data;
}

export async function updateLessons(courseId: number, form: any) {
    const response = await axios.put(`${API_BASE}/admin/courses/${courseId}/lessons/`, form, {
        withCredentials: true,
    });
    return response.data;
}

export async function deleteLesson(courseId: number, lessonId: number) {
    const response = await axios.delete(`${API_BASE}/admin/courses/${courseId}/lessons/${lessonId}/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function projectsList() {
    const response = await axios.get(`${API_BASE}/admin/projects/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function projectUpdate(ProjId: number, form: any) {
    const response = await axios.patch(`${API_BASE}/admin/projects/${ProjId}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

export async function projectDelete(ProjId: number) {
    const response = await axios.delete(`${API_BASE}/admin/projects/${ProjId}/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function usersList() {
    const response = await axios.get(`${API_BASE}/admin/users/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function adminUpdateUser (user_id: number, form: any) {
    const response = await axios.patch(`${API_BASE}/admin/users/${user_id}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

export async function adminDeleteUser (user_id: number) {
    const response = await axios.delete(`${API_BASE}/admin/users/${user_id}/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function adminBanUser (user_id: number, reason: string) {
    const response = await axios.post(`${API_BASE}/admin/users/${user_id}/ban/`, { reason }, {
        withCredentials: true,
    });
    return response.data;
}
